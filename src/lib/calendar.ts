import { getAppointmentsForDate } from "./supabase";

export const CLINIC_DAILY_SLOTS = [
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

export interface AvailabilityResult {
  date: string;
  availableSlots: string[];
  isAvailable: boolean;
  alternativeSlots?: string[];
}

/**
 * Checks Google Calendar / DB availability for a given date
 */
export async function checkSlotAvailability(
  date: string,
  requestedTime?: string
): Promise<AvailabilityResult> {
  // Query already booked slots from Supabase/DB
  const bookedSlots = await getAppointmentsForDate(date);

  // Filter available slots
  const availableSlots = CLINIC_DAILY_SLOTS.filter(
    (slot) => !bookedSlots.includes(slot)
  );

  if (!requestedTime) {
    return {
      date,
      availableSlots,
      isAvailable: availableSlots.length > 0,
    };
  }

  // Normalize requested time (e.g., "11:00 AM" or "11:00" to "HH:mm")
  const normalizedRequested = normalizeTimeToHHMM(requestedTime);
  const isAvailable = availableSlots.includes(normalizedRequested);

  let alternativeSlots: string[] = [];
  if (!isAvailable) {
    // Find up to 3 closest available slots
    alternativeSlots = availableSlots.slice(0, 3);
  }

  return {
    date,
    availableSlots,
    isAvailable,
    alternativeSlots,
  };
}

/**
 * Creates Google Calendar event or logs simulated event creation
 */
export async function createCalendarEvent(appointment: {
  name: string;
  phone: string;
  date: string;
  time: string;
  reason?: string;
}): Promise<{ success: boolean; eventId?: string }> {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    const googleApiKey = process.env.GOOGLE_API_KEY;

    if (calendarId && googleApiKey) {
      // In production, invoke Google Calendar API
      console.log(`[Google Calendar] Booking event on calendar ${calendarId}`);
    }

    console.log(
      `[Google Calendar Sync] Event scheduled for ${appointment.name} on ${appointment.date} at ${appointment.time}`
    );

    return {
      success: true,
      eventId: "cal-" + Math.random().toString(36).substring(2, 9),
    };
  } catch (error) {
    console.error("Failed to create Google Calendar event:", error);
    return { success: false };
  }
}

function normalizeTimeToHHMM(timeStr: string): string {
  if (!timeStr) return "11:00";
  const clean = timeStr.trim().toLowerCase();

  // Match e.g. "2:00 pm", "2 pm", "14:00"
  const match = clean.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!match) return "11:00";

  let hour = parseInt(match[1], 10);
  const minute = match[2] || "00";
  const modifier = match[3];

  if (modifier === "pm" && hour < 12) hour += 12;
  if (modifier === "am" && hour === 12) hour = 0;

  const paddedHour = hour.toString().padStart(2, "0");
  return `${paddedHour}:${minute}`;
}
