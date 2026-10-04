"use client";

import { useLocale } from "next-intl";
import { Calendar, MessageCircle } from "lucide-react";
import { CLINIC_CONFIG } from "@/config/clinic";

interface MobileStickyBarProps {
  onOpenBooking: () => void;
}

export function MobileStickyBar({ onOpenBooking }: MobileStickyBarProps) {
  const locale = useLocale();
  const isUrdu = locale === "ur";

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5EAF0] p-2.5 px-4 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
      <div className="grid grid-cols-2 gap-2.5">
        {/* Book Button */}
        <button
          onClick={onOpenBooking}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-full bg-[#0F172A] active:bg-[#2E9C89] text-white text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-[#4FB8A6]" />
          <span>{isUrdu ? "وقت بک کریں" : "Book Consult"}</span>
        </button>

        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${CLINIC_CONFIG.whatsappNumber}?text=${encodeURIComponent(
            isUrdu ? CLINIC_CONFIG.whatsappPrefillUr : CLINIC_CONFIG.whatsappPrefill
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-full bg-[#F6F8FA] active:bg-[#E5EAF0] text-[#0F172A] border border-[#E5EAF0] text-xs font-semibold"
        >
          <MessageCircle className="w-3.5 h-3.5 text-[#2E9C89]" />
          <span>{isUrdu ? "واٹس ایپ" : "WhatsApp"}</span>
        </a>
      </div>
    </div>
  );
}
