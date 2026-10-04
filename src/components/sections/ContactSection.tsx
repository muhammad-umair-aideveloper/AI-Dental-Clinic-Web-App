"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { CLINIC_CONFIG } from "@/config/clinic";
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  Car,
  CheckCircle2,
  Calendar,
  Send,
} from "lucide-react";

export function ContactSection({ onOpenBooking }: { onOpenBooking?: () => void }) {
  const locale = useLocale();
  const isUrdu = locale === "ur";
  const [showMap, setShowMap] = useState(false);
  const [isOpenNow, setIsOpenNow] = useState<boolean>(true);
  const [statusText, setStatusText] = useState<string>("Open now until 09:00 PM");

  // Compute live open/closed status in Asia/Karachi (UTC+5, no DST)
  useEffect(() => {
    try {
      const now = new Date();
      // Format current hour & minute in Asia/Karachi
      const pkTimeStr = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Karachi",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
      const pkDayStr = now.toLocaleDateString("en-US", {
        timeZone: "Asia/Karachi",
        weekday: "short",
      });

      const [hourStr, minStr] = pkTimeStr.split(":");
      const currentHour = parseInt(hourStr, 10);
      const isSunday = pkDayStr === "Sun";

      if (isSunday) {
        setIsOpenNow(false);
        setStatusText(isUrdu ? "اتوار: صرف ہنگامی کالز" : "Sunday: Emergency Calls Only");
      } else if (currentHour >= 11 && currentHour < 21) {
        setIsOpenNow(true);
        setStatusText(isUrdu ? "اس وقت کھلا ہے (رات 9 بجے تک)" : "Open now until 09:00 PM");
      } else {
        setIsOpenNow(false);
        setStatusText(isUrdu ? "اس وقت بند ہے (صبح 11 بجے کھلتا ہے)" : "Closed now · Opens at 11:00 AM");
      }
    } catch (e) {
      setIsOpenNow(true);
    }
  }, [isUrdu]);

  return (
    <section id="location" className="py-16 md:py-24 bg-white border-b border-[#E5EAF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F6F8FA] border border-[#E5EAF0] text-xs font-semibold text-[#0F172A]">
            <span
              className={`w-2 h-2 rounded-full ${
                isOpenNow ? "bg-[#2E9C89] animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="text-[#0F172A]">{statusText}</span>
          </div>

          <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F172A] tracking-tight">
            {isUrdu ? "کلینک کا پتہ و اوقات" : "Location & Clinic Hours"}
          </h2>
          <p className="text-sm sm:text-base text-[#5B6B7F]">
            {isUrdu
              ? "مین بلیوارڈ گلبرگ III، لاہور — مریضوں کے لیے پرسکون ماحول اور مخصوص پارکنگ۔"
              : "Centrally located on Main Boulevard, Gulberg III, Lahore with dedicated on-site parking and valet."}
          </p>
        </div>

        {/* 2-Column Clinical Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Location & Timings Details */}
          <div className="lg:col-span-6 space-y-5">
            {/* Address & Directions Card */}
            <div className="p-6 rounded-2xl bg-[#F6F8FA] border border-[#E5EAF0] space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#E5EAF0] flex items-center justify-center text-[#2E9C89] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A]">
                    {isUrdu ? "کلینک کا پتہ" : "Clinic Address"}
                  </h4>
                  <p className="text-xs text-[#5B6B7F] mt-1 leading-relaxed">
                    {isUrdu ? CLINIC_CONFIG.addressUr : CLINIC_CONFIG.address}
                  </p>
                </div>
              </div>

              {/* Parking details */}
              <div className="p-3 bg-white rounded-xl border border-[#E5EAF0] flex items-start gap-2.5 text-xs text-[#5B6B7F]">
                <Car className="w-4 h-4 text-[#2E9C89] shrink-0 mt-0.5" />
                <span>{isUrdu ? CLINIC_CONFIG.parkingUr : CLINIC_CONFIG.parking}</span>
              </div>

              {/* Get Directions Google Maps Deep Link */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                <a
                  href={CLINIC_CONFIG.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F172A] hover:bg-[#2E9C89] text-white text-xs font-semibold transition-clinical active:scale-95 shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#4FB8A6]" />
                  <span>{isUrdu ? "گوگل میپس پر راستہ دیکھیں" : "Get Directions"}</span>
                </a>

                <button
                  onClick={() => setShowMap(!showMap)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E5EAF0] text-xs font-semibold transition-clinical"
                >
                  <span>{showMap ? (isUrdu ? "نقشہ چھپائیں" : "Hide Map") : (isUrdu ? "نقشہ کھولیں" : "Show Map")}</span>
                </button>
              </div>

              {/* Embedded map lazy-loaded on user click */}
              {showMap && (
                <div className="mt-4 rounded-xl overflow-hidden border border-[#E5EAF0] aspect-video w-full bg-slate-100 animate-clinical-in">
                  <iframe
                    title="Lahore Dental Clinic Location Map"
                    src="https://maps.google.com/maps?q=Gulberg+III+Lahore+Pakistan&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {/* Weekly Timings Card */}
            <div className="p-6 rounded-2xl bg-[#F6F8FA] border border-[#E5EAF0] space-y-3">
              <div className="flex items-center gap-2.5 mb-2">
                <Clock className="w-4 h-4 text-[#2E9C89]" />
                <h4 className="text-sm font-bold text-[#0F172A]">
                  {isUrdu ? "ہفتہ وار کلینیکل اوقات" : "Weekly Clinical Schedule"}
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                {CLINIC_CONFIG.timings.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-[#E5EAF0] last:border-0"
                  >
                    <span className="font-medium text-[#0F172A]">{isUrdu ? t.daysUr : t.days}</span>
                    <span className="text-[#5B6B7F] font-mono">{isUrdu ? t.hoursUr : t.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Quick Direct Booking & Emergency Box */}
          <div className="lg:col-span-6 space-y-5">
            {/* Quick Action Card */}
            <div className="p-6 rounded-2xl bg-white border border-[#E5EAF0] shadow-clinical space-y-5">
              <div>
                <span className="text-xs font-bold text-[#2E9C89] uppercase tracking-wider block">
                  {isUrdu ? "تیز رفتار بکنگ" : "Instant Appointment"}
                </span>
                <h3 className="font-sans text-xl font-bold text-[#0F172A] mt-1">
                  {isUrdu ? "بغیر اکاؤنٹ وقت بک کریں" : "Frictionless Patient Booking"}
                </h3>
                <p className="text-xs text-[#5B6B7F] mt-1.5 leading-relaxed">
                  {isUrdu
                    ? "کسی پاس ورڈ یا لاگ ان کی ضرورت نہیں۔ اپنا نام اور واٹس ایپ نمبر درج کریں اور مطلوبہ وقت منتخب کریں۔"
                    : "No registration or password needed. Select your treatment and preferred time slot in 30 seconds."}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={onOpenBooking}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#0F172A] hover:bg-[#2E9C89] text-white font-semibold text-sm transition-clinical active:scale-98 shadow-sm cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#4FB8A6]" />
                  <span>{isUrdu ? "ابھی وقت منتخب کریں" : "Select Available Time Slot"}</span>
                </button>

                <a
                  href={`https://wa.me/${CLINIC_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                    isUrdu ? CLINIC_CONFIG.whatsappPrefillUr : CLINIC_CONFIG.whatsappPrefill
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#F6F8FA] hover:bg-[#E5EAF0] text-[#0F172A] font-semibold text-sm border border-[#E5EAF0] transition-clinical active:scale-98"
                >
                  <MessageCircle className="w-4 h-4 text-[#2E9C89]" />
                  <span>{isUrdu ? "واٹس ایپ پر رابطہ" : "Chat Directly on WhatsApp"}</span>
                </a>
              </div>

              {/* 24/7 Dental Emergency Hotline */}
              <div className="p-4 rounded-xl bg-[#FEE2E2]/50 border border-[#FECACA] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#D64545] block">
                    {isUrdu ? "24/7 ہنگامی دانتوں کا درد" : "24/7 Dental Emergency Hotline"}
                  </span>
                  <span className="text-[#7F1D1D] text-[11px]">
                    {isUrdu ? "شدید درد یا چوٹ کی صورت میں فوری کال" : "Immediate trauma & acute pain relief"}
                  </span>
                </div>
                <a
                  href={`tel:${CLINIC_CONFIG.emergencyPhone}`}
                  className="px-3.5 py-1.5 rounded-lg bg-[#D64545] hover:bg-[#B91C1C] text-white font-bold text-xs transition-colors shrink-0"
                >
                  {CLINIC_CONFIG.emergencyPhone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
