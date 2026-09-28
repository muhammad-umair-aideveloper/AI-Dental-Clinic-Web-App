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
  ArrowRight,
} from "lucide-react";

interface ServicesSectionProps {
  onSelectService?: (serviceName: string) => void;
}

export function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const t = useTranslations();

  const services = [
    {
      key: "checkup",
      icon: Stethoscope,
    },
    {
      key: "scaling",
      icon: Sparkles,
    },
    {
      key: "rootCanal",
      icon: Zap,
    },
    {
      key: "braces",
      icon: Smile,
    },
    {
      key: "implants",
      icon: ShieldCheck,
    },
    {
      key: "whitening",
      icon: SunMedium,
    },
    {
      key: "kids",
      icon: HeartPulse,
    },
    {
      key: "emergency",
      icon: AlertTriangle,
    },
  ];

  return (
    <section id="services" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b2bed6]/30 border border-[#b2bed6] text-[#001a4b] text-xs font-bold">
            <span>{t("services.badge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#001a4b] tracking-tight">
            {t("services.title")}
          </h2>
          <p className="text-[#001a4b]/80 text-base sm:text-lg">
            {t("services.subtitle")}
          </p>
        </div>

        {/* 8 Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((item) => {
            const Icon = item.icon;
            const title = t(`services.items.${item.key}.title`);
            const desc = t(`services.items.${item.key}.description`);
            const price = t(`services.items.${item.key}.price`);

            return (
              <div
                key={item.key}
                className="group relative rounded-2xl bg-white border border-[#b2bed6]/60 p-6 flex flex-col justify-between hover:border-[#04326d] hover:shadow-card transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  {/* Icon + Price Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border border-[#b2bed6] bg-[#b2bed6]/20 text-[#04326d] transition-transform group-hover:scale-110 group-hover:bg-[#04326d] group-hover:text-white"
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#b2bed6]/25 text-[#001a4b]">
                      {price}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-[#001a4b] mb-2 group-hover:text-[#04326d] transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-[#001a4b]/75 leading-relaxed mb-6">
                    {desc}
                  </p>
                </div>

                {/* Booking Trigger Button */}
                <button
                  onClick={() => onSelectService?.(title)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#04326d] hover:bg-[#001a4b] transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
                >
                  <span>{t("services.bookService")}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
