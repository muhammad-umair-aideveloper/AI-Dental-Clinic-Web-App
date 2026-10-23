"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Bot,
  RefreshCw,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const WELCOME_EN =
  "Assalam-o-Alaikum! I'm the AI assistant for Lahore Dental. I can help you with prices, available slots, and booking appointments. How can I help you today?";
const WELCOME_UR =
  "السلام علیکم! میں لاہور ڈینٹل کا AI اسسٹنٹ ہوں۔ قیمتیں، دستیاب اوقات اور اپوائنٹمنٹ بکنگ میں مدد کر سکتا ہوں۔ آج میں آپ کی کیسے مدد کروں؟";

export function GeminiChatWidget() {
  const locale = useLocale();
  const isUrdu = locale === "ur";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [previousInteractionId, setPreviousInteractionId] = useState<
    string | undefined
  >(undefined);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialized = useRef(false);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initialize with welcome message on first open
  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      hasInitialized.current = true;
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: isUrdu ? WELCOME_UR : WELCOME_EN,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, isUrdu]);

  const handleReset = () => {
    setMessages([]);
    setPreviousInteractionId(undefined);
    setError(null);
    hasInitialized.current = false;
    // Trigger welcome message again
    setTimeout(() => {
      setMessages([
        {
          id: "welcome-" + Date.now(),
          role: "assistant",
          content: isUrdu ? WELCOME_UR : WELCOME_EN,
          timestamp: new Date(),
        },
      ]);
      hasInitialized.current = true;
    }, 50);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: "u-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, previousInteractionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        if (data.interactionId) setPreviousInteractionId(data.interactionId);
        const botMsg: Message = {
          id: "a-" + Date.now(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Chat Bubble Toggle Button ──
          Positioned bottom-right, above WhatsApp button / mobile bar.
          z-49 so BookingModal (z-50) renders above this widget.
          On mobile it sits above the sticky bottom bar (which is z-40). */}
      <button
        id="gemini-chat-toggle"
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close AI chat" : "Open AI dental assistant"}
        className={`fixed bottom-[72px] right-4 sm:bottom-6 sm:right-6 z-49 w-14 h-14 rounded-full shadow-[0_8px_24px_rgba(46,156,137,0.35)] flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#2E9C89] cursor-pointer ${
          isOpen
            ? "bg-[#0F172A] rotate-0 scale-95"
            : "bg-[#2E9C89] hover:bg-[#267d6e] hover:scale-110"
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-6 h-6 text-white" />
        )}
      </button>

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          className={`fixed bottom-[140px] right-4 sm:bottom-24 sm:right-6 z-49 w-[90vw] max-w-sm h-[480px] max-h-[70vh] bg-white rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.18)] border border-[#E5EAF0] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200 ${
            isUrdu ? "text-right" : ""
          }`}
          dir={isUrdu ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0F172A] to-[#1e3a5f] border-b border-[#1e3a5f]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2E9C89] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">
                  {isUrdu ? "ڈینٹل AI اسسٹنٹ" : "Dental AI Assistant"}
                </p>
                <p className="text-[10px] text-emerald-300 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isUrdu ? "آن لائن" : "Online"}
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              title={isUrdu ? "گفتگو دوبارہ شروع" : "Reset conversation"}
              className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#F6F8FA]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user"
                    ? isUrdu
                      ? "justify-start"
                      : "justify-end"
                    : isUrdu
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[#0F172A] text-white rounded-br-md"
                      : "bg-white border border-[#E5EAF0] text-[#0F172A] shadow-xs rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className={`flex ${isUrdu ? "justify-end" : "justify-start"}`}>
                <div className="bg-white border border-[#E5EAF0] rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-xs">
                  <Loader2 className="w-4 h-4 text-[#2E9C89] animate-spin" />
                </div>
              </div>
            )}

            {error && (
              <div className="text-center">
                <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                  {error}
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-3 py-2.5 bg-white border-t border-[#E5EAF0]">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isUrdu
                    ? "اپنا سوال یہاں لکھیں..."
                    : "Type your message... (Enter to send)"
                }
                rows={1}
                disabled={loading}
                className="flex-1 resize-none rounded-xl border border-[#E5EAF0] bg-[#F6F8FA] px-3 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2E9C89] focus:bg-white transition-colors disabled:opacity-50 max-h-24 overflow-y-auto"
                style={{ lineHeight: "1.5" }}
                dir={isUrdu ? "rtl" : "ltr"}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="w-9 h-9 rounded-xl bg-[#2E9C89] hover:bg-[#267d6e] disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-sm"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <p className="text-[10px] text-[#94A3B8] text-center mt-1.5">
              {isUrdu
                ? "یہ AI معاون طبی مشورہ نہیں دیتا"
                : "AI assistant — not a substitute for clinical advice"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
