"use client";

import { useTranslations } from "next-intl";
import { Award, Cpu, HeartHandshake, Banknote } from "lucide-react";

export function WhyChooseUsSection() {
  const t = useTranslations();

  const trustBadges = [
    { key: "experienced", icon: Award, num: "01" },
    { key: "modern", icon: Cpu, num: "02" },
    { key: "painless", icon: HeartHandshake, num: "03" },
    { key: "affordable", icon: Banknote, num: "04" },
  ];

  return (
    <section id="why-us" className="bg-zinc-50 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#b2bed6] bg-white text-[#04326d] uppercase text-[10px] font-bold tracking-[0.15em]">
            {t("whyUs.badge")}
          </div>
          <h2 className="text-4xl font-extrabold text-[#001a4b] tracking-tight">
            {t("whyUs.title")}
          </h2>
          <p className="text-slate-500 text-lg">
            {t("whyUs.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            const title = t(`whyUs.badges.${badge.key}.title`);
            const desc = t(`whyUs.badges.${badge.key}.description`);

            return (
              <div
                key={badge.key}
                className="bg-white border border-slate-200/60 rounded-2xl p-8 flex flex-col items-start gap-4 relative overflow-hidden group hover:border-[#04326d]/40 transition-colors"
              >
                <div className="text-4xl font-black text-[#001a4b]/10 absolute top-4 right-4 pointer-events-none select-none">
                  {badge.num}
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#b2bed6]/20 border border-[#b2bed6]/40 flex items-center justify-center text-[#04326d]">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#001a4b] tracking-tight mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
