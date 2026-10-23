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
import { bookAppointmentService } from "@/lib/booking-service";

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

    const result = await bookAppointmentService({
      name: body.name || body.client_name,
      phone: body.phone,
      date: body.date,
      time: body.time || body.time_slot,
      reason: body.reason,
      source: "form",
      language: body.language || "en",
    });

    if (!result.success || !result.appointment) {
      return Response.json(
        {
          error: result.error || "Booking failed",
          alternativeSlots: result.alternativeSlots || [],
        },
        { status: result.status }
      );
    }

    // Trigger calendar event and notifications in parallel
    const { name, phone, date, time, reason, language } = result.appointment;
    Promise.allSettled([
      createCalendarEvent({ name, phone, date, time, reason }),
      sendWhatsAppConfirmation({ name, phone, date, time, reason, language }),
      sendEmailConfirmation({ name, phone, date, time, reason, language }),
    ]).catch((err) => console.error("Notification dispatch error:", err));

    return Response.json(
      {
        success: true,
        appointment: result.appointment,
        message: "Appointment confirmed successfully!",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/appointments error:", error);
    return Response.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
