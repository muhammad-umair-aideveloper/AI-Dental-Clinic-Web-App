"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Heart,
  ChevronLeft,
  Wifi,
  Battery,
  Signal,
  MessageSquare,
  Phone,
  Video,
  Clock,
  Users,
  Star,
  Award,
  CheckCircle2,
  Sparkles,
  Calendar as CalendarIcon,
  ShieldCheck,
  Stethoscope,
  GraduationCap,
} from "lucide-react";

interface DoctorSectionProps {
  onOpenChat?: () => void;
  onBookAppointment?: (date?: string, time?: string) => void;
}

const MONTHS = [
  "October",
  "November",
  "December",
  "January",
  "February",
];

const TIME_SLOTS = [
  "10:30 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "03:30 PM",
  "05:00 PM",
];

export function DoctorSection({ onOpenChat, onBookAppointment }: DoctorSectionProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isUrdu = locale === "ur";

  // Doctor Card Interactive States
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("November");
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(5);
  const [selectedTime, setSelectedTime] = useState<string>("10:30 AM");
  const [quickBookConfirmed, setQuickBookConfirmed] = useState(false);

  // Generate 7 days for the selected month view (mimicking the screenshot: 2 Sun, 3 Mon, 4 Tue, 5 Wed, 6 Thu, 7 Fri, 8 Sat)
  const daysList = [
    { num: 2, name: isUrdu ? "اتوار" : "Sun", dateStr: "2026-11-02" },
    { num: 3, name: isUrdu ? "پیر" : "Mon", dateStr: "2026-11-03" },
    { num: 4, name: isUrdu ? "منگل" : "Tue", dateStr: "2026-11-04" },
    { num: 5, name: isUrdu ? "بدھ" : "Wed", dateStr: "2026-11-05" },
    { num: 6, name: isUrdu ? "جمعرات" : "Thu", dateStr: "2026-11-06" },
    { num: 7, name: isUrdu ? "جمعہ" : "Fri", dateStr: "2026-11-07" },
    { num: 8, name: isUrdu ? "ہفتہ" : "Sat", dateStr: "2026-11-08" },
  ];

  // Convert "10:30 AM" to 24h "10:30" or "14:00" for the booking modal
  const convertTimeTo24h = (time12: string) => {
    const [time, modifier] = time12.split(" ");
    let [hours, minutes] = time.split(":");
    let h = parseInt(hours, 10);
    if (modifier === "PM" && h < 12) h += 12;
    if (modifier === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${minutes || "00"}`;
  };

  const handleBookClick = () => {
    const selectedDayObj = daysList.find((d) => d.num === selectedDayNumber);
    const dateStr = selectedDayObj ? selectedDayObj.dateStr : new Date().toISOString().split("T")[0];
    const time24h = convertTimeTo24h(selectedTime);

    if (onBookAppointment) {
      onBookAppointment(dateStr, time24h);
    } else if (onOpenChat) {
      onOpenChat();
    } else {
      setQuickBookConfirmed(true);
      setTimeout(() => setQuickBookConfirmed(false), 4000);
    }
  };

  return (
    <section id="doctor" className="py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      {/* Ambient Glassmorphic Background Blur Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#001a4b]/10 via-[#04326d]/15 to-[#b2bed6]/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#04326d]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 left-10 w-80 h-80 bg-[#b2bed6]/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-[#b2bed6]/50 text-[#001a4b] text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#04326d]" />
            <span>{isUrdu ? "پی ایم ڈی سی تصدیق شدہ پرنسپل سرجن" : "PMDC Certified Principal Dental Surgeon"}</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#001a4b] tracking-tight leading-tight">
            {isUrdu ? "ڈاکٹر سارہ طارق خان سے ملیں" : "Meet Dr. Sarah Tariq Khan"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-sans leading-relaxed">
            {isUrdu
              ? "لاہور کی معروف ریسٹوریٹو اور آرتھوڈانٹک سرجن — جدید ٹیکنالوجی اور ہمدردانہ انداز کے ساتھ بہترین مسکراہٹیں بنائیں۔"
              : "Chief Dental Surgeon & Aesthetic Restorative Specialist in Gulberg III, Lahore with over 14+ years of painless clinical excellence."}
          </p>
        </div>

        {/* 2-Column Responsive Layout: Left Info & Right Glassmorphic UI Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Doctor Credentials & Value Props */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-start order-2 lg:order-1 font-sans">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#04326d] font-bold block font-sans">
                {t("doctor.badge")}
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[#001a4b] tracking-tight leading-tight">
                {t("doctor.name")}
              </h3>
              <p className="text-[#04326d] font-semibold text-sm sm:text-base font-sans">
                {t("doctor.qualifications")}
              </p>
              <p className="text-slate-500 text-xs sm:text-sm flex items-center justify-center lg:justify-start gap-1.5 pt-1 font-sans">
                <Clock className="w-4 h-4 text-[#04326d]" />
                <span>{t("doctor.experience")}</span>
              </p>
            </div>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {t("doctor.bio")}
            </p>

            {/* Trust Points Glass Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-[#b2bed6]/40 shadow-xs flex items-start gap-3 text-start">
                <div className="w-9 h-9 rounded-xl bg-[#04326d] text-white flex items-center justify-center shrink-0 shadow-soft">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#001a4b] text-sm">Gold Medalist</h4>
                  <p className="text-xs text-slate-500">BDS Gold Medalist & UK Certified Implantologist.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-[#b2bed6]/40 shadow-xs flex items-start gap-3 text-start">
                <div className="w-9 h-9 rounded-xl bg-[#04326d] text-white flex items-center justify-center shrink-0 shadow-soft">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#001a4b] text-sm">PMDC Reg # 12489-D</h4>
                  <p className="text-xs text-slate-500">Fully licensed & verified specialist practitioner.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-[#b2bed6]/40 shadow-xs flex items-start gap-3 text-start">
                <div className="w-9 h-9 rounded-xl bg-[#04326d] text-white flex items-center justify-center shrink-0 shadow-soft">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#001a4b] text-sm">8,500+ Happy Smiles</h4>
                  <p className="text-xs text-slate-500">Proven track record across braces, RCT, & veneers.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-[#b2bed6]/40 shadow-xs flex items-start gap-3 text-start">
                <div className="w-9 h-9 rounded-xl bg-[#04326d] text-white flex items-center justify-center shrink-0 shadow-soft">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#001a4b] text-sm">Gentle & Pain-Free</h4>
                  <p className="text-xs text-slate-500">Advanced computerized local anesthesia comfort.</p>
                </div>
              </div>
            </div>

            {/* Quick Call / WhatsApp Contact Links */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href="tel:+923001234567"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 hover:bg-white text-[#001a4b] font-semibold text-xs border border-[#b2bed6]/60 shadow-xs transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-[#04326d]" />
                <span>Call Clinic Directly</span>
              </a>
              <a
                href="https://wa.me/923001234567?text=Hello%20Dr.%20Sarah%2C%20I%20would%20like%20to%20consult%20regarding%20my%20dental%20treatment."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Dr. Sarah</span>
              </a>
            </div>
          </div>

          {/* Right Column: THE GLASSMORPHIC DOCTOR UI CARD (Exact Match to Uploaded Screenshot) */}
          <div className="lg:col-span-6 flex justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-[360px] sm:max-w-[390px]">
              {/* Glowing Glass Drop Shadows */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#001a4b]/20 via-[#04326d]/20 to-[#b2bed6]/30 rounded-[2.8rem] blur-xl transform scale-102 -z-10" />

              {/* Main Outer Phone Glassmorphic Card */}
              <div className="relative rounded-[2.5rem] bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_25px_60px_-15px_rgba(0,26,75,0.22)] p-4 sm:p-5 text-slate-800 overflow-hidden transition-all duration-300">
                {/* Simulated Phone Top Status Bar */}
                <div className="flex items-center justify-between px-3 pt-1 pb-3 text-slate-800 text-xs font-semibold">
                  <span className="font-mono text-[13px] tracking-tight text-slate-900 font-bold">9:41</span>
                  {/* Dynamic Island Pill */}
                  <div className="w-24 h-5 rounded-full bg-slate-900/90 backdrop-blur-md mx-auto shadow-inner" />
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <Signal className="w-3.5 h-3.5" />
                    <Wifi className="w-3.5 h-3.5" />
                    <Battery className="w-4 h-4" />
                  </div>
                </div>

                {/* Card Header Area (Doctor Image + Profile Overlay) */}
                <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-b from-[#04326d] via-[#04326d] to-[#001a4b] text-white shadow-soft">
                  {/* Top Bar inside image (Back & Heart Buttons) */}
                  <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDayNumber(5);
                        setSelectedTime("10:30 AM");
                      }}
                      title="Reset Selection"
                      className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                      <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsFavorite(!isFavorite)}
                      title="Favorite Doctor"
                      className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isFavorite ? "fill-rose-500 text-rose-500" : "text-white"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Doctor Portrait Image */}
                  <div className="relative pt-6 px-4 flex justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1594824813633-47000dd5a953?auto=format&fit=crop&w=700&q=80"
                      alt="Dr. Sarah Tariq Khan - Chief Dental Surgeon"
                      className="w-56 h-56 sm:w-60 sm:h-60 object-cover object-top mask-radial pointer-events-none drop-shadow-md"
                      loading="lazy"
                    />
                    {/* Bottom gradient fade for text legibility */}
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#001a4b] via-[#001a4b]/80 to-transparent" />
                  </div>

                  {/* Doctor Info & 3 Action Circles (Exactly like screenshot) */}
                  <div className="relative z-10 p-4 pt-1 flex items-end justify-between gap-2">
                    <div className="space-y-1">
                      <h4 className="text-lg sm:text-xl font-bold tracking-tight text-white !text-white leading-tight">
                        Dr. Sarah Tariq
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-sky-100 font-medium">
                          {isUrdu ? "چیف ڈینٹسٹ" : "Chief Dentist"}
                        </span>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-amber-300 border border-white/20">
                          <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                          <span>4.9</span>
                        </div>
                      </div>
                    </div>

                    {/* 3 Circular Glass Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onOpenChat}
                        title="Chat with Dr. Sarah Assistant"
                        className="w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md border border-white/40 flex items-center justify-center text-white transition-all active:scale-90 cursor-pointer shadow-xs"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      <a
                        href="tel:+923001234567"
                        title="Call Doctor Clinic"
                        className="w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md border border-white/40 flex items-center justify-center text-white transition-all active:scale-90 cursor-pointer shadow-xs"
                      >
                        <Phone className="w-4 h-4" />
                      </a>

                      <a
                        href="https://wa.me/923001234567?text=Hello%20Dr.%20Sarah%2C%20I%20would%20like%20to%20consult%20via%20video."
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Video / WhatsApp Consultation"
                        className="w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md border border-white/40 flex items-center justify-center text-white transition-all active:scale-90 cursor-pointer shadow-xs"
                      >
                        <Video className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* 3 Metrics Glass Cards (Experience, Patients, Reviews) */}
                <div className="grid grid-cols-3 gap-2 my-4">
                  {/* Experience */}
                  <div className="p-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#04326d]/10 text-[#04326d] flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[12px] font-extrabold text-[#001a4b] leading-tight">14+ yrs</p>
                      <p className="text-[10px] text-slate-500 font-medium">Experience</p>
                    </div>
                  </div>

                  {/* Patients */}
                  <div className="p-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#04326d]/10 text-[#04326d] flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[12px] font-extrabold text-[#001a4b] leading-tight">8.5K+</p>
                      <p className="text-[10px] text-slate-500 font-medium">Patients</p>
                    </div>
                  </div>

                  {/* Reviews */}
                  <div className="p-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[12px] font-extrabold text-[#001a4b] leading-tight">4.9</p>
                      <p className="text-[10px] text-slate-500 font-medium">Reviews</p>
                    </div>
                  </div>
                </div>

                {/* Select Date Section */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 tracking-wide">
                      {isUrdu ? "تاریخ منتخب کریں" : "Select Date"}
                    </span>
                    <span className="text-[11px] font-semibold text-[#04326d]">
                      {selectedMonth} 2026
                    </span>
                  </div>

                  {/* Months Horizontal Selector */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                    {MONTHS.map((m) => {
                      const isSelected = selectedMonth === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSelectedMonth(m)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                            isSelected
                              ? "bg-[#b2bed6]/40 text-[#001a4b] border border-[#b2bed6] shadow-xs"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>

                  {/* Day Picker Pills (7 Horizontal Days) */}
                  <div className="grid grid-cols-7 gap-1 pt-1">
                    {daysList.map((day) => {
                      const isSelected = selectedDayNumber === day.num;
                      return (
                        <div key={day.num} className="flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => setSelectedDayNumber(day.num)}
                            className={`w-full py-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#04326d] text-white shadow-soft scale-105"
                                : "bg-white/60 hover:bg-white text-slate-700 border border-slate-200/60"
                            }`}
                          >
                            <span className="text-[14px] font-extrabold leading-none">{day.num}</span>
                            <span
                              className={`text-[9px] font-semibold mt-1 ${
                                isSelected ? "text-[#b2bed6]" : "text-slate-400"
                              }`}
                            >
                              {day.name}
                            </span>
                          </button>
                          {/* Dot indicator underneath active pill (matching screenshot) */}
                          <div
                            className={`w-1.5 h-1.5 rounded-full mt-1.5 transition-all ${
                              isSelected ? "bg-[#04326d]" : "bg-transparent"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Select Time Section */}
                <div className="space-y-2 my-2.5">
                  <span className="text-xs font-bold text-slate-800 tracking-wide block">
                    {isUrdu ? "وقت منتخب کریں" : "Select Time"}
                  </span>

                  <div className="grid grid-cols-3 gap-1.5">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#04326d] text-white border-[#04326d] shadow-xs"
                              : "bg-white/70 text-slate-700 border-slate-200/80 hover:border-[#04326d]/40"
                          }`}
                        >
                          <Clock className={`w-3 h-3 ${isSelected ? "text-[#b2bed6]" : "text-slate-400"}`} />
                          <span>{slot}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Main CTA Button (Exact copy of screenshot button) */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleBookClick}
                    className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#001a4b] to-[#04326d] hover:from-[#04326d] hover:to-[#001a4b] text-white font-semibold text-base font-sans shadow-soft transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>
                      {isUrdu
                        ? `وقت بک کریں — ${selectedTime} (${selectedMonth} ${selectedDayNumber})`
                        : `Book Appointment — Free Checkup`}
                    </span>
                  </button>
                </div>

                {/* Quick Feedback Notification if booked */}
                {quickBookConfirmed && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center animate-in fade-in duration-200">
                    ✓ Slot {selectedMonth} {selectedDayNumber} at {selectedTime} reserved!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
