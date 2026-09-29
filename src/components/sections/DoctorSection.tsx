"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Heart, ChevronLeft, Wifi, Battery, Signal, MessageSquare, Phone, Video,
  Clock, Users, Star, Award, CheckCircle2, Sparkles, Calendar as CalendarIcon,
  ShieldCheck, Stethoscope, GraduationCap
} from "lucide-react";

interface DoctorSectionProps {
  onOpenChat?: () => void;
  onBookAppointment?: (date?: string, time?: string) => void;
}

const MONTHS = ["October", "November", "December", "January", "February"];
const TIME_SLOTS = ["10:30 AM", "11:00 AM", "12:00 PM", "01:00 PM", "03:30 PM", "05:00 PM"];

export function DoctorSection({ onOpenChat, onBookAppointment }: DoctorSectionProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isUrdu = locale === "ur";

  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("November");
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(5);
  const [selectedTime, setSelectedTime] = useState<string>("10:30 AM");
  const [quickBookConfirmed, setQuickBookConfirmed] = useState(false);

  const daysList = [
    { num: 2, name: isUrdu ? "اتوار" : "Sun", dateStr: "2026-11-02" },
    { num: 3, name: isUrdu ? "پیر" : "Mon", dateStr: "2026-11-03" },
    { num: 4, name: isUrdu ? "منگل" : "Tue", dateStr: "2026-11-04" },
    { num: 5, name: isUrdu ? "بدھ" : "Wed", dateStr: "2026-11-05" },
    { num: 6, name: isUrdu ? "جمعرات" : "Thu", dateStr: "2026-11-06" },
    { num: 7, name: isUrdu ? "جمعہ" : "Fri", dateStr: "2026-11-07" },
    { num: 8, name: isUrdu ? "ہفتہ" : "Sat", dateStr: "2026-11-08" },
  ];

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
    <section id="doctor" className="bg-white py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#b2bed6] bg-white text-[#04326d] uppercase text-[10px] font-bold tracking-[0.15em]">
              {isUrdu ? "پی ایم ڈی سی تصدیق شدہ پرنسپل سرجن" : "PMDC Certified Principal Dental Surgeon"}
            </div>
            
            <div>
              <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#001a4b] tracking-tight mb-2">
                {isUrdu ? "ڈاکٹر سارہ طارق خان سے ملیں" : "Meet Dr. Sarah Tariq Khan"}
              </h2>
              <p className="text-slate-600 text-lg">
                {t("doctor.qualifications")}
              </p>
            </div>

            <p className="text-slate-500 leading-relaxed text-base">
              {t("doctor.bio")}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200/60 bg-zinc-50 text-sm font-semibold text-[#001a4b]">
                <Clock className="w-4 h-4 text-[#04326d]" /> 14+ Years Experience
              </div>
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200/60 bg-zinc-50 text-sm font-semibold text-[#001a4b]">
                <Users className="w-4 h-4 text-[#04326d]" /> 8.5K+ Patients
              </div>
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200/60 bg-zinc-50 text-sm font-semibold text-[#001a4b]">
                <Award className="w-4 h-4 text-[#04326d]" /> Gold Medalist
              </div>
            </div>
          </div>

          {/* Right Column (Doctor UI Card) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[380px] bg-zinc-50 border border-slate-200/60 rounded-3xl p-5 shadow-sm transition-colors hover:border-[#04326d]/40">
              
              <div className="flex items-center justify-between px-2 pt-1 pb-4 text-slate-500 text-xs font-semibold">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <Signal className="w-3.5 h-3.5" />
                  <Wifi className="w-3.5 h-3.5" />
                  <Battery className="w-4 h-4" />
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-white mb-5 shadow-sm border border-slate-200/60">
                <div className="absolute top-3 inset-x-3 z-20 flex justify-between">
                  <button onClick={() => { setSelectedDayNumber(5); setSelectedTime("10:30 AM"); }} className="w-8 h-8 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center border border-slate-200/60 text-[#001a4b] cursor-pointer">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsFavorite(!isFavorite)} className="w-8 h-8 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center border border-slate-200/60 cursor-pointer">
                    <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-[#001a4b]"}`} />
                  </button>
                </div>

                <img src="https://images.unsplash.com/photo-1594824813633-47000dd5a953?auto=format&fit=crop&w=700&q=80" alt="Dr. Sarah" className="w-full h-56 object-cover object-top" />
                
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-white via-white/90 to-transparent">
                  <h4 className="text-xl font-bold tracking-tight text-[#001a4b]">Dr. Sarah Tariq</h4>
                  <p className="text-sm text-slate-500 font-medium">Chief Dentist • <Star className="w-3 h-3 inline fill-amber-400 text-amber-400"/> 4.9</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-sm font-bold text-[#001a4b]">{isUrdu ? "تاریخ منتخب کریں" : "Select Date"}</span>
                    <span className="text-xs font-semibold text-[#04326d]">{selectedMonth} 2026</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {MONTHS.map((m) => (
                      <button key={m} onClick={() => setSelectedMonth(m)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${selectedMonth === m ? "bg-[#001a4b] text-white" : "bg-white border border-slate-200 text-[#001a4b]"}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 mt-2">
                    {daysList.map((day) => (
                      <button key={day.num} onClick={() => setSelectedDayNumber(day.num)} className={`py-2 rounded-xl flex flex-col items-center justify-center border transition-colors cursor-pointer ${selectedDayNumber === day.num ? "bg-[#001a4b] border-[#001a4b] text-white" : "bg-white border-slate-200 text-[#001a4b]"}`}>
                        <span className="text-sm font-bold">{day.num}</span>
                        <span className="text-[10px] font-medium opacity-80">{day.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 px-1">
                    <span className="text-sm font-bold text-[#001a4b]">{isUrdu ? "وقت منتخب کریں" : "Select Time"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button key={slot} onClick={() => setSelectedTime(slot)} className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${selectedTime === slot ? "bg-[#001a4b] border-[#001a4b] text-white" : "bg-white border-slate-200 text-[#001a4b]"}`}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleBookClick} className="w-full py-3.5 rounded-full bg-[#001a4b] hover:bg-[#04326d] text-white font-semibold text-sm transition-colors mt-2 cursor-pointer">
                  {isUrdu ? `وقت بک کریں — ${selectedTime} (${selectedMonth} ${selectedDayNumber})` : `Book Appointment — Free Checkup`}
                </button>

                {quickBookConfirmed && (
                  <div className="mt-2 text-center text-xs font-bold text-emerald-600 bg-emerald-50 rounded-lg py-2 border border-emerald-100">
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
