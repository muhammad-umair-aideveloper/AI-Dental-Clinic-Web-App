import { deleteAppointment, updateAppointmentStatus } from "@/lib/supabase";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!["confirmed", "completed", "cancelled"].includes(status)) {
      return Response.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updated = await updateAppointmentStatus(id, status);
    if (!updated) {
      return Response.json({ error: "Appointment not found" }, { status: 404 });
    }

    return Response.json({ success: true, message: `Status updated to ${status}` });
  } catch (error: any) {
    return Response.json({ error: error?.message || "Failed to update" }, { status: 500 });
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
    return Response.json({ error: error?.message || "Failed to delete" }, { status: 500 });
  }
}
