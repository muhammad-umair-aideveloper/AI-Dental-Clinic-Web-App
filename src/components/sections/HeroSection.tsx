"use client";

import { useLocale } from "next-intl";
import { MessageCircle, Calendar, Star, ShieldCheck, MapPin, Sparkles, ArrowRight, CheckCircle2, RotateCw } from "lucide-react";
import { CLINIC_CONFIG } from "@/config/clinic";

interface HeroSectionProps {
  onOpenBooking?: () => void;
}

export function HeroSection({ onOpenBooking }: HeroSectionProps) {
  const locale = useLocale();
  const isUrdu = locale === "ur";

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 bg-gradient-to-b from-[#F2F6FA] via-[#EBF2F8] to-[#F8FAFC]">
      {/* Cinematic Ambient Lighting & Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-sky-200/35 rounded-full blur-[140px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-[550px] h-[550px] bg-teal-100/40 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[450px] h-[450px] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none translate-y-1/3" />

      {/* Subtle Medical Technical Grid Texture */}
      <div className="absolute inset-0 bg-grid-clinical opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center min-h-[640px]">
          
          {/* ========================================================= */}
          {/* LEFT EDITORIAL COLUMN (Clean, High-End Cinematic Copy)    */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 space-y-7 text-center lg:text-start">
            
            {/* Top Verified Glass Pill Tag (Matches TerraGrip 'BUILT FOR REAL ADVENTURES') */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-white/60 shadow-[0_4px_16px_rgba(15,23,42,0.05)] text-xs font-semibold text-[#0F172A] transition-all hover:bg-white hover:shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <a
                href={CLINIC_CONFIG.googleReviews.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#2E9C89] transition-colors"
              >
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold ms-1 text-[#0F172A]">{CLINIC_CONFIG.googleReviews.rating}</span>
                </div>
                <span className="text-[#5B6B7F]">
                  ({CLINIC_CONFIG.googleReviews.count}+ {isUrdu ? "گوگل ریویوز" : "Google Reviews"})
                </span>
                <span className="text-[10px] text-[#2E9C89] font-bold bg-[#E8F7F4] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {isUrdu ? "تصدیق شدہ" : "Verified"}
                </span>
              </a>
            </div>

            {/* Cinematic Hero Headline */}
            <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-[58px] font-extrabold text-[#0F172A] tracking-[-0.03em] leading-[1.1]">
              {isUrdu ? (
                CLINIC_CONFIG.headlineUr
              ) : (
                <>
                  Painless Dental Implants{" "}
                  <span className="font-serif italic font-normal text-[#2E9C89]">&amp; Invisible Aligners</span>{" "}
                  in Lahore
                </>
              )}
            </h1>

            {/* Clean Subheadline */}
            <p className="text-base sm:text-lg text-[#5B6B7F] leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              {isUrdu ? CLINIC_CONFIG.subheadlineUr : CLINIC_CONFIG.subheadline}
            </p>

            {/* Primary Action Buttons (Capsule CTA + Glass WhatsApp Pill) */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1">
              <button
                onClick={onOpenBooking}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-sm shadow-[0_12px_28px_rgba(15,23,42,0.2)] hover:shadow-[0_16px_36px_rgba(15,23,42,0.28)] transition-all duration-300 active:scale-95 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#4FB8A6]" />
                <span>{isUrdu ? "وقت بک کریں (آن لائن)" : "Book Consultation"}</span>
                <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href={`https://wa.me/${CLINIC_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                  isUrdu ? CLINIC_CONFIG.whatsappPrefillUr : CLINIC_CONFIG.whatsappPrefill
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/80 hover:bg-white text-[#0F172A] font-semibold text-sm border border-white/60 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:shadow-md backdrop-blur-md transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4 text-[#2E9C89]" />
                <span>{isUrdu ? "واٹس ایپ ڈاکٹر" : "WhatsApp Doctor"}</span>
              </a>
            </div>

            {/* Bottom Trust Strip (Clean 3-Column Minimal Anchors) */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200/70 text-xs text-[#5B6B7F]">
              <div className="flex items-center justify-center lg:justify-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white border border-slate-200/80 flex items-center justify-center shadow-xs shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2E9C89]" />
                </div>
                <span className="font-medium text-[#1E293B]">
                  {isUrdu ? "پی ایم ڈی سی رجسٹرڈ سرجن" : "PMDC Specialist"}
                </span>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white border border-slate-200/80 flex items-center justify-center shadow-xs shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#2E9C89]" />
                </div>
                <span className="font-medium text-[#1E293B]">
                  {isUrdu ? "کلاس-بی سٹرلائزیشن" : "Class-B Autoclave"}
                </span>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white border border-slate-200/80 flex items-center justify-center shadow-xs shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-[#2E9C89]" />
                </div>
                <span className="font-medium text-[#1E293B]">
                  {isUrdu ? "مین بلیوارڈ، گلبرگ III" : "Gulberg III, Lahore"}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT CINEMATIC 3D COMPOSITION WITH FLOATING GLASS CARDS  */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* Center Stage Glowing Glass Backplate */}
            <div className="relative w-full max-w-[580px] aspect-[4/3] sm:aspect-[16/11] flex items-center justify-center">
              
              {/* Soft Radial Backing Halo */}
              <div className="absolute inset-4 rounded-[40px] bg-gradient-to-tr from-white/90 via-white/50 to-teal-50/40 backdrop-blur-2xl border border-white/80 shadow-[0_30px_70px_rgba(90,110,140,0.14)]" />

              {/* 3D Floating Hero Subject (Crystal Aligner & Titanium Implant) */}
              <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                <img
                  src="/images/dental-hero-3d.jpg"
                  alt="Crystal Clear Aligner and Titanium Dental Implant 3D Composition"
                  className="w-full h-full object-cover rounded-[32px] animate-float-gentle transition-transform duration-700"
                />
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* Floating Glassmorphism Badge 1: Top Right Connected Callout       */}
              {/* (Matching TerraGrip's 'Premium Aluminum / Lightweight & Strong')   */}
              {/* ----------------------------------------------------------------- */}
              <div className="absolute -top-4 -right-2 sm:-right-4 z-20 bg-white/85 backdrop-blur-xl border border-white/80 rounded-2xl p-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)] max-w-[210px] hidden sm:flex items-center gap-3 transition-transform hover:-translate-y-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2E9C89] to-[#4FB8A6] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] leading-tight">
                    Biocompatible Ti
                  </h4>
                  <p className="text-[10px] text-[#5B6B7F]">Medical Grade 4 Implant</p>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* Floating Glassmorphism Badge 2: 360° Smile Orbit Circular Badge  */}
              {/* (Matching TerraGrip's '360° View Product' circular widget)        */}
              {/* ----------------------------------------------------------------- */}
              <div className="absolute top-1/4 -left-3 sm:-left-6 z-20 bg-white/85 backdrop-blur-xl border border-white/80 rounded-full p-2.5 sm:p-3 shadow-[0_12px_28px_rgba(15,23,42,0.1)] flex items-center gap-2.5 cursor-pointer group hover:bg-white transition-all">
                <div className="relative w-8 h-8 rounded-full bg-[#E8F7F4] flex items-center justify-center text-[#2E9C89]">
                  <RotateCw className="w-4 h-4 animate-spin-slow group-hover:scale-110 transition-transform" />
                </div>
                <div className="pr-2">
                  <span className="text-[11px] font-extrabold text-[#0F172A] block leading-tight">
                    360° Scan
                  </span>
                  <span className="text-[9px] text-[#5B6B7F] block">Digital Smile Plan</span>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* Floating Glassmorphism Badge 3: Bottom Right Micro Feature Card   */}
              {/* (Matching TerraGrip's 'Secure Lock' thumbnail widget)             */}
              {/* ----------------------------------------------------------------- */}
              <div className="absolute -bottom-4 right-2 sm:right-4 z-20 bg-white/90 backdrop-blur-xl border border-white/80 rounded-2xl p-2.5 sm:p-3 shadow-[0_16px_36px_rgba(15,23,42,0.12)] flex items-center gap-3 max-w-[270px] transition-transform hover:-translate-y-1">
                {/* Operatory Suite Thumbnail */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img
                    src="/images/clinic-hero.jpg"
                    alt="Lahore Dental Clinic Operatory"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E9C89]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E9C89]">
                      Class-B Autoclave
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#0F172A] truncate">
                    100% Sterile Operatory
                  </h4>
                  <p className="text-[10px] text-[#5B6B7F] truncate">
                    Batch verified spore testing
                  </p>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* Floating Glassmorphism Badge 4: PMDC & Parking Credential Strip   */}
              {/* ----------------------------------------------------------------- */}
              <div className="absolute -bottom-5 -left-2 sm:left-2 z-20 bg-white/90 backdrop-blur-xl border border-white/80 rounded-2xl px-3.5 py-2 shadow-[0_12px_28px_rgba(15,23,42,0.08)] flex items-center gap-3 text-xs">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A94A6] block">
                    Medical Council
                  </span>
                  <span className="font-extrabold text-[#0F172A] text-[11px]">
                    {CLINIC_CONFIG.doctor.pmdcNumber}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A94A6] block">
                    On-Site Valet
                  </span>
                  <span className="font-extrabold text-[#2E9C89] text-[11px]">
                    Complimentary
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
