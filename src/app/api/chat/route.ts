/**
 * POST /api/chat
 * Handles the dental chatbot conversation via Gemini Interactions API.
 * Rate-limited: 20 requests per IP per minute.
 * No sensitive data logged.
 */

import { callGeminiChat } from "@/lib/gemini";

// Simple in-memory rate limiter (per edge worker instance)
// Assumption: single instance dev; in production Vercel this resets per cold start.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    // Extract IP for rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: "Too many requests. Please wait a moment before sending another message." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.message !== "string") {
      return Response.json({ error: "Invalid request body. 'message' string required." }, { status: 400 });
    }

    // Sanitize: cap message length to prevent abuse
    const userMessage = String(body.message).slice(0, 1000).trim();
    if (!userMessage) {
      return Response.json({ error: "Message cannot be empty." }, { status: 400 });
    }

    const previousInteractionId =
      typeof body.previousInteractionId === "string" ? body.previousInteractionId : undefined;

    const result = await callGeminiChat(userMessage, previousInteractionId);

    return Response.json({
      reply: result.reply,
      interactionId: result.interactionId,
    });
  } catch (err: any) {
    console.error("[POST /api/chat] Error:", err?.message ?? err);
    return Response.json(
      { error: "AI assistant is temporarily unavailable. Please call +92 300 1234567." },
      { status: 500 }
    );
  }
}
