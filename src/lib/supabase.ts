import { createClient } from "@supabase/supabase-js";

export interface AppointmentRecord {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  reason?: string;
  status: "confirmed" | "completed" | "cancelled";
  language?: string;
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

// Global persistent storage across module re-evaluations
const globalStore = globalThis as unknown as {
  __lahoreDentalAppointments?: AppointmentRecord[];
  __lahoreDentalInquiries?: InquiryRecord[];
};

if (!globalStore.__lahoreDentalAppointments) {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  globalStore.__lahoreDentalAppointments = [
    {
      id: "apt-101",
      name: "Tariq Mahmood",
      phone: "03001234567",
      date: today,
      time: "12:00",
      reason: "General Consultation & X-Ray",
      status: "confirmed",
      language: "en",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "apt-102",
      name: "Hina Naveed",
      phone: "03219876543",
      date: today,
      time: "15:00",
      reason: "Scaling & Ultrasonic Polishing",
      status: "confirmed",
      language: "ur",
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: "apt-103",
      name: "Kamran Siddiqui",
      phone: "03335558899",
      date: tomorrow,
      time: "17:00",
      reason: "Single-Visit Root Canal (RCT)",
      status: "confirmed",
      language: "en",
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ];
}

if (!globalStore.__lahoreDentalInquiries) {
  globalStore.__lahoreDentalInquiries = [
    {
      id: "inq-1",
      name: "Usman Ali",
      phone: "03001234567",
      message: "Looking for consultation on Saturday for clear aligners.",
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      status: "unread",
    },
    {
      id: "inq-2",
      name: "Fatima Noor",
      phone: "03451239874",
      message: "Do you have painless options for 7-year-old child cavity filling?",
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      status: "read",
    },
  ];
}

export async function insertAppointment(
  data: Omit<AppointmentRecord, "id"> & { id?: string }
): Promise<{ success: boolean; data?: AppointmentRecord; error?: string }> {
  try {
    const formattedData: AppointmentRecord = {
      id: data.id || "apt-" + Math.random().toString(36).substring(2, 9),
      name: data.name,
      phone: data.phone,
      date: data.date,
      time: data.time.slice(0, 5),
      reason: data.reason || "General Consultation",
      status: data.status || "confirmed",
      language: data.language || "en",
      created_at: data.created_at || new Date().toISOString(),
    };

    if (supabase) {
      const { data: record, error } = await supabase
        .from("appointments")
        .insert([formattedData])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
      } else if (record) {
        return { success: true, data: record };
      }
    }

    // Always mirror to global store
    globalStore.__lahoreDentalAppointments?.unshift(formattedData);
    console.log("[Appointments Repository] Saved appointment:", formattedData);
    return { success: true, data: formattedData };
  } catch (err: any) {
    console.error("Error inserting appointment:", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}

export async function getAllAppointments(): Promise<AppointmentRecord[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("date", { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    }
    return globalStore.__lahoreDentalAppointments || [];
  } catch (err) {
    console.error("Error fetching all appointments:", err);
    return globalStore.__lahoreDentalAppointments || [];
  }
}

export async function updateAppointmentStatus(
  id: string,
  status: "confirmed" | "completed" | "cancelled"
): Promise<boolean> {
  try {
    if (supabase) {
      await supabase.from("appointments").update({ status }).eq("id", id);
    }
    const store = globalStore.__lahoreDentalAppointments;
    if (store) {
      const target = store.find((a) => a.id === id);
      if (target) {
        target.status = status;
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error("Error updating appointment status:", err);
    return false;
  }
}

export async function deleteAppointment(id: string): Promise<boolean> {
  try {
    if (supabase) {
      await supabase.from("appointments").delete().eq("id", id);
    }
    if (globalStore.__lahoreDentalAppointments) {
      globalStore.__lahoreDentalAppointments = globalStore.__lahoreDentalAppointments.filter(
        (a) => a.id !== id
      );
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error deleting appointment:", err);
    return false;
  }
}

export async function getAppointmentsForDate(date: string): Promise<string[]> {
  const all = await getAllAppointments();
  return all
    .filter((a) => a.date === date && a.status === "confirmed")
    .map((a) => a.time.slice(0, 5));
}

// Inquiries repository
export async function insertInquiry(inquiry: {
  name: string;
  phone: string;
  message: string;
}): Promise<InquiryRecord> {
  const newInq: InquiryRecord = {
    id: "inq-" + Math.random().toString(36).substring(2, 9),
    name: inquiry.name,
    phone: inquiry.phone,
    message: inquiry.message,
    created_at: new Date().toISOString(),
    status: "unread",
  };
  globalStore.__lahoreDentalInquiries?.unshift(newInq);
  return newInq;
}

export async function getAllInquiries(): Promise<InquiryRecord[]> {
  return globalStore.__lahoreDentalInquiries || [];
}
