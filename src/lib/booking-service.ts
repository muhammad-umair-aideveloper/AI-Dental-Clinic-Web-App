import { supabase, AppointmentRecord, inferChair } from "./supabase";
import { checkSlotAvailability, CLINIC_DAILY_SLOTS } from "./calendar";

const globalStore = globalThis as unknown as {
  __lahoreDentalAppointments?: AppointmentRecord[];
};

export interface BookingInput {
  name?: string;
  client_name?: string;
  phone: string;
  date: string;
  time?: string;
  time_slot?: string;
  reason?: string;
  source: "form" | "chatbot";
  language?: string;
}

export interface BookingResult {
  success: boolean;
  status: 201 | 400 | 409 | 500;
  appointment?: AppointmentRecord;
  alternativeSlots?: string[];
  error?: string;
  conflict?: boolean;
}

/**
 * Normalizes input time string to canonical HH:mm (24-hour).
 * Supports HH:mm, HH:mm:ss, H:mm AM/PM, H:mm:ss AM/PM, and H AM/PM.
 * Returns null if invalid or empty. Never falls back to default time.
 */
export function normalizeTimeToHHMM(timeStr: string): string | null {
  if (!timeStr || typeof timeStr !== "string") return null;
  const clean = timeStr.trim().toLowerCase();

  // Anchored regex: supports "14:00", "14:00:00", "2:00 pm", "2:00:00 pm", "2 pm"
  const match = clean.match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*(am|pm)?$/);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const modifier = match[3];

  if (minute < 0 || minute > 59) return null;

  if (modifier === "pm") {
    if (hour < 1 || hour > 12) return null;
    if (hour < 12) hour += 12;
  } else if (modifier === "am") {
    if (hour < 1 || hour > 12) return null;
    if (hour === 12) hour = 0;
  } else {
    // 24-hour format
    if (hour < 0 || hour > 23) return null;
  }

  const paddedHour = hour.toString().padStart(2, "0");
  const paddedMinute = minute.toString().padStart(2, "0");
  return `${paddedHour}:${paddedMinute}`;
}

/**
 * Normalizes Pakistani and international phone numbers to standard E.164.
 * Returns null if invalid.
 */
export function normalizePhone(rawPhone: string): string | null {
  if (!rawPhone || typeof rawPhone !== "string") return null;
  const cleaned = rawPhone.replace(/[\s\-\(\)]/g, "");

  // Local Pakistani formats: 03XXXXXXXXX, 923XXXXXXXXX, 3XXXXXXXXX
  if (/^03[0-9]{9}$/.test(cleaned)) {
    return `+92${cleaned.substring(1)}`;
  }
  if (/^923[0-9]{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }
  if (/^3[0-9]{9}$/.test(cleaned)) {
    return `+92${cleaned}`;
  }

  // International E.164: + followed by 7 to 15 digits
  if (/^\+[1-9]\d{6,14}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

export async function bookAppointmentService(input: BookingInput): Promise<BookingResult> {
  try {
    const patientName = (input.name || input.client_name || "").trim();
    const rawPhone = input.phone || "";
    const date = (input.date || "").trim();
    const rawTime = (input.time || input.time_slot || "").trim();
    const reason = (input.reason || "General Consultation & Checkup").trim();
    const source = input.source === "chatbot" ? "chatbot" : "form";
    const language = input.language || "en";

    // 1. Validation: Name
    if (!patientName || patientName.length < 2) {
      return {
        success: false,
        status: 400,
        error: "Patient name must be at least 2 characters.",
      };
    }

    // 2. Validation: Phone
    const formattedPhone = normalizePhone(rawPhone);
    if (!formattedPhone) {
      return {
        success: false,
        status: 400,
        error: "Please provide a valid contact number (e.g., 0300 1234567 or +92 300 1234567).",
      };
    }

    // 3. Validation: Date format and must not be in the past (Asia/Karachi)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return {
        success: false,
        status: 400,
        error: "Invalid date format. Expected YYYY-MM-DD.",
      };
    }

    const nowKarachi = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(nowKarachi);

    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "";
    const todayKarachi = `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
    const currentHour = parseInt(getPart("hour"), 10);
    const currentMinute = parseInt(getPart("minute"), 10);
    const currentTimeKarachi = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

    if (date < todayKarachi) {
      return {
        success: false,
        status: 400,
        error: "Appointment date cannot be in the past.",
      };
    }

    // 4. Validation: Time normalization
    const normalizedTime = normalizeTimeToHHMM(rawTime);
    if (!normalizedTime) {
      return {
        success: false,
        status: 400,
        error: "Invalid time format. Please select or provide a valid time (e.g. 14:00 or 2:00 PM).",
      };
    }

    // Past time check if booking for today
    if (date === todayKarachi && normalizedTime <= currentTimeKarachi) {
      return {
        success: false,
        status: 400,
        error: `The ${normalizedTime} time slot has already passed for today. Please select a future time slot.`,
      };
    }

    // Operating hours check
    if (!CLINIC_DAILY_SLOTS.includes(normalizedTime)) {
      return {
        success: false,
        status: 400,
        error: `Operating hours are 11:00 to 20:00. ${normalizedTime} is outside working hours.`,
        alternativeSlots: CLINIC_DAILY_SLOTS.slice(0, 3),
      };
    }

    // 5. Check availability via calendar.ts
    const availability = await checkSlotAvailability(date, normalizedTime);
    if (!availability.isAvailable) {
      return {
        success: false,
        status: 409,
        conflict: true,
        error: `Selected time slot ${normalizedTime} on ${date} is already booked.`,
        alternativeSlots: availability.alternativeSlots || [],
      };
    }

    // 6. DB Insertion
    const assignedChair = inferChair(reason);
    const newRecord: AppointmentRecord = {
      id: "apt-" + Math.random().toString(36).substring(2, 9),
      name: patientName,
      phone: formattedPhone,
      date,
      time: normalizedTime,
      reason,
      status: "confirmed",
      chair: assignedChair,
      whatsapp_reminder_sent: false,
      language,
      source,
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      // NOTE: `chair` column is omitted from DB insert payload as schema.sql lacks it
      const { data: inserted, error: dbError } = await supabase
        .from("appointments")
        .insert([
          {
            name: newRecord.name,
            phone: newRecord.phone,
            date: newRecord.date,
            time: newRecord.time,
            reason: newRecord.reason,
            status: "confirmed",
            language: newRecord.language,
            source: newRecord.source,
            reminder_sent: false,
          },
        ])
        .select()
        .single();

      if (dbError) {
        // Postgres Code 23505: Unique violation on (date, time) WHERE status = 'confirmed'
        if (dbError.code === "23505") {
          const freshAvailability = await checkSlotAvailability(date);
          return {
            success: false,
            status: 409,
            conflict: true,
            error: `The ${normalizedTime} slot on ${date} was just confirmed by another patient.`,
            alternativeSlots: freshAvailability.availableSlots.slice(0, 3),
          };
        }

        console.error("[booking-service] Supabase error:", dbError);
        return {
          success: false,
          status: 500,
          error: "Database error occurred while creating appointment.",
        };
      }

      if (inserted) {
        // Ensure time is normalized HH:mm even if Postgres returns HH:mm:ss
        inserted.time = inserted.time.slice(0, 5);
        inserted.chair = assignedChair;
        globalStore.__lahoreDentalAppointments?.unshift(inserted);
        return { success: true, status: 201, appointment: inserted };
      }
    }

    // In-memory demo fallback duplicate check
    const inMemoryStore = globalStore.__lahoreDentalAppointments || [];
    const isDoubleBooked = inMemoryStore.some(
      (a) => a.date === date && a.time.slice(0, 5) === normalizedTime && a.status === "confirmed"
    );

    if (isDoubleBooked) {
      const freshAvailability = await checkSlotAvailability(date);
      return {
        success: false,
        status: 409,
        conflict: true,
        error: `The ${normalizedTime} slot on ${date} was just confirmed by another patient.`,
        alternativeSlots: freshAvailability.availableSlots.slice(0, 3),
      };
    }

    globalStore.__lahoreDentalAppointments = [
      newRecord,
      ...(globalStore.__lahoreDentalAppointments || []),
    ];

    return {
      success: true,
      status: 201,
      appointment: newRecord,
    };
  } catch (err: any) {
    console.error("[booking-service] Unexpected failure:", err);
    return {
      success: false,
      status: 500,
      error: err?.message || "Internal server error occurred.",
    };
  }
}
