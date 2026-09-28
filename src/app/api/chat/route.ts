import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { insertAppointment } from "@/lib/supabase";
import { checkSlotAvailability, createCalendarEvent } from "@/lib/calendar";
import {
  sendEmailConfirmation,
  sendWhatsAppConfirmation,
} from "@/lib/notifications";
import {
  loadAISettings,
  getEffectiveApiKey,
} from "@/lib/ai-knowledge-db";
import {
  detectLanguage,
  retrieveRelevantKnowledge,
  buildGroundedSystemPrompt,
  generateDynamicKnowledgeResponse,
} from "@/lib/ai-retriever";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local-user";
    const { allowed } = checkRateLimit(ip);

    if (!allowed) {
      return new Response(
        JSON.stringify({
          error:
            "Rate limit reached (max 20 messages per session). Please call our clinic at +92 300 1234567.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages, language = "en" } = await req.json();

    // 1. Load active AI Settings & Company Knowledge from Database
    const settings = loadAISettings();

    // 2. Extract latest user query & detect language style (Roman Urdu, English, Mixed)
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    const detectedLang = detectLanguage(lastUserMsg);

    // 3. Knowledge Retrieval Pipeline
    const retrieved = retrieveRelevantKnowledge(lastUserMsg, settings.knowledge);

    // 4. Build dynamically grounded system prompt
    const groundedSystemPrompt = buildGroundedSystemPrompt(
      settings,
      retrieved,
      detectedLang
    );

    // 5. Check for real AI model API key
    const apiKey = getEffectiveApiKey();

    if (apiKey) {
      try {
        const customOpenAI = createOpenAI({
          apiKey,
          baseURL: settings.instructions.baseUrl || undefined,
        });

        const modelName = settings.instructions.model || "gpt-4o-mini";

        const result = streamText({
          model: customOpenAI(modelName),
          system: groundedSystemPrompt,
          messages,
          tools: {
            checkAvailability: tool({
              description: "Check available appointment slots for a specific date (YYYY-MM-DD)",
              parameters: z.object({
                date: z.string().describe("The date to check in YYYY-MM-DD format"),
              }),
              execute: async ({ date }) => {
                const availability = await checkSlotAvailability(date);
                return {
                  date,
                  available: availability.availableSlots.length > 0,
                  slots: availability.availableSlots,
                };
              },
            }),
            bookAppointment: tool({
              description:
                "Book an appointment once all 5 details (name, phone, date, time, reason) are provided",
              parameters: z.object({
                name: z.string().describe("Full name of patient"),
                phone: z.string().describe("Contact phone or WhatsApp number"),
                date: z.string().describe("Appointment date in YYYY-MM-DD format"),
                time: z.string().describe("Appointment time (e.g. 14:00 or 2:00 PM)"),
                reason: z.string().describe("Dental issue or procedure requested"),
              }),
              execute: async ({ name, phone, date, time, reason }) => {
                const availability = await checkSlotAvailability(date, time);

                if (!availability.isAvailable) {
                  return {
                    status: "busy",
                    message: `The requested time ${time} is unavailable. Nearest available times on ${date} are: ${availability.alternativeSlots?.join(", ") || "11:00, 14:00, 17:00"}. Would any of these work for you?`,
                    suggestedSlots: availability.alternativeSlots,
                  };
                }

                const dbResult = await insertAppointment({
                  name,
                  phone,
                  date,
                  time,
                  reason,
                  language,
                  status: "confirmed",
                });

                await createCalendarEvent({ name, phone, date, time, reason });

                await Promise.allSettled([
                  sendWhatsAppConfirmation({ name, phone, date, time, reason, language }),
                  sendEmailConfirmation({ name, phone, date, time, reason, language }),
                ]);

                return {
                  status: "confirmed",
                  appointmentId: dbResult.data?.id || "APT-" + Date.now().toString().slice(-6),
                  patientName: name,
                  date,
                  time,
                  clinicPhone: settings.knowledge.contactInfo.phone,
                  message:
                    detectedLang === "roman_urdu" || detectedLang === "mixed"
                      ? `Aap ka appointment ${date} ko ${time} baje kamyabi se confirm ho gaya hai! WhatsApp par confirmation bhej di gayi hai.`
                      : `Your appointment for ${name} on ${date} at ${time} is confirmed! Confirmation has been sent to your WhatsApp.`,
                };
              },
            }),
          },
        });

        return result.toDataStreamResponse();
      } catch (aiErr) {
        console.error("[chat route] Real AI model streaming error, falling back to dynamic retriever:", aiErr);
      }
    }

    // 6. Dynamic Knowledge-Grounded Streaming Engine
    // (Used when API key is not yet set or during offline execution)
    const dynamicResponse = generateDynamicKnowledgeResponse(
      lastUserMsg,
      settings,
      retrieved,
      detectedLang
    );

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        // Stream tokens naturally
        const words = dynamicResponse.split(" ");
        for (let i = 0; i < words.length; i++) {
          const word = words[i] + (i < words.length - 1 ? " " : "");
          controller.enqueue(encoder.encode(`0:${JSON.stringify(word)}\n`));
          await new Promise((resolve) => setTimeout(resolve, 25));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vercel-AI-Data-Stream": "v1",
      },
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
