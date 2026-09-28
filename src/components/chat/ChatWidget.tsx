"use client";

import { useState } from "react";
import { MessageSquareText, Sparkles } from "lucide-react";
import { ChatPanel } from "./ChatPanel";

export function ChatWidget({
  initialOpen = false,
  selectedService,
  onResetService,
  onOpenBookingModal,
}: {
  initialOpen?: boolean;
  selectedService?: string | null;
  onResetService?: () => void;
  onOpenBookingModal?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    onResetService?.();
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40">
        <button
          onClick={handleOpen}
          aria-label="Open AI Dental Assistant"
          className="relative group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#001a4b] via-[#04326d] to-[#04326d] text-white shadow-glow hover:scale-105 active:scale-95 transition-all duration-300 animate-pulseGlow cursor-pointer border-2 border-[#b2bed6]/40"
        >
          <div className="relative flex items-center justify-center">
            <MessageSquareText className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-110" />
            <Sparkles className="w-3.5 h-3.5 text-[#b2bed6] absolute -top-1 -right-1 animate-bounce" />
          </div>

          {/* Tooltip on Desktop hover */}
          <span className="hidden sm:group-hover:inline-block absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-[#001a4b] text-white border border-[#04326d] text-xs font-bold whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-right-2 duration-200">
            Ask AI Dental Assistant
          </span>
        </button>
      </div>

      {/* Slide-out / Sheet Modal Panel */}
      <ChatPanel
        isOpen={isOpen || Boolean(selectedService)}
        onClose={handleClose}
        initialPrompt={selectedService || undefined}
        onOpenBookingModal={onOpenBookingModal}
      />
    </>
  );
}
