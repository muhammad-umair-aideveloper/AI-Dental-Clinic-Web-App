"use client";

import { useTranslations } from "next-intl";
import {
  Stethoscope,
  Sparkles,
  Zap,
  Smile,
  ShieldCheck,
  SunMedium,
  HeartPulse,
  AlertTriangle,
} from "lucide-react";

interface ServicesSectionProps {
  onSelectService?: (serviceName: string) => void;
}

export function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const t = useTranslations();

  const services = [
    { key: "checkup", icon: Stethoscope },
    { key: "scaling", icon: Sparkles },
    { key: "rootCanal", icon: Zap },
    { key: "braces", icon: Smile },
    { key: "implants", icon: ShieldCheck },
    { key: "whitening", icon: SunMedium },
    { key: "kids", icon: HeartPulse },
    { key: "emergency", icon: AlertTriangle },
  ];

  return (
    <section id="services" className="bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#b2bed6] bg-white text-[#04326d] uppercase text-[10px] font-bold tracking-[0.15em]">
            {t("services.badge")}
          </div>
          <h2 className="text-4xl font-extrabold text-[#001a4b] tracking-tight">
            {t("services.title")}
          </h2>
          <p className="text-slate-500 text-lg">
            {t("services.subtitle")}
          </p>
        </div>

        {/* 8 Services Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {services.map((item, index) => {
            const Icon = item.icon;
            const title = t(`services.items.${item.key}.title`);
            const desc = t(`services.items.${item.key}.description`);
            const price = t(`services.items.${item.key}.price`);

            // Bento layout logic
            let colSpan = "md:col-span-3";
            if (index === 0 || index === 1) colSpan = "md:col-span-6";
            else if (index === 6 || index === 7) colSpan = "md:col-span-6";

            return (
              <div
                key={item.key}
                className={`group ${colSpan} bg-zinc-50 border border-slate-200/60 rounded-2xl p-6 hover:border-[#04326d]/40 hover:bg-white transition-colors duration-300 flex flex-col relative`}
              >
                <div className="absolute top-6 right-6 inline-flex px-2 py-0.5 rounded-full border border-[#b2bed6] bg-white text-[#04326d] uppercase text-[10px] font-bold tracking-widest shadow-sm">
                  {price}
                </div>
                
                <Icon className="w-8 h-8 text-[#04326d] mb-4" />
                
                <h3 className="text-lg font-bold text-[#001a4b] tracking-tight mb-2">
                  {title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {desc}
                </p>

                <button
                  onClick={() => onSelectService?.(title)}
                  className="mt-auto text-xs text-[#04326d] font-semibold hover:text-[#001a4b] flex items-center gap-1 cursor-pointer w-fit"
                >
                  {t("services.bookService")} &rarr;
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
