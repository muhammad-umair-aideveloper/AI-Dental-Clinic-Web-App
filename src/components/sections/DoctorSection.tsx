"use client";

import { useLocale } from "next-intl";
import { CLINIC_CONFIG, SterilizationItem } from "@/config/clinic";
import {
  ShieldCheck,
  ExternalLink,
  Award,
  CheckCircle2,
  Sparkles,
  Calendar,
  Shield,
  Layers,
  PackageCheck,
  Flame,
} from "lucide-react";

interface DoctorSectionProps {
  onOpenBooking?: () => void;
}

export function DoctorSection({ onOpenBooking }: DoctorSectionProps) {
  const locale = useLocale();
  const isUrdu = locale === "ur";
  const doctor = CLINIC_CONFIG.doctor;

  return (
    <section id="doctor" className="py-16 md:py-24 bg-[#F6F8FA] border-b border-[#E5EAF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Doctor Credibility Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Doctor Portrait / Asset Placeholder */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden bg-white border border-[#E5EAF0] p-3 shadow-clinical">
              <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[#F6F8FA]">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Verified PMDC Badge Below Photo */}
              <div className="mt-3 p-3 rounded-xl bg-[#F6F8FA] border border-[#E5EAF0] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#5B6B7F] uppercase tracking-wider block">
                    {isUrdu ? "میڈیکل کونسل رجسٹریشن" : "Official PMDC / PMC"}
                  </span>
                  <p className="text-xs font-bold text-[#0F172A]">{doctor.pmdcNumber}</p>
                </div>
                <a
                  href={doctor.pmdcVerifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2E9C89] bg-white border border-[#E5EAF0] hover:bg-[#E8F7F4] transition-colors"
                >
                  <span>{isUrdu ? "تصدیق کریں" : "Verify License"}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Doctor Bio & Fellowships */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5EAF0] text-xs font-semibold text-[#2E9C89]">
              <Award className="w-3.5 h-3.5 text-[#2E9C89]" />
              <span>{isUrdu ? "پرنسپل ڈینٹل سرجن" : "Principal Dental Specialist"}</span>
            </div>

            <h2 className="font-sans text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
              {isUrdu ? doctor.nameUr : doctor.name}
            </h2>

            <p className="text-sm font-semibold text-[#2E9C89]">
              {isUrdu ? doctor.titleUr : doctor.title} · {isUrdu ? `${doctor.experienceYears} سالہ کلینیکل مہارت` : `${doctor.experienceYears}+ Years Clinical Practice`}
            </p>

            <p className="text-sm sm:text-base text-[#5B6B7F] leading-relaxed">
              {isUrdu ? doctor.bioUr : doctor.bio}
            </p>

            {/* Verified Fellowships */}
            <div className="pt-2">
              <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider block mb-2.5">
                {isUrdu ? "ڈگریاں و سرٹیفیکیشنز (تصدیق شدہ)" : "Clinical Qualifications & Fellowships"}
              </span>
              <div className="flex flex-wrap gap-2">
                {doctor.fellowships.map((f, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5EAF0] text-xs font-medium text-[#0F172A]"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#2E9C89]" />
                    <span>{f}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0F172A] hover:bg-[#2E9C89] text-white font-semibold text-xs transition-clinical shadow-sm cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#4FB8A6]" />
                <span>{isUrdu ? "ڈاکٹر سارہ سے وقت طے کریں" : "Schedule Consultation with Dr. Sarah"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4-Point Specific Sterilization Protocols Block (Redesigned with Light-Mode Glowing Rim Lighting) */}
        <div className="bg-white rounded-3xl border border-slate-100 p-7 sm:p-9 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
          <div className="max-w-2xl mb-8 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284C7] bg-[#E0F2FE] px-3 py-1 rounded-full inline-block">
              {isUrdu ? "حفاظتی معیار" : "Infection Control Protocol"}
            </span>
            <h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {isUrdu ? "100% جراثیم سے پاک کلینیکل پروٹوکول" : "Hospital–Grade Sterilization Protocols"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {isUrdu
                ? "مریض کے تحفظ کے لیے جراثیم کشی کے کڑے یورپی معیارات کی پابندی۔"
                : "Scannable, verified sterilization steps executed before and after every clinical procedure."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CLINIC_CONFIG.sterilization.map((item: SterilizationItem, idx: number) => {
              // 4 distinct color palettes & glowing rim configurations (Exact Image 1 vibe adapted to Light Mode)
              const cardStyles = [
                {
                  // Card 1: Electric Cyan
                  squircleBg: "bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]",
                  icon: Shield,
                  rimGradient: "from-transparent via-[#00C2FF] to-[#0284C7]",
                  glowColor: "rgba(0,194,255,0.28)",
                  hoverGlow: "shadow-[0_20px_40px_-15px_rgba(0,194,255,0.25)]",
                  hoverBorder: "hover:border-[#38BDF8]/60",
                },
                {
                  // Card 2: Medical Mint / Emerald
                  squircleBg: "bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0]",
                  icon: ShieldCheck,
                  rimGradient: "from-transparent via-[#10B981] to-[#059669]",
                  glowColor: "rgba(16,185,129,0.28)",
                  hoverGlow: "shadow-[0_20px_40px_-15px_rgba(16,185,129,0.25)]",
                  hoverBorder: "hover:border-[#34D399]/60",
                },
                {
                  // Card 3: Royal Indigo / Tech Violet
                  squircleBg: "bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]",
                  icon: PackageCheck,
                  rimGradient: "from-transparent via-[#6366F1] to-[#4F46E5]",
                  glowColor: "rgba(99,102,241,0.28)",
                  hoverGlow: "shadow-[0_20px_40px_-15px_rgba(99,102,241,0.25)]",
                  hoverBorder: "hover:border-[#818CF8]/60",
                },
                {
                  // Card 4: Warm Coral / Rose Barrier
                  squircleBg: "bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]",
                  icon: Flame,
                  rimGradient: "from-transparent via-[#F43F5E] to-[#FB923C]",
                  glowColor: "rgba(244,63,94,0.28)",
                  hoverGlow: "shadow-[0_20px_40px_-15px_rgba(244,63,94,0.25)]",
                  hoverBorder: "hover:border-[#FB7185]/60",
                },
              ][idx % 4];

              const IconComponent = cardStyles.icon;

              return (
                <div
                  key={item.id}
                  className={`group relative bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-slate-100 flex flex-col justify-between overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] ${cardStyles.hoverBorder} ${cardStyles.hoverGlow}`}
                >
                  {/* Atmospheric Bottom Rim Lighting Halo (The Signature Image 1 Effect) */}
                  <div
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-44 h-16 rounded-full blur-xl pointer-events-none transition-all duration-500 ease-out opacity-40 group-hover:opacity-100 group-hover:w-56 group-hover:h-20"
                    style={{ backgroundColor: cardStyles.glowColor }}
                  />

                  {/* Luminous Colored Bottom Edge Border Line */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r ${cardStyles.rimGradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  {/* Card Content Top & Body */}
                  <div className="relative z-10 space-y-4">
                    {/* Top Squircle Icon Container */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs transition-transform duration-300 ease-out group-hover:scale-110 ${cardStyles.squircleBg}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Card Title */}
                    <h4 className="font-sans text-base font-bold text-[#0F172A] tracking-tight group-hover:text-slate-900 transition-colors">
                      {isUrdu ? item.titleUr : item.title}
                    </h4>

                    {/* Card Description */}
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {isUrdu ? item.descUr : item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
