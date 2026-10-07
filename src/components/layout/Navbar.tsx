"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { LanguageToggle } from "./LanguageToggle";
import { Menu, X, MessageCircle, Calendar, Lock } from "lucide-react";
import { CLINIC_CONFIG } from "@/config/clinic";

export function Navbar({ onOpenBooking }: { onOpenBooking?: () => void }) {
  const t = useTranslations();
  const locale = useLocale();
  const isUrdu = locale === "ur";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#treatments", label: isUrdu ? "علاجات و فیس" : "Treatments" },
    { href: "#before-after", label: isUrdu ? "نتائج" : "Results" },
    { href: "#doctor", label: isUrdu ? "ڈاکٹر و پروٹوکول" : "Doctor & Safety" },
    { href: "#location", label: isUrdu ? "کلینک و اوقات" : "Location" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/75 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_4px_24px_rgba(15,23,42,0.04)] transition-clinical">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Clinical Brand */}
          <a href="#" className="flex items-center gap-3 group focus:outline-none rounded-lg p-1">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E5EAF0] overflow-hidden p-0.5 flex items-center justify-center shrink-0 group-hover:border-[#4FB8A6] transition-clinical">
              <img
                src="/images/logo.png"
                alt="Lahore Dental Clinic"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-lg sm:text-xl tracking-tight text-[#0F172A]">
                {isUrdu ? CLINIC_CONFIG.nameUr : CLINIC_CONFIG.name}
              </span>
              <span className="text-[11px] text-[#5B6B7F] font-medium leading-none">
                {isUrdu ? "گلبرگ III، لاہور" : "Gulberg III, Lahore"}
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-[#5B6B7F] hover:text-[#0F172A] transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs: WhatsApp + Book Consultation + Language */}
          <div className="hidden sm:flex items-center gap-3">
            <LanguageToggle />

            {/* WhatsApp Doctor Quick CTA */}
            <a
              href={`https://wa.me/${CLINIC_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                isUrdu ? CLINIC_CONFIG.whatsappPrefillUr : CLINIC_CONFIG.whatsappPrefill
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0F172A] bg-[#F6F8FA] hover:bg-[#E5EAF0] border border-[#E5EAF0] rounded-full transition-clinical active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#2E9C89]" />
              <span>{isUrdu ? "واٹس ایپ" : "WhatsApp"}</span>
            </a>

            {/* Book Consultation Trigger */}
            <button
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#2E9C89] rounded-full transition-clinical active:scale-95 shadow-sm cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#4FB8A6]" />
              <span>{isUrdu ? "وقت بک کریں" : "Book Consultation"}</span>
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 sm:hidden">
            <LanguageToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#0F172A] hover:bg-[#F6F8FA] border border-[#E5EAF0] focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#E5EAF0] bg-white px-5 py-4 space-y-3 animate-clinical-in">
          <nav className="flex flex-col space-y-1.5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-[#0F172A] hover:bg-[#F6F8FA] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#E5EAF0] flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking?.();
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0F172A] text-white font-semibold text-sm cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#4FB8A6]" />
              <span>{isUrdu ? "وقت بک کریں" : "Book Consultation"}</span>
            </button>

            <a
              href={`https://wa.me/${CLINIC_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                isUrdu ? CLINIC_CONFIG.whatsappPrefillUr : CLINIC_CONFIG.whatsappPrefill
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#E5EAF0] bg-[#F6F8FA] text-[#0F172A] font-semibold text-sm hover:bg-[#E5EAF0] transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#2E9C89]" />
              <span>{isUrdu ? "واٹس ایپ ڈاکٹر" : "WhatsApp Doctor"}</span>
            </a>

            <div className="pt-2 flex justify-center">
              <Link
                href={`/${locale}/admin-dashboard`}
                className="inline-flex items-center gap-1.5 text-xs text-[#5B6B7F] hover:text-[#0F172A] py-1"
              >
                <Lock className="w-3 h-3" />
                <span>{isUrdu ? "سٹاف لاگ ان" : "Clinic Staff Portal"}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
