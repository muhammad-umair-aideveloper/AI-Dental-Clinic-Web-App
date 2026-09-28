"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import { useLocale, useTranslations } from "next-intl";
import {
  X,
  Send,
  Sparkles,
  PhoneCall,
  CalendarCheck,
  Clock,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  onOpenBookingModal?: () => void;
}

export function ChatPanel({
  isOpen,
  onClose,
  initialPrompt,
  onOpenBookingModal,
}: ChatPanelProps) {
  const locale = useLocale();
  const isUrdu = locale === "ur";
  const t = useTranslations("chat");
  const common = useTranslations("common");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialPromptSent, setInitialPromptSent] = useState(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    append,
  } = useChat({
    api: "/api/chat",
    body: {
      language: locale,
    },
    initialMessages: [
      {
        id: "welcome-msg",
        role: "assistant",
        content: t("welcome"),
      },
    ],
  });

  // Handle external prefill (e.g. clicking "Book This Service")
  useEffect(() => {
    if (isOpen && initialPrompt && !initialPromptSent) {
      setInitialPromptSent(true);
      append({
        role: "user",
        content: `I would like to inquire about booking: ${initialPrompt}`,
      });
    }
  }, [isOpen, initialPrompt, initialPromptSent, append]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickQuestions = [
    t("quick1"),
    t("quick2"),
    t("quick3"),
    t("quick4"),
  ];

  const handleQuickQuestion = (q: string) => {
    append({
      role: "user",
      content: q,
    });
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-msg-" + Date.now(),
        role: "assistant",
        content: t("welcome"),
      },
    ]);
  };

  // Quick date chips for appointment scheduling
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
      {/* Panel container: full screen on mobile, right drawer on desktop */}
      <div className="w-full sm:w-[460px] h-full bg-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 border-l border-[#b2bed6]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#001a4b] via-[#04326d] to-[#001a4b] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg text-white">
              🦷
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading font-bold text-sm tracking-wide text-white !text-white">{t("title")}</h3>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              </div>
              <p className="text-[11px] text-sky-100 font-medium">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              title="Reset Chat"
              className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visual Date & Time Calendar Trigger Strip */}
        {onOpenBookingModal && (
          <div className="bg-[#b2bed6]/25 px-4 py-2 border-b border-[#b2bed6] flex items-center justify-between text-xs">
            <span className="text-[#001a4b] font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#04326d]" />
              {isUrdu ? "کیا آپ تاریخ اور وقت چننا چاہتے ہیں؟" : "Want to pick date & time visually?"}
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBookingModal();
              }}
              className="px-2.5 py-1 rounded-md bg-[#04326d] text-white font-bold text-[11px] hover:bg-[#001a4b] shadow-xs cursor-pointer"
            >
              {isUrdu ? "کیلنڈر کھولیں" : "Open Calendar"}
            </button>
          </div>
        )}

        {/* Emergency Hotline Header Strip */}
        <div className="bg-amber-50 px-4 py-1.5 border-b border-amber-200/80 flex items-center justify-between text-[11px] text-amber-900">
          <span className="flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            Emergency?
          </span>
          <a
            href={`tel:${common("emergencyPhone")}`}
            className="font-bold text-[#04326d] hover:underline flex items-center gap-1"
          >
            <PhoneCall className="w-3 h-3" />
            {common("emergencyPhone")}
          </a>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#b2bed6]/10">
          {messages.map((m) => {
            const isUser = m.role === "user";

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? "bg-[#04326d] text-white rounded-br-xs shadow-soft"
                      : "bg-white text-[#001a4b] border border-[#b2bed6] rounded-bl-xs shadow-xs"
                  }`}
                >
                  <p className={`whitespace-pre-wrap ${isUser ? "text-white font-medium" : "text-[#001a4b]"}`}>{m.content}</p>

                  {/* Render Tool Invocations */}
                  {m.toolInvocations?.map((toolInvocation) => {
                    const { toolName, state } = toolInvocation;

                    if (state === "result") {
                      const { result } = toolInvocation;

                      if (toolName === "bookAppointment") {
                        return (
                          <div
                            key={toolInvocation.toolCallId}
                            className="mt-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1.5"
                          >
                            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>{t("appointmentConfirmed")}</span>
                            </div>
                            <p>
                              <strong>Patient:</strong> {result.patientName}
                            </p>
                            <p>
                              <strong>Date & Time:</strong> {result.date} at{" "}
                              {result.time}
                            </p>
                            <p className="text-[11px] text-emerald-700 pt-1">
                              {t("bookingDetails")}
                            </p>
                          </div>
                        );
                      }

                      if (toolName === "checkAvailability") {
                        return (
                          <div
                            key={toolInvocation.toolCallId}
                            className="mt-2.5 p-3 rounded-xl bg-[#b2bed6]/25 border border-[#b2bed6] text-xs text-[#001a4b]"
                          >
                            <div className="flex items-center gap-1 font-bold text-[#001a4b] mb-1">
                              <CalendarCheck className="w-3.5 h-3.5 text-[#04326d]" />
                              <span>Available slots for {result.date}:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {result.slots?.map((slot: string) => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() =>
                                    append({
                                      role: "user",
                                      content: `I would like to book the slot at ${slot} on ${result.date}`,
                                    })
                                  }
                                  className="px-2 py-1 rounded-md bg-white border border-[#04326d] text-[#04326d] hover:bg-[#04326d] hover:text-white font-bold text-[11px] transition-colors cursor-pointer"
                                >
                                  {slot}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      }
                    }

                    return (
                      <div
                        key={toolInvocation.toolCallId}
                        className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 italic"
                      >
                        <Clock className="w-3.5 h-3.5 animate-spin text-[#04326d]" />
                        <span>Verifying appointment schedule...</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#04326d] p-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Lahore Dental AI is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-white border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {t("suggestedTitle")}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(q)}
                  className="px-2.5 py-1 text-xs bg-[#b2bed6]/25 hover:bg-[#b2bed6]/40 text-[#001a4b] font-medium rounded-lg border border-[#b2bed6] transition-colors text-start cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Date Shortcuts when user wants to book */}
        <div className="px-4 py-2 bg-[#b2bed6]/20 border-t border-[#b2bed6]/50 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-[#001a4b] font-bold uppercase whitespace-nowrap">
            Quick Date:
          </span>
          <button
            type="button"
            onClick={() =>
              append({
                role: "user",
                content: `Can I check available slots for today (${today})?`,
              })
            }
            className="px-2 py-0.5 rounded-md bg-white border border-[#b2bed6] text-[#001a4b] font-semibold hover:border-[#04326d] text-[11px] whitespace-nowrap cursor-pointer"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() =>
              append({
                role: "user",
                content: `Can I check available slots for tomorrow (${tomorrow})?`,
              })
            }
            className="px-2 py-0.5 rounded-md bg-white border border-[#b2bed6] text-[#001a4b] font-semibold hover:border-[#04326d] text-[11px] whitespace-nowrap cursor-pointer"
          >
            Tomorrow
          </button>
          {onOpenBookingModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBookingModal();
              }}
              className="px-2 py-0.5 rounded-md bg-[#04326d] border border-[#04326d] text-white hover:bg-[#001a4b] text-[11px] font-bold whitespace-nowrap cursor-pointer ml-auto"
            >
              📅 Choose Date & Time
            </button>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={t("placeholder")}
              className="flex-1 px-4 py-2.5 text-base rounded-xl border border-[#b2bed6] focus:border-[#04326d] focus:ring-2 focus:ring-[#b2bed6]/40 outline-none transition-all text-[#001a4b] font-sans font-medium"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 rounded-xl bg-[#04326d] hover:bg-[#001a4b] text-white font-semibold shadow-soft transition-all disabled:opacity-50 active:scale-95 cursor-pointer shrink-0 font-sans"
              aria-label={t("send")}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            AI can make mistakes. For medical emergencies call +92 300 1234567.
          </p>
        </div>
      </div>
    </div>
  );
}
