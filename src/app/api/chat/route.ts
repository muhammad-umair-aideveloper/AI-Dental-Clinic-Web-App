import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { insertAppointment } from "@/lib/supabase";
import { checkSlotAvailability, createCalendarEvent } from "@/lib/calendar";
import {
  sendEmailConfirmation,
  sendWhatsAppConfirmation,
} from "@/lib/notifications";

export const maxDuration = 30;

const CLINIC_PHONE = "+92 300 1234567";

const SYSTEM_PROMPT = `You are the friendly AI assistant for Lahore Dental, a dental clinic in Lahore, Pakistan.

LANGUAGE RULES:
- Detect the user's language from their message.
- Reply in the SAME language: English, Urdu (اردو), or Roman Urdu.
- If unsure, default to English.

YOUR JOB:
1. Answer dental FAQs warmly and briefly (max 3 lines).
2. Never give a medical diagnosis. Always recommend visiting the dentist.
3. For appointment requests, collect in this order:
   - Full name
   - Phone number
   - Preferred date
   - Preferred time
   - Reason for visit
4. Once all 5 are collected, call the \`bookAppointment\` tool.
5. If the user reports severe pain, swelling, bleeding, or trauma, immediately tell them to call the clinic at ${CLINIC_PHONE} and mark it as an emergency.
6. Never discuss competitors, prices beyond the provided range, or anything outside dental care and this clinic.

PRICE RANGES (PKR):
- Consultation & Digital X-Ray: Rs. 1,500
- Scaling & Polishing: Rs. 3,500 - 5,000
- Single-visit Root Canal (RCT): Rs. 12,000 - 18,000
- Teeth Whitening (Laser): Rs. 15,000 - 25,000
- Dental Implants: From Rs. 55,000
- Braces & Clear Aligners: Rs. 75,000 - 250,000
- Kids Dentistry: From Rs. 2,000

CLINIC DETAILS:
- Address: Plaza 42-B, Main Boulevard, Gulberg III, Lahore, Pakistan
- Hours: Monday to Saturday, 11:00 AM to 09:00 PM (Sunday emergency only)
- Phone/WhatsApp: ${CLINIC_PHONE}

TONE: Warm, professional, concise. Use simple words.`;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local-user";
    const { allowed, remaining } = checkRateLimit(ip);

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

    const apiKey = process.env.OPENAI_API_KEY;

    // Fallback simulated intelligent streaming response if OpenAI API key is missing
    if (!apiKey) {
      return handleOfflineMockStream(messages, language);
    }

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: SYSTEM_PROMPT,
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
            // Check Google Calendar / slot availability
            const availability = await checkSlotAvailability(date, time);

            if (!availability.isAvailable) {
              return {
                status: "busy",
                message: `The requested time ${time} is unavailable. Nearest available times on ${date} are: ${availability.alternativeSlots?.join(", ") || "11:00, 14:00, 17:00"}. Would any of these work for you?`,
                suggestedSlots: availability.alternativeSlots,
              };
            }

            // Insert into Supabase
            const dbResult = await insertAppointment({
              name,
              phone,
              date,
              time,
              reason,
              language,
              status: "confirmed",
            });

            // Schedule Google Calendar event
            await createCalendarEvent({ name, phone, date, time, reason });

            // Send WhatsApp and Email confirmations
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
              clinicPhone: CLINIC_PHONE,
              message:
                language === "ur"
                  ? `آپ کا وقت ${date} کو ${time} بجے کامیابی سے بک ہو گیا ہے۔ تصدیقی پیغام واٹس ایپ پر ارسال کر دیا گیا ہے۔`
                  : `Your appointment for ${name} on ${date} at ${time} is confirmed! Confirmation has been sent to your WhatsApp.`,
            };
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * High-fidelity fallback streaming handler for demo mode when OPENAI_API_KEY is not set
 */
function handleOfflineMockStream(messages: any[], language: string) {
  const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
  let responseText = "";

  const isUrdu =
    language === "ur" ||
    /[\u0600-\u06FF]/.test(lastUserMsg) ||
    lastUserMsg.includes("apna") ||
    lastUserMsg.includes("dant") ||
    lastUserMsg.includes("dard");

  if (
    lastUserMsg.includes("emergency") ||
    lastUserMsg.includes("severe") ||
    lastUserMsg.includes("dard") ||
    lastUserMsg.includes("blood") ||
    lastUserMsg.includes("pain") ||
    lastUserMsg.includes("درد") ||
    lastUserMsg.includes("خون")
  ) {
    responseText = isUrdu
      ? `🚨 اگر آپ کو شدید درد، خون بہنے یا ایمرجنسی کا سامنا ہے، تو برائے مہربانی فوری طور پر ہماری ایمرجنسی ہاٹ لائن پر کال کریں:\n📞 ${CLINIC_PHONE}\nہمارا عملہ فوری رہنمائی فراہم کرے گا۔`
      : `🚨 For severe dental pain, bleeding, or emergency trauma, please call our clinic immediately at ${CLINIC_PHONE}. Our emergency dental team is on standby to assist you.`;
  } else if (
    lastUserMsg.includes("price") ||
    lastUserMsg.includes("cost") ||
    lastUserMsg.includes("fees") ||
    lastUserMsg.includes("fee") ||
    lastUserMsg.includes("کتنے") ||
    lastUserMsg.includes("خرچہ")
  ) {
    responseText = isUrdu
      ? `لاہور ڈینٹل کی فیسیں:\n• معائنہ: 1,500 روپے\n• دانتوں کی صفائی (Scaling): 3,500 سے 5,000 روپے\n• روٹ کینال: 12,000 سے 18,000 روپے\nکیا آپ معائنے کے لیے وقت بک کروانا چاہیں گے؟`
      : `Our standard pricing:\n• Consultation & X-ray: Rs. 1,500\n• Scaling & Polishing: Rs. 3,500 - 5,000\n• Root Canal (RCT): Rs. 12,000 - 18,000\nWould you like me to book a checkup for you?`;
  } else if (
    lastUserMsg.includes("book") ||
    lastUserMsg.includes("appointment") ||
    lastUserMsg.includes("وقت") ||
    lastUserMsg.includes("بک")
  ) {
    responseText = isUrdu
      ? `وقت بک کرنے کے لیے برائے مہربانی اپنا مکمل نام، فون نمبر، پسندیدہ تاریخ اور وقت بتائیں۔`
      : `I'd love to help you book an appointment! Please provide your full name, phone number, preferred date, and preferred time.`;
  } else {
    responseText = isUrdu
      ? `السلام علیکم! میں لاہور ڈینٹل کا اسسٹنٹ ہوں۔ آپ مجھ سے دانتوں کے علاج، فیس، یا ڈاکٹر سے وقت بک کرنے کے متعلق پوچھ سکتے ہیں۔`
      : `Welcome to Lahore Dental! I can help you with dental inquiries, treatment pricing, or booking an appointment with Dr. Sarah. How can I assist you today?`;
  }

  // Format as Vercel AI SDK text stream (protocol: 0:"<chunk>\n")
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const chunks = responseText.split(" ");
      for (const chunk of chunks) {
        controller.enqueue(
          encoder.encode(`0:${JSON.stringify(chunk + " ")}\n`)
        );
        await new Promise((resolve) => setTimeout(resolve, 35));
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
}
