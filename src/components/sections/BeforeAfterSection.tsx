"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { CLINIC_CONFIG, BeforeAfterCase } from "@/config/clinic";
import { ShieldCheck, Info } from "lucide-react";

export function BeforeAfterSection({ onSelectTreatment }: { onSelectTreatment?: (name: string) => void }) {
  const locale = useLocale();
  const isUrdu = locale === "ur";

  // Categories: whitening, bonding, aligners
  const [activeCategory, setActiveCategory] = useState<"whitening" | "bonding" | "aligners">("whitening");
  // Slider position (0 - 100)
  const [sliderPos, setSliderPos] = useState(50);

  // Filter cases with consent_on_file = true
  const consentedCases = CLINIC_CONFIG.beforeAfterCases.filter((c) => c.consentOnFile);
  const currentCase = consentedCases.find((c) => c.category === activeCategory) || consentedCases[0];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setSliderPos((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      setSliderPos((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <section id="before-after" className="py-16 md:py-24 bg-[#F6F8FA] border-b border-[#E5EAF0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5EAF0] text-xs font-semibold text-[#2E9C89] shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E9C89]" />
            <span>{isUrdu ? "مریض کی باقاعدہ رضامندی سے شائع شدہ" : "Patient Consent on File"}</span>
          </div>

          <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F172A] tracking-tight">
            {isUrdu ? "علاج کے اصل نتائج — پہلے اور بعد" : "Verified Clinical Transformations"}
          </h2>
          <p className="text-sm sm:text-base text-[#5B6B7F]">
            {isUrdu
              ? "کسی قسم کی مصنوعی یا سٹاک تصاویر استعمال نہیں کی جاتیں۔ تمام نتائج ہمارے گلبرگ کلینک کے حقیقی مریضوں کے ہیں۔"
              : "Zero stock imagery. Interactive comparison of verified clinical cases treated at our Gulberg III operatory."}
          </p>

          {/* Category Tabs: Whitening, Bonding, Aligners */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => {
                setActiveCategory("whitening");
                setSliderPos(50);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-clinical cursor-pointer ${
                activeCategory === "whitening"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-white text-[#5B6B7F] hover:text-[#0F172A] border border-[#E5EAF0]"
              }`}
            >
              {isUrdu ? "ٹیتھ وائٹننگ" : "Teeth Whitening"}
            </button>
            <button
              onClick={() => {
                setActiveCategory("bonding");
                setSliderPos(50);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-clinical cursor-pointer ${
                activeCategory === "bonding"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-white text-[#5B6B7F] hover:text-[#0F172A] border border-[#E5EAF0]"
              }`}
            >
              {isUrdu ? "کمپوزٹ بانڈنگ" : "Composite Bonding"}
            </button>
            <button
              onClick={() => {
                setActiveCategory("aligners");
                setSliderPos(50);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-clinical cursor-pointer ${
                activeCategory === "aligners"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-white text-[#5B6B7F] hover:text-[#0F172A] border border-[#E5EAF0]"
              }`}
            >
              {isUrdu ? "شفاف الائنرز" : "Clear Aligners"}
            </button>
          </div>
        </div>

        {/* Interactive Comparison Slider Container (< 3KB JS) */}
        {currentCase && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#E5EAF0] p-4 sm:p-6 shadow-clinical">
            {/* Slider Viewport */}
            <div
              className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-xl bg-slate-100 select-none cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-[#4FB8A6]"
              tabIndex={0}
              role="slider"
              aria-label="Before and after comparison slider"
              aria-valuenow={sliderPos}
              aria-valuemin={0}
              aria-valuemax={100}
              onKeyDown={handleKeyDown}
            >
              {/* After Image (Full width background) */}
              <img
                src={currentCase.afterImage}
                alt={`${currentCase.title} - After`}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
              <span className="absolute bottom-3 right-3 z-10 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#0F172A]/85 text-white backdrop-blur-xs">
                {isUrdu ? "علاج کے بعد" : "AFTER"}
              </span>

              {/* Before Image (Clipped layer) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={currentCase.beforeImage}
                  alt={`${currentCase.title} - Before`}
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: "100%", height: "100%" }}
                  draggable={false}
                />
                <span className="absolute bottom-3 left-3 z-10 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-800/85 text-white backdrop-blur-xs">
                  {isUrdu ? "علاج سے پہلے" : "BEFORE"}
                </span>
              </div>

              {/* Divider Line & Handle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)] z-20 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-[#0F172A] shadow-md flex items-center justify-center text-[10px] font-bold text-[#0F172A]">
                  ↔
                </div>
              </div>

              {/* Native range input overlay for seamless touch + drag */}
              <input
                type="range"
                min={0}
                max={100}
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0 p-0"
                aria-label="Before/After divider slider control"
              />
            </div>

            {/* Case Details Strip */}
            <div className="mt-4 pt-4 border-t border-[#E5EAF0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <h4 className="font-semibold text-sm text-[#0F172A]">
                  {isUrdu ? currentCase.titleUr : currentCase.title}
                </h4>
                <p className="text-[#5B6B7F] mt-0.5">
                  {isUrdu ? `دورانیہ: ${currentCase.durationUr}` : `Treatment duration: ${currentCase.duration}`}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[#5B6B7F] bg-[#F6F8FA] px-3 py-1.5 rounded-lg border border-[#E5EAF0]">
                <Info className="w-3.5 h-3.5 text-[#2E9C89] shrink-0" />
                <span className="text-[11px]">{isUrdu ? currentCase.noteUr : currentCase.note}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
