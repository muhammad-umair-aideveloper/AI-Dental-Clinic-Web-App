"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useTransition } from "react";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "ur" : "en";

    // Persist choice in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_locale", nextLocale);
    }

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#001a4b] bg-[#b2bed6]/30 hover:bg-[#b2bed6]/50 border border-[#b2bed6] rounded-full transition-all duration-200 active:scale-95 shadow-xs cursor-pointer"
      title="Switch Language / زبان تبدیل کریں"
      aria-label="Switch Language"
    >
      <Globe className="w-3.5 h-3.5 text-[#04326d]" />
      <span className="tracking-wide">
        {locale === "en" ? "اردو (UR)" : "English (EN)"}
      </span>
    </button>
  );
}
