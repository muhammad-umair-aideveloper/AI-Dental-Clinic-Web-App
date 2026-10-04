import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllAppointments, getAllInquiries } from "@/lib/supabase";
import { getAllPatientProfiles } from "@/lib/patient-records";
import { verifySessionToken } from "@/lib/auth-crypto";
import { loadAISettings } from "@/lib/ai-knowledge-db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("lahore_dental_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const session = verifySessionToken(token);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    const [appointments, inquiries, patients] = await Promise.all([
      getAllAppointments(),
      getAllInquiries(),
      getAllPatientProfiles(),
    ]);

    const aiSettings = loadAISettings();
    const isApiKeyConfigured = Boolean(process.env.OPENAI_API_KEY);

    return NextResponse.json({
      appointments,
      inquiries,
      patients,
      aiStatus: {
        configured: isApiKeyConfigured,
        provider: aiSettings.instructions.provider || "openai",
        model: aiSettings.instructions.model || "gpt-4o-mini",
        source: "Environment Variable (OPENAI_API_KEY)",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch admin data" },
      { status: 500 }
    );
  }
}
