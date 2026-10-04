"use client";

import { useState, useEffect } from "react";
import { MessageSquareText, Sparkles, X } from "lucide-react";
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
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem("lahore_dental_chat_dismissed");
      if (isDismissed === "true") {
        setDismissed(true);
      }
    } catch (e) {}
  }, []);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    onResetService?.();
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    try {
      localStorage.setItem("lahore_dental_chat_dismissed", "true");
    } catch (err) {}
  };

  return (
    <>
      {/* Specific, non-generic Clinical Assistant Pill (Dismissible) */}
      {!dismissed && !isOpen && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 animate-clinical-in">
          <div
            onClick={handleOpen}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0F172A] text-white shadow-clinical hover:bg-[#2E9C89] transition-clinical cursor-pointer group border border-slate-700 text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 text-[#4FB8A6] shrink-0" />
            <span>Check Slots & Fees (AI)</span>
            <button
              onClick={handleDismiss}
              title="Dismiss"
              aria-label="Dismiss assistant badge"
              className="ms-1 p-0.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

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
