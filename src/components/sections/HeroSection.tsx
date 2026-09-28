"use client";

import { useTranslations } from "next-intl";
import { Sparkles, MessageCircle, ShieldCheck, CheckCircle2, Star, Calendar } from "lucide-react";

export function HeroSection({ onOpenChat }: { onOpenChat?: () => void }) {
  const t = useTranslations();

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 bg-gradient-to-b from-[#b2bed6]/25 via-white to-[#b2bed6]/10">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-[#b2bed6]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-12 left-10 -z-10 w-80 h-80 bg-[#04326d]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Content Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#b2bed6]/30 border border-[#b2bed6] text-[#001a4b] text-xs sm:text-sm font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-[#04326d]" />
              <span>{t("hero.badge")}</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#001a4b] tracking-tight leading-[1.15]">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#001a4b] via-[#04326d] to-[#04326d]">
                {t("hero.headline")}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-[#001a4b]/80 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-sans">
              {t("hero.subheadline")}
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onOpenChat}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#001a4b] to-[#04326d] hover:from-[#04326d] hover:to-[#001a4b] text-white font-semibold text-base font-sans shadow-soft hover:shadow-glow transition-all duration-200 active:scale-98 group cursor-pointer"
              >
                <Calendar className="w-5 h-5 text-[#b2bed6] group-hover:scale-110 transition-transform" />
                <span>{t("hero.ctaBook")}</span>
                <span className="inline-block px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-white/20 rounded-md">
                  AI
                </span>
              </button>

              <a
                href={`https://wa.me/${t("common.whatsappNumber")}?text=${encodeURIComponent(
                  t("common.whatsappText")
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white hover:bg-[#b2bed6]/20 text-[#001a4b] font-semibold text-base font-sans border border-[#b2bed6] shadow-xs transition-all duration-200 active:scale-98"
              >
                <MessageCircle className="w-5 h-5 text-[#04326d]" />
                <span>{t("hero.ctaWhatsApp")}</span>
              </a>
            </div>

            {/* 3 Trust points */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#b2bed6]/40">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm text-[#001a4b] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#04326d] shrink-0" />
                <span>{t("hero.trustPoints.painless")}</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm text-[#001a4b] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#04326d] shrink-0" />
                <span>{t("hero.trustPoints.sterilized")}</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm text-[#001a4b] font-semibold">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                <span>{t("hero.trustPoints.verified")}</span>
              </div>
            </div>
          </div>

          {/* Right Visual Card Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Doctor / Clinic Hero Card */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#b2bed6]/30 to-white border border-[#b2bed6] p-3 shadow-card">
                <div className="relative aspect-[4/3] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-[#b2bed6]/40">
                  <img
                    src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=80"
                    alt="Lahore Dental Clinic"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001a4b]/80 via-transparent to-transparent" />
                  
                  {/* Float badge inside image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white p-2">
                    <div>
                      <p className="text-xs uppercase font-bold text-sky-200 tracking-wider">Gulberg III, Lahore</p>
                      <p className="text-sm font-semibold text-white">State-of-the-Art Digital Dental Suite</p>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-[#04326d]/90 backdrop-blur-sm flex items-center justify-center text-sm">
                      ✨
                    </span>
                  </div>
                </div>

                {/* Floating Metrics */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-[#b2bed6]/20 border border-[#b2bed6]/60">
                    <p className="text-lg font-bold text-[#001a4b]">{t("hero.reviewsCount")}</p>
                    <p className="text-xs text-[#04326d] font-medium">{t("hero.satisfaction")}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#04326d]/10 border border-[#04326d]/20">
                    <p className="text-lg font-bold text-[#001a4b]">14+ Years</p>
                    <p className="text-xs text-[#04326d] font-medium">Clinical Mastery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
