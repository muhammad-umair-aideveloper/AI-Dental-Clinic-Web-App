import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updatePatientProfile, recordNoShow } from "@/lib/patient-records";
import { verifySessionToken } from "@/lib/auth-crypto";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("lahore_dental_session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifySessionToken(token);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const { phone } = await params;
    const decodedPhone = decodeURIComponent(phone);
    const body = await req.json();

    if (body.action === "mark_no_show") {
      const res = recordNoShow(decodedPhone);
      return NextResponse.json({
        success: true,
        patient: res.patient,
        thresholdReached: res.thresholdReached,
      });
    }

    const updated = updatePatientProfile(decodedPhone, {
      notes: body.notes,
      advanceTokenRequired: body.advanceTokenRequired,
      email: body.email,
      name: body.name,
    });

    if (!updated) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, patient: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update patient" },
      { status: 500 }
    );
  }
}
