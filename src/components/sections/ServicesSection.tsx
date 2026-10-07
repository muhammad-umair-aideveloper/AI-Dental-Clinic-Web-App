"use client";

import { useLocale } from "next-intl";
import { CLINIC_CONFIG, ClinicTreatment } from "@/config/clinic";
import {
  Sparkles,
  Shield,
  Layers,
  Activity,
  Check,
  Clock,
  ArrowRight,
  Info,
} from "lucide-react";

interface ServicesSectionProps {
  onSelectService?: (serviceName: string) => void;
}

export function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const locale = useLocale();
  const isUrdu = locale === "ur";

  // Treatment meta features matching reference checkmark list
  const treatmentFeatures: Record<
    string,
    {
      icon: any;
      features: string[];
      featuresUr: string[];
      isPopular?: boolean;
    }
  > = {
    scaling: {
      icon: Sparkles,
      features: [
        "30-45 mins gentle clinical session",
        "Enamel-safe plaque & tartar removal",
        "Ultrasonic diamond polishing finish",
        "Class-B autoclave sterilized instruments",
      ],
      featuresUr: [
        "30 تا 45 منٹ کی آرام دہ نشست",
        "الٹراسونک مشین سے گہری صفائی",
        "دانتوں کی قدرتی چمک اور پالش",
        "سو فیصد جراثیم سے پاک آلات",
      ],
    },
    "root-canal": {
      icon: Shield,
      features: [
        "45-60 mins single comfortable sitting",
        "Digital apex rotary endodontic accuracy",
        "Pain-free specialized anesthesia",
        "Preserves natural tooth structure",
      ],
      featuresUr: [
        "صرف ایک نشست میں مکمل علاج",
        "جدید روٹری پیمائش کا نظام",
        "درد سے مکمل پاک اینستھیزیا",
        "قدرتی دانت کو ضائع ہونے سے بچائیں",
      ],
    },
    aligners: {
      icon: Layers,
      isPopular: true,
      features: [
        "6-12 months progressive treatment",
        "Custom 3D digital smile scan plan",
        "Zero metal brackets or visible wires",
        "Installment payment plans available",
      ],
      featuresUr: [
        "6 تا 12 ماہ کا دورانیہ",
        "مکمل تھری ڈی ڈیجیٹل اسکین",
        "بغیر کسی تاروں کے شفاف پوشیدہ الائنرز",
        "ماہانہ آسان اقساط کی سہولت",
      ],
    },
    implants: {
      icon: Activity,
      features: [
        "45 mins precision surgical placement",
        "Medical-grade pure titanium fixture",
        "Permanent natural-feeling root fixture",
        "Lifetime stability & aesthetic crown",
      ],
      featuresUr: [
        "45 منٹ میں جدید ترین سرجری",
        "میڈیکل گریڈ بایو-ٹائٹینیم روٹ",
        "مستقل اور قدرتی دانت جیسا احساس",
        "تاحیات مضبوطی اور پائیداری",
      ],
    },
  };

  return (
    <section id="treatments" className="py-20 md:py-28 bg-[#FAFAFA] border-b border-slate-200/80 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-r from-blue-50/50 via-teal-50/40 to-indigo-50/40 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ========================================================= */}
        {/* SECTION HEADER                                            */}
        {/* ========================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs text-xs font-semibold text-neutral-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>{isUrdu ? "شفاف کلینیکل فیس" : "Transparent Starting Fees"}</span>
          </div>

          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-[-0.03em]">
            {isUrdu ? "علاجات اور شفاف قیمتیں" : "Dental Treatments & Pricing"}
          </h2>

          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            {isUrdu
              ? "کوئی پوشیدہ فیس نہیں۔ تمام قیمتیں مشاورت اور جانچ کے بعد واضح کی جاتی ہیں۔"
              : "Clear starting prices with zero hidden charges. Single source of truth across our reception, chatbot, and booking."}
          </p>

          <div className="pt-1">
            <div className="inline-flex items-center gap-2 text-xs text-neutral-600 font-medium bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-xs">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                {isUrdu
                  ? "حتمی فیس کا تعین معائنے اور ایکسرے کے بعد کیا جاتا ہے۔"
                  : "Final cost is confirmed after comprehensive examination."}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4 CORE CLINICAL CARDS (Luna UI / Modern SaaS Card Style)   */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CLINIC_CONFIG.treatments.map((item: ClinicTreatment) => {
            const formattedPrice = `PKR ${item.startingPricePkr.toLocaleString()}`;
            const meta = treatmentFeatures[item.id] || {
              icon: Sparkles,
              features: [],
              featuresUr: [],
              isPopular: false,
            };
            const Icon = meta.icon;
            const isPopular = meta.isPopular;

            return (
              <div
                key={item.id}
                className={`group relative rounded-[28px] bg-white border transition-all duration-300 flex flex-col justify-between p-6 sm:p-7 hover:-translate-y-1.5 ${
                  isPopular
                    ? "border-blue-500/50 shadow-[0_20px_50px_rgba(37,99,235,0.12)] ring-1 ring-blue-500/30"
                    : "border-slate-200/80 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_45px_-8px_rgba(0,0,0,0.1)] hover:border-neutral-300"
                }`}
              >
                {/* Floating "Popular" Badge (Angled top-right pill from reference image) */}
                {isPopular && (
                  <div className="absolute -top-3.5 right-6 z-20">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold text-white bg-blue-600 shadow-[0_4px_14px_rgba(37,99,235,0.4)] tracking-wide uppercase">
                      {isUrdu ? "مقبول ترین" : "Popular"}
                    </span>
                  </div>
                )}

                <div>
                  {/* Top Row: Squircle Dark Icon & Meta Pill */}
                  <div className="flex items-center justify-between mb-5">
                    {/* Dark Squircle Icon Container */}
                    <div className="w-11 h-11 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-md shadow-neutral-900/10 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    {/* Meta Badge: Duration + Specialist */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-600" />
                        <span>{isUrdu ? item.durationUr : item.duration}</span>
                      </span>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-600 bg-neutral-100 px-2 py-1 rounded-lg">
                        {isUrdu ? "ماہر" : "Specialist"}
                      </span>
                    </div>
                  </div>

                  {/* Card Title */}
                  <h3 className="font-sans text-xl font-extrabold text-neutral-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
                    {isUrdu ? item.nameUr : item.name}
                  </h3>

                  {/* Description Subtext */}
                  <p className="text-xs text-neutral-500 leading-relaxed mt-2 min-h-[44px]">
                    {isUrdu ? item.descriptionUr : item.description}
                  </p>

                  {/* Pricing Block */}
                  <div className="my-6 pt-5 border-t border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                      {isUrdu ? "ابتدائی فیس" : "Starting from"}
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                        {formattedPrice}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                      {isUrdu ? item.priceNoteUr : item.priceNote}
                    </p>
                  </div>

                  {/* High-Contrast Dark CTA Button (Deep Drop Shadow from Reference) */}
                  <button
                    type="button"
                    onClick={() => onSelectService?.(isUrdu ? item.nameUr : item.name)}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow-[0_10px_24px_-4px_rgba(0,0,0,0.25)] hover:shadow-[0_14px_28px_-4px_rgba(0,0,0,0.32)] transition-all duration-200 active:scale-98 cursor-pointer flex items-center justify-center gap-2 group/btn"
                  >
                    <span>{isUrdu ? "یہ علاج بک کریں" : "Book This Treatment"}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/70 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Feature Bullets List (Reference Checkmark Style) */}
                <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
                  {(isUrdu ? meta.featuresUr : meta.features).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-neutral-600">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          isPopular
                            ? "bg-blue-600 text-white"
                            : "bg-neutral-900 text-white"
                        }`}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="leading-tight font-medium text-neutral-700">{feat}</span>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
