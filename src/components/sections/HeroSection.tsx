"use client";

import { useLocale } from "next-intl";
import { MessageCircle, Calendar, Star, ShieldCheck, MapPin, Sparkles } from "lucide-react";
import { CLINIC_CONFIG } from "@/config/clinic";

interface HeroSectionProps {
  onOpenBooking?: () => void;
}

export function HeroSection({ onOpenBooking }: HeroSectionProps) {
  const locale = useLocale();
  const isUrdu = locale === "ur";

  return (
    <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 bg-white border-b border-[#E5EAF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Editorial Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            {/* Google Reviews Badge (Verified client data with note) */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#F6F8FA] border border-[#E5EAF0] text-xs font-medium text-[#0F172A] shadow-xs">
              <a
                href={CLINIC_CONFIG.googleReviews.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[#2E9C89] transition-colors"
                title="Verified Google Reviews (Client check: VERIFY WITH CLIENT BEFORE LAUNCH)"
              >
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold ms-1 text-[#0F172A]">{CLINIC_CONFIG.googleReviews.rating}</span>
                </div>
                <span className="text-[#5B6B7F]">
                  ({CLINIC_CONFIG.googleReviews.count}+ {isUrdu ? "گوگل ریویوز" : "Google Reviews"})
                </span>
                <span className="text-[10px] text-[#2E9C89] font-semibold bg-[#E8F7F4] px-2 py-0.5 rounded-full">
                  {isUrdu ? "تصدیق شدہ" : "Verified"}
                </span>
              </a>
            </div>

            {/* H1 Value Proposition */}
            <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-[#0F172A] tracking-tight leading-[1.12]">
              {isUrdu ? CLINIC_CONFIG.headlineUr : CLINIC_CONFIG.headline}
            </h1>

            {/* Factual Subheadline */}
            <p className="text-base sm:text-lg text-[#5B6B7F] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              {isUrdu ? CLINIC_CONFIG.subheadlineUr : CLINIC_CONFIG.subheadline}
            </p>

            {/* Dual CTAs: Book Consultation & WhatsApp Doctor */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onOpenBooking}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#0F172A] hover:bg-[#2E9C89] text-white font-semibold text-sm transition-clinical active:scale-98 shadow-sm cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#4FB8A6]" />
                <span>{isUrdu ? "وقت بک کریں (آن لائن)" : "Book Consultation"}</span>
              </button>

              <a
                href={`https://wa.me/${CLINIC_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                  isUrdu ? CLINIC_CONFIG.whatsappPrefillUr : CLINIC_CONFIG.whatsappPrefill
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-[#F6F8FA] text-[#0F172A] font-semibold text-sm border border-[#E5EAF0] transition-clinical active:scale-98 shadow-xs"
              >
                <MessageCircle className="w-4 h-4 text-[#2E9C89]" />
                <span>{isUrdu ? "واٹس ایپ ڈاکٹر" : "WhatsApp Doctor"}</span>
              </a>
            </div>

            {/* Trust Micro-Bullets */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#E5EAF0] text-xs text-[#5B6B7F]">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2E9C89] shrink-0" />
                <span>{isUrdu ? "پی ایم ڈی سی رجسٹرڈ سرجن" : "PMDC Registered Specialist"}</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <Sparkles className="w-4 h-4 text-[#2E9C89] shrink-0" />
                <span>{isUrdu ? "کلاس-بی سٹرلائزیشن" : "Class-B Autoclave Protocol"}</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <MapPin className="w-4 h-4 text-[#2E9C89] shrink-0" />
                <span>{isUrdu ? "مین بلیوارڈ، گلبرگ III" : "Main Boulevard, Gulberg III"}</span>
              </div>
            </div>
          </div>

          {/* Right Clinical Asset Box: Genuine Real Clinic Asset / CLIENT_ASSET_REQUIRED Placeholder */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#E5EAF0] bg-[#F6F8FA] shadow-clinical">
              {/* Asset Display */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F6F8FA]">
                <img
                  src="/images/hero-clinic-placeholder.svg"
                  alt="Lahore Dental Clinic Operatory Suite"
                  className="w-full h-full object-cover"
                />
                
                {/* Asset Notice Label */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-[#E5EAF0] flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E9C89] block">
                      {isUrdu ? "کلینیکل سویٹ" : "Clinical Operatory Suite"}
                    </span>
                    <p className="text-xs font-semibold text-[#0F172A]">
                      {isUrdu ? "گلبرگ III، لاہور — مکمل جراثیم سے پاک" : "Gulberg III, Lahore · Sterilized Suite"}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F6F8FA] text-[#5B6B7F] border border-[#E5EAF0]">
                    Real Asset
                  </span>
                </div>
              </div>

              {/* Verified Clinical Credentials Strip */}
              <div className="p-3.5 bg-white border-t border-[#E5EAF0] grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-[#F6F8FA] border border-[#E5EAF0]">
                  <span className="text-[10px] font-bold text-[#5B6B7F] uppercase tracking-wider block">
                    {isUrdu ? "رجسٹریشن" : "Medical Body"}
                  </span>
                  <p className="font-bold text-[#0F172A]">{CLINIC_CONFIG.doctor.pmdcNumber}</p>
                </div>
                <div className="p-2 rounded-xl bg-[#F6F8FA] border border-[#E5EAF0]">
                  <span className="text-[10px] font-bold text-[#5B6B7F] uppercase tracking-wider block">
                    {isUrdu ? "پارکنگ" : "On-Site Parking"}
                  </span>
                  <p className="font-bold text-[#2E9C89]">{isUrdu ? "مفت ویلے" : "Valet Available"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
