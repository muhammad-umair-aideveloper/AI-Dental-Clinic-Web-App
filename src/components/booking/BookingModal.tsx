"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  CheckCircle2,
  X,
  Sparkles,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: string | null;
  initialDate?: string;
  initialTime?: string;
  onSwitchToAiChat?: () => void;
}

const DEFAULT_SLOTS = [
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const SERVICES_LIST = [
  "General Checkup & Consultation",
  "Scaling & Ultrasonic Polishing",
  "Single-Visit Root Canal (RCT)",
  "Braces & Invisible Aligners",
  "Permanent Dental Implants",
  "Laser Teeth Whitening",
  "Pediatric & Kids Dentistry",
  "24/7 Dental Emergency Care",
];

export function BookingModal({
  isOpen,
  onClose,
  preselectedService,
  initialDate,
  initialTime,
  onSwitchToAiChat,
}: BookingModalProps) {
  const locale = useLocale();
  const isUrdu = locale === "ur";

  // Form State
  const [selectedService, setSelectedService] = useState<string>(
    preselectedService || SERVICES_LIST[0]
  );

  // Today formatted as YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || today);
  const [selectedTime, setSelectedTime] = useState<string>(initialTime || "11:00");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [reason, setReason] = useState("");

  // Availability State
  const [availableSlots, setAvailableSlots] = useState<string[]>(DEFAULT_SLOTS);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Update selected service if prop changes
  useEffect(() => {
    if (preselectedService) {
      setSelectedService(preselectedService);
    }
  }, [preselectedService]);

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  useEffect(() => {
    if (initialTime) {
      setSelectedTime(initialTime);
    }
  }, [initialTime]);

  // Fetch real-time available slots whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;

    let isMounted = true;
    setCheckingSlots(true);

    fetch(`/api/appointments?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.availableSlots && Array.isArray(data.availableSlots)) {
          setAvailableSlots(data.availableSlots);
          // If current selected time is not available, default to first available
          if (!data.availableSlots.includes(selectedTime) && data.availableSlots.length > 0) {
            setSelectedTime(data.availableSlots[0]);
          }
        }
      })
      .catch((err) => console.error("Error fetching slots:", err))
      .finally(() => {
        if (isMounted) setCheckingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!patientName.trim()) {
      setErrorMessage(isUrdu ? "برائے مہربانی اپنا نام درج کریں۔" : "Please enter your full name.");
      return;
    }
    if (!patientPhone.trim() || patientPhone.trim().length < 8) {
      setErrorMessage(
        isUrdu
          ? "برائے مہربانی درست فون یا واٹس ایپ نمبر درج کریں۔"
          : "Please enter a valid phone or WhatsApp number."
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: patientName.trim(),
          phone: patientPhone.trim(),
          date: selectedDate,
          time: selectedTime,
          reason: reason.trim() || selectedService,
          language: locale,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to book appointment. Please try another slot.");
      } else {
        setConfirmedBooking(data.appointment);
      }
    } catch (err: any) {
      console.error("Booking submission error:", err);
      setErrorMessage("Network error occurred. Please check connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setConfirmedBooking(null);
    setPatientName("");
    setPatientPhone("");
    setReason("");
    onClose();
  };

  const formatSlotLabel = (slot: string) => {
    const [h, m] = slot.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  // Generate the next 7 days for quick day pills
  const nextDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString(locale === "ur" ? "ur-PK" : "en-US", {
      weekday: "short",
    });
    const dayNumber = d.getDate();
    return { dateStr, dayName, dayNumber };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-[#b2bed6]/40">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#001a4b] via-[#04326d] to-[#001a4b] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-lg">
              🦷
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg tracking-tight">
                {isUrdu ? "وقت بک کریں — لاہور ڈینٹل" : "Book Your Appointment — Lahore Dental"}
              </h3>
              <p className="text-xs text-[#b2bed6]">
                {isUrdu ? "تاریخ اور وقت منتخب کریں" : "Select your preferred date & time slot"}
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {confirmedBooking ? (
            /* Confirmation Success Screen */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-soft">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {isUrdu ? "آپ کا وقت بک ہو گیا ہے!" : "Appointment Confirmed!"}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {isUrdu
                    ? "ہم نے تصدیقی میسج واٹس ایپ اور ایس ایم ایس پر بھیج دیا ہے۔"
                    : "We have dispatched your confirmation via WhatsApp & Email."}
                </p>
              </div>

              {/* Confirmation Details Card */}
              <div className="rounded-2xl bg-[#b2bed6]/15 border border-[#b2bed6]/40 p-5 text-start space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-[#b2bed6]/30">
                  <span className="text-xs font-semibold text-slate-500">Booking ID:</span>
                  <span className="font-mono font-bold text-[#04326d] uppercase">
                    {confirmedBooking.id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Patient:</span>
                  <span className="font-bold text-slate-900">{confirmedBooking.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Date & Time:</span>
                  <span className="font-bold text-[#04326d]">
                    {confirmedBooking.date} at {formatSlotLabel(confirmedBooking.time)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Service:</span>
                  <span className="font-bold text-slate-800">{confirmedBooking.reason}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#b2bed6]/30">
                  <span className="text-slate-600">Surgeon:</span>
                  <span className="font-semibold text-slate-900">Dr. Sarah Tariq Khan</span>
                </div>
                <div className="pt-2 text-xs text-slate-500">
                  📍 <strong>Clinic Address:</strong> Plaza 42-B, Main Boulevard, Gulberg III, Lahore
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#04326d] hover:bg-[#001a4b] text-white font-semibold text-sm shadow-soft transition-all cursor-pointer"
                >
                  {isUrdu ? "مکمل" : "Done"}
                </button>
                <a
                  href={`https://wa.me/923001234567?text=${encodeURIComponent(
                    `Hello Lahore Dental! I just booked an appointment with ID: ${confirmedBooking.id}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold text-sm hover:bg-emerald-100 transition-all"
                >
                  <span>WhatsApp Clinic</span>
                </a>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Optional AI Switch Banner */}
              {onSwitchToAiChat && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#b2bed6]/20 border border-[#b2bed6]/50 text-xs">
                  <div className="flex items-center gap-2 text-[#001a4b] font-medium">
                    <Sparkles className="w-4 h-4 text-[#04326d] shrink-0" />
                    <span>
                      {isUrdu
                        ? "کیا آپ اے آئی اسسٹنٹ سے بات کرنا چاہتے ہیں؟"
                        : "Prefer talking to our AI Dental Assistant?"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwitchToAiChat();
                    }}
                    className="font-bold text-[#04326d] hover:text-[#001a4b] underline whitespace-nowrap cursor-pointer"
                  >
                    {isUrdu ? "اے آئی چیٹ کھولیں" : "Chat with AI"}
                  </button>
                </div>
              )}

              {/* Step 1: Dental Service Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#001a4b] mb-1.5 font-sans">
                  1. {isUrdu ? "علاج کی قسم منتخب کریں" : "Select Treatment / Service"}
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-3 text-base rounded-xl border border-[#b2bed6]/60 bg-white focus:border-[#04326d] focus:ring-2 focus:ring-[#b2bed6]/30 outline-none transition-all font-medium font-sans text-slate-800 leading-normal"
                >
                  {SERVICES_LIST.map((srv) => (
                    <option key={srv} value={srv}>
                      {srv}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Date Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#001a4b] font-sans">
                    2. {isUrdu ? "تاریخ منتخب کریں" : "Select Date"}
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-base px-3 py-1.5 rounded-lg border border-[#b2bed6]/60 text-slate-700 focus:border-[#04326d] outline-none font-sans font-medium"
                  />
                </div>

                {/* Next 7 Days Quick Picker Pills */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {nextDays.map((d) => {
                    const isSelected = selectedDate === d.dateStr;
                    return (
                      <button
                        key={d.dateStr}
                        type="button"
                        onClick={() => setSelectedDate(d.dateStr)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer font-sans ${
                          isSelected
                            ? "bg-[#04326d] text-white border-[#04326d] shadow-soft scale-102"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:border-[#04326d] hover:bg-[#b2bed6]/20"
                        }`}
                      >
                        <span className="text-[11px] font-medium">{d.dayName}</span>
                        <span className="text-base font-bold">{d.dayNumber}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Available Time Slot Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#001a4b] font-sans">
                    3. {isUrdu ? "وقت (ٹائم سلاٹ) منتخب کریں" : "Select Time Slot"}
                  </label>
                  {checkingSlots ? (
                    <span className="text-xs text-[#04326d] flex items-center gap-1 font-medium font-sans">
                      <Loader2 className="w-3 h-3 animate-spin" /> Checking slots...
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 font-medium font-sans">
                      {availableSlots.length} {isUrdu ? "سلاٹس دستیاب" : "slots available"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {DEFAULT_SLOTS.map((slot) => {
                    const isAvailable = availableSlots.includes(slot);
                    const isSelected = selectedTime === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedTime(slot)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold font-sans transition-all border cursor-pointer ${
                          isSelected
                            ? "bg-[#04326d] text-white border-[#04326d] shadow-soft"
                            : isAvailable
                            ? "bg-white text-slate-800 border-[#b2bed6]/60 hover:border-[#04326d] hover:bg-[#b2bed6]/20"
                            : "bg-slate-100 text-slate-400 border-slate-200/60 line-through cursor-not-allowed opacity-60"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{formatSlotLabel(slot)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Patient Info */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#001a4b] font-sans">
                  4. {isUrdu ? "مریض کی معلومات" : "Patient Details"}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">
                      {isUrdu ? "مکمل نام *" : "Full Name *"}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 rtl:right-3 rtl:left-auto" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ali Ahmed"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2.5 text-base rounded-xl border border-slate-200 focus:border-[#04326d] focus:ring-2 focus:ring-[#b2bed6]/30 outline-none transition-all font-sans font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">
                      {isUrdu ? "فون یا واٹس ایپ نمبر *" : "Phone / WhatsApp *"}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 rtl:right-3 rtl:left-auto" />
                      <input
                        type="tel"
                        required
                        placeholder="0300 1234567"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2.5 text-base rounded-xl border border-slate-200 focus:border-[#04326d] focus:ring-2 focus:ring-[#b2bed6]/30 outline-none transition-all font-sans font-medium text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">
                    {isUrdu ? "اضافی تفصیل یا دانتوں کی کیفیت (اختیاری)" : "Special notes or symptoms (optional)"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lower molar pain since 2 days"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2.5 text-base rounded-xl border border-slate-200 focus:border-[#04326d] focus:ring-2 focus:ring-[#b2bed6]/30 outline-none transition-all font-sans font-medium text-slate-800"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-sans font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#001a4b] to-[#04326d] hover:from-[#04326d] hover:to-[#001a4b] text-white font-semibold text-base font-sans shadow-soft transition-all active:scale-98 disabled:opacity-70 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isUrdu ? "وقت بک کیا جا رہا ہے..." : "Confirming Appointment..."}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>
                        {isUrdu
                          ? `وقت بک کریں برائے ${selectedDate} (${formatSlotLabel(selectedTime)})`
                          : `Confirm Appointment for ${selectedDate} at ${formatSlotLabel(selectedTime)}`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
