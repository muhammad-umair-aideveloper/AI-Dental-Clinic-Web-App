"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { LanguageToggle } from "./LanguageToggle";
import { AuthButton } from "../auth/AuthButton";
import {
  Menu,
  X,
  Phone,
  Sparkles,
} from "lucide-react";

export function Navbar({ onOpenChat }: { onOpenChat?: () => void }) {
  const t = useTranslations();
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#services", label: t("nav.services") },
    { href: "#why-us", label: t("nav.whyUs") },
    { href: "#doctor", label: t("nav.doctor") },
    { href: "#gallery", label: t("nav.gallery") },
    { href: "#testimonials", label: t("nav.testimonials") },
    { href: "#contact", label: t("nav.contact") },
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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#b2bed6]/40 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2.5 group focus:outline-none rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#001a4b] to-[#04326d] flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform duration-200">
              <span className="text-xl">🦷</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-[#001a4b] group-hover:text-[#04326d] transition-colors">
                {t("common.clinicName")}
              </span>
              <span className="text-[10px] text-[#04326d] font-semibold tracking-wide hidden sm:block">
                Gulberg III, Lahore
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-semibold text-[#001a4b]/80 hover:text-[#04326d] transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <LanguageToggle />
            <AuthButton />

            {/* AI Booking Trigger */}
            <button
              onClick={onOpenChat}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#001a4b] to-[#04326d] hover:from-[#04326d] hover:to-[#001a4b] rounded-full shadow-soft transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#b2bed6]" />
              <span>{t("common.bookAppointment")}</span>
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 sm:hidden">
            <LanguageToggle />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#001a4b] hover:bg-[#b2bed6]/20 focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[#001a4b]" />
              ) : (
                <Menu className="w-6 h-6 text-[#001a4b]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#b2bed6]/40 bg-white/98 px-5 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3 py-2 rounded-lg text-base font-semibold text-[#001a4b] hover:bg-[#b2bed6]/20 hover:text-[#04326d] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#b2bed6]/40 flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#b2bed6]/30">
              <span className="text-xs font-bold text-[#001a4b]">Patient Portal:</span>
              <AuthButton />
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenChat?.();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#001a4b] to-[#04326d] hover:from-[#04326d] hover:to-[#001a4b] text-white font-bold text-sm shadow-soft cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#b2bed6]" />
              <span>{t("common.bookAppointment")}</span>
            </button>

            <a
              href={`tel:${t("common.phone")}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#b2bed6] text-[#001a4b] font-semibold text-sm hover:bg-[#b2bed6]/20"
            >
              <Phone className="w-4 h-4 text-[#04326d]" />
              <span>{t("common.callNow")}: {t("common.phone")}</span>
            </a>

            <Link
              href={`/${locale}/admin-dashboard`}
              className="text-center text-xs font-semibold text-[#04326d] hover:text-[#001a4b] py-1 transition-colors"
            >
              🔐 Clinic Staff / Admin Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
