import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { addPatientXRay } from "@/lib/patient-records";
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
    const body = await req.json();

    if (!body.title || !body.category) {
      return NextResponse.json(
        { error: "Title and Category (OPG, Periapical, Bitewing, Intraoral Photo) are required" },
        { status: 400 }
      );
    }

    const newXRay = addPatientXRay(decodedPhone, {
      title: body.title,
      category: body.category,
      date: body.date || new Date().toISOString().split("T")[0],
      url: body.url || (body.category === "OPG" ? "/images/placeholders/sample-opg.svg" : "/images/placeholders/sample-periapical.svg"),
      notes: body.notes || "",
    });

    return NextResponse.json({ success: true, xray: newXRay });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to add X-ray" },
      { status: 500 }
    );
  }
}
