import {
  deleteAppointment,
  updateAppointmentStatus,
  rescheduleAppointment,
  markReminderSent,
  getAllAppointments,
} from "@/lib/supabase";
import { recordNoShow } from "@/lib/patient-records";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 1. Reschedule action
    if (body.action === "reschedule") {
      const { date, time, chair } = body;
      if (!date || !time) {
        return Response.json(
          { error: "Date and time are required for rescheduling" },
          { status: 400 }
        );
      }
      const res = await rescheduleAppointment(id, date, time, chair);
      if (!res.success) {
        return Response.json(
          { error: res.error || "Conflict on chair slot", conflict: res.conflict },
          { status: res.conflict ? 409 : 400 }
        );
      }
      return Response.json({
        success: true,
        message: "Rescheduled successfully with conflict protection",
        updated: res.updated,
      });
    }

    // 2. Reminder Sent action
    if (body.action === "reminder_sent") {
      const success = await markReminderSent(id);
      return Response.json({ success, message: "WhatsApp reminder recorded" });
    }

    // 3. Status Change action
    const { status } = body;
    if (!["confirmed", "completed", "cancelled", "no-show"].includes(status)) {
      return Response.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updated = await updateAppointmentStatus(id, status);
    if (!updated) {
      return Response.json({ error: "Appointment not found" }, { status: 404 });
    }

    // If marked no-show, record on patient profile
    if (status === "no-show") {
      const all = await getAllAppointments();
      const target = all.find((a) => a.id === id);
      if (target && target.phone) {
        recordNoShow(target.phone);
      }
    }

    return Response.json({
      success: true,
      message: `Status updated to ${status}`,
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Failed to update" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteAppointment(id);

    if (!deleted) {
      return Response.json({ error: "Appointment not found" }, { status: 404 });
    }

    return Response.json({ success: true, message: "Appointment deleted" });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Failed to delete" },
      { status: 500 }
    );
  }
}
