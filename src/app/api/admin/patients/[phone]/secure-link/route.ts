import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSecurePatientLink } from "@/lib/patient-records";
import { verifySessionToken } from "@/lib/auth-crypto";

export async function POST(
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
    const body = await req.json().catch(() => ({}));

    const hours = Number(body.expiresInHours) || 48;
    const views = Number(body.maxViews) || 5;

    const record = createSecurePatientLink(decodedPhone, hours, views);

    return NextResponse.json({
      success: true,
      link: {
        token: record.token,
        url: `/view/${record.token}`,
        expiresAt: record.expiresAt,
        maxViews: record.maxViews,
        viewsLeft: record.viewsLeft,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to generate secure link" },
      { status: 500 }
    );
  }
}
