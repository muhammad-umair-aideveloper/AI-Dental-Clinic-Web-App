import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllAppointments, markReminderSent } from "@/lib/supabase";
import { verifySessionToken } from "@/lib/auth-crypto";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("lahore_dental_session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifySessionToken(token);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const all = await getAllAppointments();

    const tomorrowAppointments = all.filter(
      (a) => a.date === tomorrow && a.status === "confirmed"
    );

    const results = [];

    for (const apt of tomorrowAppointments) {
      await markReminderSent(apt.id);
      const cleanPhone = apt.phone.replace(/[^0-9]/g, "");
      const whatsappPhone = cleanPhone.startsWith("0")
        ? "92" + cleanPhone.slice(1)
        : cleanPhone.startsWith("92")
        ? cleanPhone
        : "92" + cleanPhone;

      const message = `Assalam-o-Alaikum ${apt.name}, this is a reminder from Lahore Dental Clinic for your appointment tomorrow (${apt.date}) at ${apt.time} for ${apt.reason || "Consultation"}. Please reply 1 to confirm or call +92 300 1234567 to reschedule.`;

      results.push({
        id: apt.id,
        name: apt.name,
        phone: apt.phone,
        time: apt.time,
        whatsappUrl: `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`,
      });
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      date: tomorrow,
      reminders: results,
      message: `Successfully processed reminders for ${results.length} patient(s) scheduled for tomorrow.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to trigger bulk reminders" },
      { status: 500 }
    );
  }
}
