/**
 * Gemini chatbot engine for Lahore Dental Clinic.
 * Uses the Interactions API (POST https://generativelanguage.googleapis.com/v1beta/interactions).
 * model: gemini-3.8-flash
 * Three tools: get_prices, get_available_slots, book_appointment (two-step HMAC confirmation).
 * No npm packages beyond Node built-ins -- uses fetch + crypto.
 */

import crypto from "crypto";
import { SYSTEM_PROMPT_TEMPLATE } from "@/config/chatbot-prompt";
import { TREATMENT_PRICES, CLINIC_CLOSED_DATES } from "@/config/booking";
import { checkSlotAvailability } from "@/lib/calendar";
import { bookAppointmentService } from "@/lib/booking-service";
import { createCalendarEvent } from "@/lib/calendar";
import { sendWhatsAppConfirmation, sendEmailConfirmation } from "@/lib/notifications";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const INTERACTIONS_URL =
  "https://generativelanguage.googleapis.com/v1beta/interactions";
const MODEL = "gemini-3.8-flash";
const MAX_TOOL_LOOPS = 5;
// Set to false to opt out of server-side storage (Interactions API store param).
const STORE_INTERACTIONS = true;

// Derive a separate key for pending-booking HMAC tokens.
const AUTH_SECRET =
  process.env.AUTH_SECRET ?? "lahore-dental-super-secure-auth-secret-key-2026";
const BOOKING_TOKEN_KEY = crypto
  .createHmac("sha256", AUTH_SECRET)
  .update("chat-booking-v1")
  .digest();
const BOOKING_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ─────────────────────────────────────────────
// Karachi time helpers
// ─────────────────────────────────────────────
function getKarachiDateParts() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  return {
    todayDate: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: parts.weekday,
    hour: parseInt(parts.hour, 10),
    minute: parseInt(parts.minute, 10),
  };
}

function buildSystemPrompt(): string {
  const { todayDate, weekday } = getKarachiDateParts();
  return SYSTEM_PROMPT_TEMPLATE.replace("{TODAY_DATE}", todayDate).replace(
    "{TODAY_WEEKDAY}",
    weekday
  );
}

// ─────────────────────────────────────────────
// HMAC token for pending booking
// ─────────────────────────────────────────────
interface PendingBookingArgs {
  name: string;
  phone: string;
  date: string;
  time: string;
  reason: string;
}

function signPendingBooking(args: PendingBookingArgs, turnNumber: number): string {
  const payload = {
    ...args,
    turnNumber,
    exp: Date.now() + BOOKING_TOKEN_TTL_MS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", BOOKING_TOKEN_KEY)
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifyPendingBooking(token: string): PendingBookingArgs | null {
  try {
    if (!token || !token.includes(".")) return null;
    const [payloadB64, sig] = token.split(".");
    const expectedSig = crypto
      .createHmac("sha256", BOOKING_TOKEN_KEY)
      .update(payloadB64)
      .digest("base64url");
    // Timing-safe compare (same-length base64url strings)
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (Date.now() > payload.exp) return null;
    return {
      name: payload.name,
      phone: payload.phone,
      date: payload.date,
      time: payload.time,
      reason: payload.reason,
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Tool declarations for the Interactions API
// ─────────────────────────────────────────────
const TOOL_DECLARATIONS = [
  {
    name: "get_prices",
    description:
      "Returns the clinic treatment menu with approximate starting prices in PKR. Call this when a user asks about prices, costs, or available treatments.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_available_slots",
    description:
      "Returns available appointment time slots for a given date (YYYY-MM-DD). Call this before attempting to book to show the user open slots.",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "The date to check in YYYY-MM-DD format (Asia/Karachi timezone).",
        },
      },
      required: ["date"],
    },
  },
  {
    name: "book_appointment",
    description:
      "Step A: Validates booking arguments and returns a pendingBookingToken + summary for user confirmation. Does NOT create the appointment yet. After the user confirms, include confirmBooking=true and the pendingBookingToken in the next call.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Patient full name." },
        phone: {
          type: "string",
          description: "Pakistani phone number (e.g. 03001234567 or +923001234567).",
        },
        date: {
          type: "string",
          description: "Appointment date in YYYY-MM-DD format.",
        },
        time: {
          type: "string",
          description: "Appointment time in HH:mm 24-hour format (e.g. 14:00).",
        },
        reason: {
          type: "string",
          description: "Treatment reason (e.g. Scaling, Root Canal, Consultation).",
        },
        confirmBooking: {
          type: "boolean",
          description: "Set to true only when the user has explicitly confirmed. Default false.",
        },
        pendingBookingToken: {
          type: "string",
          description:
            "The HMAC token returned by the previous Step A call. Required when confirmBooking is true.",
        },
      },
      required: ["name", "phone", "date", "time", "reason"],
    },
  },
];

// ─────────────────────────────────────────────
// Tool executor
// ─────────────────────────────────────────────
async function executeTool(
  name: string,
  args: Record<string, unknown>,
  turnNumber: number
): Promise<unknown> {
  // Safety: treat args as untrusted
  if (name === "get_prices") {
    const items = Object.entries(TREATMENT_PRICES).map(([treatment, info]) => ({
      treatment,
      startingPricePkr: info.pkr,
      note: info.note,
      noteUr: info.noteUr,
    }));
    return {
      status: "ok",
      currency: "PKR",
      disclaimer: "Prices are approximate starting prices. Final price depends on clinical assessment.",
      treatments: items,
    };
  }

  if (name === "get_available_slots") {
    const date = String(args.date ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { status: "error", error: "Invalid date format. Use YYYY-MM-DD." };
    }
    // Closed date check
    if (CLINIC_CLOSED_DATES.includes(date)) {
      return { status: "closed", date, message: "The clinic is closed on this date." };
    }
    try {
      const availability = await checkSlotAvailability(date);
      return {
        status: "ok",
        date,
        availableSlots: availability.availableSlots,
        totalSlots: availability.availableSlots.length,
      };
    } catch {
      return { status: "error", error: "Unable to fetch availability." };
    }
  }

  if (name === "book_appointment") {
    const name = String(args.name ?? "").trim();
    const phone = String(args.phone ?? "").trim();
    const date = String(args.date ?? "").trim();
    const time = String(args.time ?? "").trim();
    const reason = String(args.reason ?? "General Consultation").trim();
    const confirmBooking = Boolean(args.confirmBooking);
    const pendingToken = String(args.pendingBookingToken ?? "");

    // Validate
    if (!name || name.length < 2) return { status: "error", error: "Patient name too short." };
    if (!phone) return { status: "error", error: "Phone number required." };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { status: "error", error: "Date must be YYYY-MM-DD." };
    if (!/^\d{1,2}:\d{2}$/.test(time)) return { status: "error", error: "Time must be HH:mm." };

    // Closed date check
    if (CLINIC_CLOSED_DATES.includes(date)) {
      return { status: "error", error: `The clinic is closed on ${date}.` };
    }

    // ── STEP A: issue pending token (user has not confirmed yet) ──
    if (!confirmBooking) {
      const token = signPendingBooking({ name, phone, date, time, reason }, turnNumber);
      return {
        status: "awaiting_user_confirmation",
        summary: { name, phone, date, time, reason },
        pendingBookingToken: token,
        instruction:
          "Show the summary to the user and ask them to confirm. Set confirmBooking=true with this token once they agree.",
      };
    }

    // ── STEP B: user confirmed — verify token and book ──
    const verified = verifyPendingBooking(pendingToken);
    if (!verified) {
      return {
        status: "error",
        error: "Confirmation token is invalid or expired. Please start over.",
      };
    }

    // Use args from verified token (not from model args) to prevent tampering
    const result = await bookAppointmentService({
      name: verified.name,
      phone: verified.phone,
      date: verified.date,
      time: verified.time,
      reason: verified.reason,
      source: "chatbot",
      language: "en",
    });

    if (result.success && result.appointment) {
      const apt = result.appointment;
      // Fire side effects (same as form route) — failures do not fail the booking
      Promise.allSettled([
        createCalendarEvent({ name: apt.name, phone: apt.phone, date: apt.date, time: apt.time, reason: apt.reason }),
        sendWhatsAppConfirmation({ name: apt.name, phone: apt.phone, date: apt.date, time: apt.time, reason: apt.reason, language: apt.language }),
        sendEmailConfirmation({ name: apt.name, phone: apt.phone, date: apt.date, time: apt.time, reason: apt.reason, language: apt.language }),
      ]).catch((e) => console.error("[chat] Notification dispatch error:", e));

      return {
        status: "booked",
        appointment: {
          id: apt.id,
          name: apt.name,
          phone: apt.phone,
          date: apt.date,
          time: apt.time,
          reason: apt.reason,
        },
        message: "Appointment confirmed! A WhatsApp confirmation has been sent.",
      };
    }

    return {
      status: result.status === 409 ? "conflict" : "error",
      error: result.error ?? "Booking failed.",
      alternativeSlots: result.alternativeSlots,
    };
  }

  return { status: "error", error: `Unknown tool: ${name}` };
}

// ─────────────────────────────────────────────
// Public interface
// ─────────────────────────────────────────────
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  interactionId: string;
}

/**
 * Main chat function — calls the Interactions API with the tool loop.
 */
export async function callGeminiChat(
  userMessage: string,
  previousInteractionId?: string
): Promise<ChatResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const systemPrompt = buildSystemPrompt();

  // Build request body for the Interactions API
  const requestBody: Record<string, unknown> = {
    model: MODEL,
    input: userMessage,
    system_instruction: systemPrompt,
    store: STORE_INTERACTIONS,
    tools: [{ function_declarations: TOOL_DECLARATIONS }],
  };

  if (previousInteractionId) {
    requestBody.previous_interaction_id = previousInteractionId;
  }

  let turnNumber = 0;
  let currentInteractionId = "";
  let finalReply = "";

  for (let loop = 0; loop < MAX_TOOL_LOOPS; loop++) {
    const res = await fetch(INTERACTIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[gemini] API error:", res.status, errText);
      throw new Error(`Gemini API error ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();

    // Extract interaction ID
    const interactionId: string = data.id ?? data.interaction?.id ?? "";
    if (interactionId) currentInteractionId = interactionId;

    // Extract steps from the response
    const steps: Array<{ type?: string; function_call?: { name: string; args: Record<string, unknown> }; output_text?: string; text?: string }> =
      data.steps ?? data.interaction?.steps ?? [];

    // Collect function_calls from this response
    const functionCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
    let textOutput = "";

    for (const step of steps) {
      if (step.type === "function_call" && step.function_call) {
        functionCalls.push(step.function_call);
      } else if (step.type === "model_output" || step.type === "output_text") {
        textOutput = step.output_text ?? step.text ?? textOutput;
      }
    }

    // Also check top-level output_text
    if (!textOutput && data.output_text) textOutput = data.output_text;

    // If no function calls, we have the final reply
    if (functionCalls.length === 0) {
      finalReply = textOutput;
      break;
    }

    // Execute ALL function calls returned in this step
    // get_prices and get_available_slots run in parallel; book_appointment runs alone after.
    const nonBookCalls = functionCalls.filter((fc) => fc.name !== "book_appointment");
    const bookCalls = functionCalls.filter((fc) => fc.name === "book_appointment");

    const toolResults: Array<{ name: string; result: unknown }> = [];

    // Parallel: non-booking tools
    if (nonBookCalls.length > 0) {
      const parallelResults = await Promise.all(
        nonBookCalls.map((fc) => executeTool(fc.name, fc.args, turnNumber))
      );
      nonBookCalls.forEach((fc, i) => {
        toolResults.push({ name: fc.name, result: parallelResults[i] });
      });
    }

    // Serial: at most one book_appointment
    if (bookCalls.length > 0) {
      const bookResult = await executeTool("book_appointment", bookCalls[0].args, turnNumber);
      toolResults.push({ name: "book_appointment", result: bookResult });
    }

    turnNumber++;

    // Build next request with tool results as function_results
    const functionResultsInput = toolResults.map((tr) => ({
      type: "function_result",
      function_result: {
        name: tr.name,
        result: tr.result,
      },
    }));

    // For the tool-result round trip, we chain using previous_interaction_id
    const nextBody: Record<string, unknown> = {
      model: MODEL,
      input: functionResultsInput,
      system_instruction: systemPrompt,
      store: STORE_INTERACTIONS,
      tools: [{ function_declarations: TOOL_DECLARATIONS }],
      previous_interaction_id: currentInteractionId,
    };

    // Replace request body for next iteration
    Object.assign(requestBody, nextBody);
    // Clear previous_interaction_id override since it's now set from currentInteractionId
    delete requestBody.previous_interaction_id;
    requestBody.previous_interaction_id = currentInteractionId;
  }

  if (!finalReply) {
    finalReply = "I'm sorry, I had trouble processing that. Please try again or call +92 300 1234567.";
  }

  return {
    reply: finalReply,
    interactionId: currentInteractionId,
  };
}
