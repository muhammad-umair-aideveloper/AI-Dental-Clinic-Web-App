"use client";

import { useTranslations } from "next-intl";
import { Sparkles, MessageCircle, ShieldCheck, CheckCircle2, Star, Calendar } from "lucide-react";

export function HeroSection({ onOpenChat }: { onOpenChat?: () => void }) {
  const t = useTranslations();

  return (
    <section className="bg-zinc-50 bg-grid-pattern min-h-[90vh] flex items-center py-20 relative overflow-hidden">
      {/* Very subtle radial gradient background, no blobs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(178,190,214,0.1)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Content Column */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-start">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-[#001a4b] tracking-tight leading-[1.1]">
              {t("hero.headline")}
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-sans">
              {t("hero.subheadline")}
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onOpenChat}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-full bg-[#001a4b] hover:bg-[#04326d] text-white font-semibold text-base shadow-sm transition-colors cursor-pointer"
              >
                <Calendar className="w-5 h-5 text-[#b2bed6]" />
                <span>{t("hero.ctaBook")}</span>
              </button>

              <a
                href={`https://wa.me/${t("common.whatsappNumber")}?text=${encodeURIComponent(
                  t("common.whatsappText")
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-full bg-white hover:bg-zinc-50 text-[#001a4b] font-semibold text-base border border-[#b2bed6] transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-[#04326d]" />
                <span>{t("hero.ctaWhatsApp")}</span>
              </a>
            </div>

            {/* 3 Trust points */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#001a4b] font-semibold px-4 py-2 rounded-full border border-slate-200/60 bg-white">
                <CheckCircle2 className="w-4 h-4 text-[#04326d] shrink-0" />
                <span>{t("hero.trustPoints.painless")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#001a4b] font-semibold px-4 py-2 rounded-full border border-slate-200/60 bg-white">
                <ShieldCheck className="w-4 h-4 text-[#04326d] shrink-0" />
                <span>{t("hero.trustPoints.sterilized")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#001a4b] font-semibold px-4 py-2 rounded-full border border-slate-200/60 bg-white">
                <Star className="w-4 h-4 text-[#04326d] shrink-0" />
                <span>{t("hero.trustPoints.verified")}</span>
              </div>
            </div>
          </div>

          {/* Right Visual Card Column - Asymmetric Bento Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="col-span-2 rounded-2xl border border-slate-200/60 bg-white p-2 shadow-sm overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=80"
                alt="Lahore Dental Clinic"
                className="w-full h-48 sm:h-64 object-cover rounded-xl"
                loading="eager"
              />
              <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#b2bed6] bg-white text-[#04326d] uppercase text-[10px] font-bold tracking-[0.15em]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gulberg III, Lahore
              </div>
            </div>
            <div className="col-span-1 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col justify-center text-center">
              <div className="text-3xl font-bold text-[#001a4b] mb-1">4.9<Star className="w-5 h-5 inline-block text-amber-400 fill-amber-400 ml-1" /></div>
              <div className="text-xs text-slate-500 uppercase tracking-widest">{t("hero.satisfaction")}</div>
            </div>
            <div className="col-span-1 rounded-2xl border border-slate-200/60 bg-zinc-50 p-6 shadow-sm flex flex-col justify-center text-center">
              <div className="text-3xl font-bold text-[#001a4b] mb-1">14+</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest">Years Exp</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
