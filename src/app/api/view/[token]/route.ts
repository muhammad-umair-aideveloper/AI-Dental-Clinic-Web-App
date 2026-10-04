import { NextResponse } from "next/server";
import { accessSecurePatientLink, revokeSecureLink } from "@/lib/patient-records";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    const res = accessSecurePatientLink(token, ip);

    if (!res.valid) {
      return NextResponse.json(
        {
          error:
            res.error === "expired"
              ? "This secure link has expired."
              : res.error === "no_views_left"
              ? "This secure link has reached its maximum view limit."
              : res.error === "revoked"
              ? "This secure link has been revoked by the clinic."
              : "Invalid or nonexistent record link.",
          code: res.error,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      patient: {
        name: res.patient?.name,
        phone: res.patient?.phone ? res.patient.phone.slice(0, 4) + "••••" + res.patient.phone.slice(-3) : "",
        xrays: res.patient?.xrays || [],
        notes: res.patient?.notes || "",
      },
      metadata: {
        expiresAt: res.record?.expiresAt,
        viewsLeft: res.record?.viewsLeft,
        createdAt: res.record?.createdAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load secure record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const revoked = revokeSecureLink(token);
    return NextResponse.json({ success: revoked, message: "Link revoked" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
