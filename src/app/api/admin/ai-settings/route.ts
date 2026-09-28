import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth-crypto";
import {
  loadAISettings,
  saveAISettings,
  getMaskedAISettings,
  AISettings,
} from "@/lib/ai-knowledge-db";

async function verifyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("lahore_dental_session")?.value;

  if (!token) return false;
  const payload = verifySessionToken(token);
  return payload && payload.role === "admin";
}

export async function GET() {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required." },
        { status: 403 }
      );
    }

    const maskedSettings = getMaskedAISettings();
    return NextResponse.json({ success: true, settings: maskedSettings });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load AI settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required." },
        { status: 403 }
      );
    }

    const body: AISettings = await req.json();

    if (!body || !body.knowledge || !body.instructions) {
      return NextResponse.json(
        { error: "Invalid AI settings payload." },
        { status: 400 }
      );
    }

    const current = loadAISettings();

    // If apiKey is masked or empty, retain existing secret key
    let finalApiKey = current.instructions.apiKey;
    if (body.instructions.apiKey && !body.instructions.apiKey.includes("••••")) {
      finalApiKey = body.instructions.apiKey.trim();
    }

    const updatedSettings: AISettings = {
      ...body,
      instructions: {
        ...body.instructions,
        apiKey: finalApiKey,
      },
      updated_at: new Date().toISOString(),
    };

    const saved = saveAISettings(updatedSettings);
    if (!saved) {
      return NextResponse.json(
        { error: "Failed to persist AI settings to database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "AI Knowledge & Instructions updated successfully.",
      settings: getMaskedAISettings(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update AI settings" },
      { status: 500 }
    );
  }
}
