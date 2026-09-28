"use client";

import { useTranslations } from "next-intl";
import { Star, Quote, CheckCircle2 } from "lucide-react";

export function TestimonialsSection() {
  const t = useTranslations();

  const reviews = [
    {
      name: t("testimonials.items.0.name"),
      area: t("testimonials.items.0.area"),
      treatment: t("testimonials.items.0.treatment"),
      text: t("testimonials.items.0.text"),
      rating: 5,
    },
    {
      name: t("testimonials.items.1.name"),
      area: t("testimonials.items.1.area"),
      treatment: t("testimonials.items.1.treatment"),
      text: t("testimonials.items.1.text"),
      rating: 5,
    },
    {
      name: t("testimonials.items.2.name"),
      area: t("testimonials.items.2.area"),
      treatment: t("testimonials.items.2.treatment"),
      text: t("testimonials.items.2.text"),
      rating: 5,
    },
    {
      name: t("testimonials.items.3.name"),
      area: t("testimonials.items.3.area"),
      treatment: t("testimonials.items.3.treatment"),
      text: t("testimonials.items.3.text"),
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b2bed6]/30 border border-[#b2bed6] text-[#001a4b] text-xs font-bold">
            <span>{t("testimonials.badge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#001a4b] tracking-tight">
            {t("testimonials.title")}
          </h2>
          <p className="text-[#001a4b]/80 text-base sm:text-lg">
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#b2bed6]/15 border border-[#b2bed6] p-7 flex flex-col justify-between hover:bg-white hover:border-[#04326d] hover:shadow-card transition-all duration-300 relative group"
            >
              <Quote className="w-8 h-8 text-[#b2bed6] absolute top-6 right-6 rtl:left-6 rtl:right-auto group-hover:text-[#04326d] transition-colors" />

              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <p className="text-[#001a4b]/90 text-base leading-relaxed italic mb-6">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#b2bed6]/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#001a4b] text-sm">
                    {rev.name}
                  </h4>
                  <p className="text-xs text-[#04326d]">{rev.area}</p>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#b2bed6] text-xs font-bold text-[#001a4b] shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#04326d]" />
                  <span>{rev.treatment}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
