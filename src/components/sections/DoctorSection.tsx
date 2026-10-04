"use client";

import { useLocale } from "next-intl";
import { CLINIC_CONFIG, SterilizationItem } from "@/config/clinic";
import { ShieldCheck, ExternalLink, Award, CheckCircle2, Sparkles, Calendar } from "lucide-react";

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

        {/* 4-Point Specific Sterilization Protocols Block */}
        <div className="bg-white rounded-2xl border border-[#E5EAF0] p-6 sm:p-8 shadow-clinical">
          <div className="max-w-2xl mb-6 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E9C89]">
              {isUrdu ? "حفاظتی معیار" : "Infection Control Protocol"}
            </span>
            <h3 className="font-sans text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              {isUrdu ? "100% جراثیم سے پاک کلینیکل پروٹوکول" : "Hospital-Grade Sterilization Protocols"}
            </h3>
            <p className="text-xs sm:text-sm text-[#5B6B7F]">
              {isUrdu
                ? "مریض کے تحفظ کے لیے جراثیم کشی کے کڑے یورپی معیارات کی پابندی۔"
                : "Scannable, verified sterilization steps executed before and after every clinical procedure."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CLINIC_CONFIG.sterilization.map((item: SterilizationItem) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#F6F8FA] border border-[#E5EAF0] space-y-2"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E5EAF0] flex items-center justify-center text-[#2E9C89]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#0F172A]">
                  {isUrdu ? item.titleUr : item.title}
                </h4>
                <p className="text-xs text-[#5B6B7F] leading-relaxed">
                  {isUrdu ? item.descUr : item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
