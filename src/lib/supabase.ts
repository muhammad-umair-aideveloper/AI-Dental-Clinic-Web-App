import { createClient } from "@supabase/supabase-js";

export interface AppointmentRecord {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  reason?: string;
  status: "confirmed" | "completed" | "cancelled" | "no-show";
  chair?: "chair-1" | "chair-2";
  whatsapp_reminder_sent?: boolean;
  reminder_sent_at?: string;
  source?: "form" | "chatbot";
  language?: string;
  whatsapp_consent?: boolean;
  created_at?: string;
}

export interface InquiryRecord {
  id: string;
  name: string;
  phone: string;
  message: string;
  created_at: string;
  status: "unread" | "read" | "resolved";
}

export interface PatientRecord {
  phone: string;
  name: string;
  email?: string;
  notes: string;
  noShowCount: number;
  advanceTokenRequired: boolean;
  createdAt: string;
  xrays: XRayRecord[];
}

export interface XRayRecord {
  id: string;
  title: string;
  category: "OPG" | "Periapical" | "Bitewing" | "Intraoral Photo";
  date: string;
  url: string;
  notes?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, { auth: { persistSession: false } })
  : null;

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set the required server environment variables.");
  }
  return supabase;
}

export function inferChair(reason?: string): "chair-1" | "chair-2" {
  if (!reason) return "chair-2";
  const value = reason.toLowerCase();
  return value.includes("implant") ||
    value.includes("root canal") ||
    value.includes("rct") ||
    value.includes("surgical") ||
    value.includes("extraction") ||
    value.includes("surgery")
    ? "chair-1"
    : "chair-2";
}

export async function upsertPatient(patient: {
  phone: string;
  name: string;
  email?: string;
}): Promise<void> {
  const { error } = await requireSupabase().from("patients").upsert(
    {
      phone: patient.phone,
      name: patient.name,
      ...(patient.email ? { email: patient.email } : {}),
    },
    { onConflict: "phone" }
  );
  if (error) throw new Error(`Failed to save patient: ${error.message}`);
}

export async function insertAppointment(
  data: Omit<AppointmentRecord, "id"> & { id?: string }
): Promise<{ success: boolean; data?: AppointmentRecord; error?: string }> {
  try {
    const client = requireSupabase();
    const { data: record, error } = await client
      .from("appointments")
      .insert({
        ...(data.id ? { id: data.id } : {}),
        name: data.name,
        phone: data.phone,
        patient_phone: data.phone,
        date: data.date,
        time: data.time.slice(0, 5),
        reason: data.reason || "General Consultation",
        status: data.status || "confirmed",
        chair: data.chair || inferChair(data.reason),
        whatsapp_reminder_sent: data.whatsapp_reminder_sent ?? false,
        reminder_sent_at: data.reminder_sent_at || null,
        source: data.source || "form",
        language: data.language || "en",
        whatsapp_consent: data.whatsapp_consent ?? false,
        ...(data.created_at ? { created_at: data.created_at } : {}),
      })
      .select()
      .single();

    if (error) {
      console.error("[supabase] Insert appointment failed:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: record as AppointmentRecord };
  } catch (error) {
    console.error("[supabase] Insert appointment failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Database error" };
  }
}

export async function getAllAppointments(): Promise<AppointmentRecord[]> {
  const { data, error } = await requireSupabase()
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to fetch appointments: ${error.message}`);
  return (data || []).map((appointment) => ({
    ...appointment,
    time: appointment.time?.slice(0, 5),
  })) as AppointmentRecord[];
}

export async function updateAppointmentStatus(
  id: string,
  status: "confirmed" | "completed" | "cancelled" | "no-show"
): Promise<boolean> {
  const { data, error } = await requireSupabase()
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Failed to update appointment: ${error.message}`);
  return Boolean(data);
}

export async function rescheduleAppointment(
  id: string,
  newDate: string,
  newTime: string,
  newChair?: "chair-1" | "chair-2"
): Promise<{ success: boolean; conflict?: boolean; error?: string; updated?: AppointmentRecord }> {
  try {
    const client = requireSupabase();
    const { data: target, error: findError } = await client
      .from("appointments")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (findError) throw findError;
    if (!target) return { success: false, error: "Appointment not found" };

    const chair = newChair || target.chair || inferChair(target.reason);
    const cleanTime = newTime.slice(0, 5);
    const { data: conflict, error: conflictError } = await client
      .from("appointments")
      .select("id")
      .eq("date", newDate)
      .eq("time", cleanTime)
      .eq("status", "confirmed")
      .eq("chair", chair)
      .neq("id", id)
      .maybeSingle();
    if (conflictError) throw conflictError;
    if (conflict) {
      return {
        success: false,
        conflict: true,
        error: `Schedule conflict: ${chair === "chair-1" ? "Chair 1 (Surgical/RCT)" : "Chair 2 (General/Scaling)"} is already booked at ${cleanTime} on ${newDate}.`,
      };
    }

    const { data: updated, error } = await client
      .from("appointments")
      .update({ date: newDate, time: cleanTime, chair })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, updated: updated as AppointmentRecord };
  } catch (error) {
    console.error("[supabase] Reschedule appointment failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to reschedule" };
  }
}

export async function markReminderSent(id: string): Promise<boolean> {
  const reminderSentAt = new Date().toISOString();
  const { data, error } = await requireSupabase()
    .from("appointments")
    .update({ whatsapp_reminder_sent: true, reminder_sent_at: reminderSentAt })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Failed to mark reminder: ${error.message}`);
  return Boolean(data);
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const { data, error } = await requireSupabase()
    .from("appointments")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Failed to delete appointment: ${error.message}`);
  return Boolean(data);
}

export async function getAppointmentsForDate(date: string): Promise<string[]> {
  const { data, error } = await requireSupabase()
    .from("appointments")
    .select("time")
    .eq("date", date)
    .eq("status", "confirmed");
  if (error) throw new Error(`Failed to check appointment availability: ${error.message}`);
  return (data || []).map((appointment) => appointment.time.slice(0, 5));
}

export async function insertInquiry(inquiry: {
  name: string;
  phone: string;
  message: string;
}): Promise<InquiryRecord> {
  const { data, error } = await requireSupabase()
    .from("inquiries")
    .insert({
      name: inquiry.name,
      phone: inquiry.phone,
      message: inquiry.message,
      status: "unread",
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to save inquiry: ${error.message}`);
  return data as InquiryRecord;
}

export async function getAllInquiries(): Promise<InquiryRecord[]> {
  const { data, error } = await requireSupabase()
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to fetch inquiries: ${error.message}`);
  return (data || []) as InquiryRecord[];
}
