import {
  getAllAppointments,
  getAppointmentsForDate,
  insertAppointment,
} from "@/lib/supabase";
import { checkSlotAvailability, createCalendarEvent } from "@/lib/calendar";
import {
  sendEmailConfirmation,
  sendWhatsAppConfirmation,
} from "@/lib/notifications";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (date) {
      // Check availability for a specific date
      const availability = await checkSlotAvailability(date);
      return Response.json(availability);
    }

    // Return all appointments for admin or listing
    const appointments = await getAllAppointments();
    return Response.json({ appointments });
  } catch (error: any) {
    console.error("GET /api/appointments error:", error);
    return Response.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, date, time, reason, language = "en" } = body;

    if (!name || !phone || !date || !time) {
      return Response.json(
        { error: "Name, phone, date, and time are required." },
        { status: 400 }
      );
    }

    // Check slot availability
    const availability = await checkSlotAvailability(date, time);
    if (!availability.isAvailable) {
      return Response.json(
        {
          error: "Selected time slot is already booked.",
          alternativeSlots: availability.alternativeSlots,
        },
        { status: 409 }
      );
    }

    // Save appointment
    const result = await insertAppointment({
      name,
      phone,
      date,
      time,
      reason: reason || "General Checkup & Consultation",
      language,
      status: "confirmed",
    });

    if (!result.success || !result.data) {
      return Response.json({ error: result.error || "Booking failed" }, { status: 500 });
    }

    // Trigger calendar event and notifications in parallel
    Promise.allSettled([
      createCalendarEvent({ name, phone, date, time, reason }),
      sendWhatsAppConfirmation({ name, phone, date, time, reason, language }),
      sendEmailConfirmation({ name, phone, date, time, reason, language }),
    ]).catch((err) => console.error("Notification dispatch error:", err));

    return Response.json(
      {
        success: true,
        appointment: result.data,
        message: "Appointment confirmed successfully!",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/appointments error:", error);
    return Response.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
