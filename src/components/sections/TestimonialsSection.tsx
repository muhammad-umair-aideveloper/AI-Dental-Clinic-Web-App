"use client";

import { useTranslations } from "next-intl";
import { Star, Quote } from "lucide-react";

export function TestimonialsSection() {
  const t = useTranslations();

  const reviews = [
    { name: t("testimonials.items.0.name"), area: t("testimonials.items.0.area"), treatment: t("testimonials.items.0.treatment"), text: t("testimonials.items.0.text"), rating: 5 },
    { name: t("testimonials.items.1.name"), area: t("testimonials.items.1.area"), treatment: t("testimonials.items.1.treatment"), text: t("testimonials.items.1.text"), rating: 5 },
    { name: t("testimonials.items.2.name"), area: t("testimonials.items.2.area"), treatment: t("testimonials.items.2.treatment"), text: t("testimonials.items.2.text"), rating: 5 },
    { name: t("testimonials.items.3.name"), area: t("testimonials.items.3.area"), treatment: t("testimonials.items.3.treatment"), text: t("testimonials.items.3.text"), rating: 5 },
  ];

  return (
    <section id="testimonials" className="bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#b2bed6] bg-white text-[#04326d] uppercase text-[10px] font-bold tracking-[0.15em]">
            {t("testimonials.badge")}
          </div>
          <h2 className="text-4xl font-extrabold text-[#001a4b] tracking-tight">
            {t("testimonials.title")}
          </h2>
          <p className="text-slate-500 text-lg">
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {reviews.map((rev, idx) => {
            let colSpan = "md:col-span-5";
            if (idx === 0 || idx === 3) colSpan = "md:col-span-7";
            return (
              <div
                key={idx}
                className={`${colSpan} bg-zinc-50 border border-slate-200/60 rounded-2xl p-7 flex flex-col justify-between hover:border-[#04326d]/40 hover:bg-white transition-colors duration-300 relative group`}
              >
                <Quote className="w-8 h-8 text-[#b2bed6] mb-4" />
                
                <p className="text-slate-700 italic leading-relaxed mb-6">
                  "{rev.text}"
                </p>

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-4">
                  <div>
                    <h4 className="font-bold text-[#001a4b]">{rev.name}</h4>
                    <p className="text-xs text-slate-500">{rev.area}</p>
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[#04326d] text-[10px] font-bold uppercase tracking-widest shadow-sm">
                    {rev.treatment}
                  </div>
                </div>
                
                <div className="absolute top-7 right-7 flex">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
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
