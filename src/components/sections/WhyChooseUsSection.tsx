"use client";

import { useTranslations } from "next-intl";
import { Award, Cpu, HeartHandshake, Banknote } from "lucide-react";

export function WhyChooseUsSection() {
  const t = useTranslations();

  const trustBadges = [
    {
      key: "experienced",
      icon: Award,
    },
    {
      key: "modern",
      icon: Cpu,
    },
    {
      key: "painless",
      icon: HeartHandshake,
    },
    {
      key: "affordable",
      icon: Banknote,
    },
  ];

  return (
    <section id="why-us" className="py-16 md:py-24 bg-[#b2bed6]/15 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b2bed6]/30 border border-[#b2bed6] text-[#001a4b] text-xs font-bold">
            <span>{t("whyUs.badge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#001a4b] tracking-tight">
            {t("whyUs.title")}
          </h2>
          <p className="text-[#001a4b]/80 text-base sm:text-lg">
            {t("whyUs.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            const title = t(`whyUs.badges.${badge.key}.title`);
            const desc = t(`whyUs.badges.${badge.key}.description`);

            return (
              <div
                key={badge.key}
                className="bg-white rounded-2xl p-7 border border-[#b2bed6]/60 shadow-soft hover:shadow-card hover:border-[#04326d] transition-all duration-300 flex flex-col items-center text-center group hover:-translate-y-1"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center border border-[#b2bed6] bg-[#b2bed6]/25 text-[#04326d] mb-5 shadow-xs group-hover:scale-110 group-hover:bg-[#04326d] group-hover:text-white transition-all"
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#001a4b] mb-2.5">
                  {title}
                </h3>
                <p className="text-sm text-[#001a4b]/75 leading-relaxed">
                  {desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
