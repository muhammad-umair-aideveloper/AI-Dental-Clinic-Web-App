/**
 * SourceBadge — renders a small badge indicating whether an appointment
 * was booked via the web form or the AI chatbot.
 * Used inside admin-dashboard/page.tsx renderAppointmentCard.
 */
import { Bot, Globe } from "lucide-react";

interface SourceBadgeProps {
  source?: "form" | "chatbot";
}

export function SourceBadge({ source }: SourceBadgeProps) {
  if (source === "chatbot") {
    return (
      <span
        title="Booked via AI Chatbot"
        className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100 uppercase tracking-wide"
      >
        <Bot className="w-2.5 h-2.5" />
        AI
      </span>
    );
  }
  return (
    <span
      title="Booked via Web Form"
      className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100 uppercase tracking-wide"
    >
      <Globe className="w-2.5 h-2.5" />
      Form
    </span>
  );
}
