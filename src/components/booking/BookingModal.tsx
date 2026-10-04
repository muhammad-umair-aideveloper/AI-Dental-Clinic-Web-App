"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { CLINIC_CONFIG } from "@/config/clinic";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  Download,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: string | null;
  initialDate?: string;
  initialTime?: string;
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

const TREATMENTS_OPTIONS = [
  { id: "consultation", name: "General Checkup & Consultation", nameUr: "عمومی معائنہ و مشاورت" },
  { id: "scaling", name: "Scaling & Ultrasonic Polishing", nameUr: "دانتوں کی صفائی اور پالش (Scaling)" },
  { id: "root-canal", name: "Single-Visit Root Canal (RCT)", nameUr: "ایک نشست میں روٹ کینال (RCT)" },
  { id: "aligners", name: "Invisible Clear Aligners", nameUr: "پوشیدہ شفاف الائنرز (Clear Aligners)" },
  { id: "implants", name: "Permanent Dental Implants", nameUr: "مستقل ڈینٹل امپلانٹس (Implants)" },
];

export function BookingModal({
  isOpen,
  onClose,
  preselectedService,
  initialDate,
  initialTime,
}: BookingModalProps) {
  const locale = useLocale();
  const isUrdu = locale === "ur";

  // Form State
  const [selectedService, setSelectedService] = useState<string>(
    preselectedService || TREATMENTS_OPTIONS[0].name
  );

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || today);
  const [selectedTime, setSelectedTime] = useState<string>(initialTime || "11:00");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [whatsappConsent, setWhatsappConsent] = useState(true);

  // Status & Slots
  const [availableSlots, setAvailableSlots] = useState<string[]>(DEFAULT_SLOTS);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  useEffect(() => {
    if (preselectedService) {
      setSelectedService(preselectedService);
    }
  }, [preselectedService]);

  useEffect(() => {
    if (initialDate) setSelectedDate(initialDate);
  }, [initialDate]);

  useEffect(() => {
    if (initialTime) setSelectedTime(initialTime);
  }, [initialTime]);

  // Fetch real-time available slots for selected date
  useEffect(() => {
    if (!selectedDate || !isOpen) return;

    let isMounted = true;
    setCheckingSlots(true);

    fetch(`/api/appointments?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.availableSlots && Array.isArray(data.availableSlots)) {
          setAvailableSlots(data.availableSlots);
          if (!data.availableSlots.includes(selectedTime) && data.availableSlots.length > 0) {
            setSelectedTime(data.availableSlots[0]);
          }
        }
      })
      .catch((err) => console.error("Error checking slots:", err))
      .finally(() => {
        if (isMounted) setCheckingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, isOpen]);

  if (!isOpen) return null;

  // Pakistani phone number normalization: validate 03XX-XXXXXXX or +92 3XX XXXXXXX -> +923XXXXXXXXX
  const normalizePakistaniPhone = (input: string): string | null => {
    const cleaned = input.replace(/[\s\-\(\)]/g, "");
    if (/^(\+92|92)?3[0-9]{9}$/.test(cleaned)) {
      if (cleaned.startsWith("+92")) return cleaned;
      if (cleaned.startsWith("92")) return `+${cleaned}`;
      return `+92${cleaned}`;
    }
    if (/^03[0-9]{9}$/.test(cleaned)) {
      return `+92${cleaned.substring(1)}`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!patientName.trim()) {
      setErrorMessage(isUrdu ? "برائے مہربانی اپنا مکمل نام درج کریں۔" : "Please enter your full name.");
      return;
    }

    const normalizedPhone = normalizePakistaniPhone(patientPhone);
    if (!normalizedPhone) {
      setErrorMessage(
        isUrdu
          ? "برائے مہربانی درست پاکستانی فون یا واٹس ایپ نمبر درج کریں (مثال: 03001234567)"
          : "Please enter a valid Pakistani phone number (e.g., 0300 1234567 or +92 300 1234567)."
      );
      return;
    }

    if (!whatsappConsent) {
      setErrorMessage(
        isUrdu
          ? "اپوائنٹمنٹ کی تصدیق کے لیے واٹس ایپ رضامندی لازمی ہے۔"
          : "WhatsApp/SMS consent is required to send your appointment confirmation."
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
          phone: normalizedPhone,
          date: selectedDate,
          time: selectedTime,
          reason: selectedService,
          language: locale,
          whatsappConsent: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "That slot was just booked. Please pick another available time.");
      } else {
        setConfirmedBooking(data.appointment);
      }
    } catch (err) {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedBooking(null);
    setPatientName("");
    setPatientPhone("");
    setErrorMessage("");
    onClose();
  };

  // Generate .ics file for confirmation
  const downloadIcsFile = () => {
    if (!confirmedBooking) return;
    const startIso = `${confirmedBooking.date.replace(/-/g, "")}T${confirmedBooking.time.replace(":", "")}00`;
    const endHour = parseInt(confirmedBooking.time.split(":")[0], 10) + 1;
    const endIso = `${confirmedBooking.date.replace(/-/g, "")}T${String(endHour).padStart(2, "0")}0000`;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Lahore Dental Clinic//Appointment Booking//EN",
      "BEGIN:VEVENT",
      `SUMMARY:Dental Appointment: ${confirmedBooking.reason}`,
      `DESCRIPTION:Appointment with Lahore Dental Clinic. Address: ${CLINIC_CONFIG.address}. Contact: ${CLINIC_CONFIG.phone}`,
      `LOCATION:${CLINIC_CONFIG.address}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `lahore-dental-appointment-${confirmedBooking.date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate 7 days quick picker
  const nextDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = d.getDate();
    return { dateStr, dayName, dayNum };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-[#E5EAF0]">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E5EAF0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F6F8FA] border border-[#E5EAF0] flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-[#2E9C89]" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-[#0F172A]">
                {isUrdu ? "وقت بک کریں — لاہور ڈینٹل" : "Book Consultation — Lahore Dental"}
              </h3>
              <p className="text-xs text-[#5B6B7F]">
                {isUrdu ? "بغیر اکاؤنٹ، فوری تصدیق" : "No account required · Instant confirmation"}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#5B6B7F] hover:text-[#0F172A] hover:bg-[#F6F8FA] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          {confirmedBooking ? (
            /* Success View */
            <div className="text-center py-4 space-y-4 animate-clinical-in">
              <div className="w-14 h-14 rounded-full bg-[#E8F7F4] text-[#2E9C89] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-[#0F172A]">
                  {isUrdu ? "وقت کامیابی سے بک ہو گیا ہے!" : "Appointment Confirmed!"}
                </h4>
                <p className="text-xs text-[#5B6B7F] mt-1">
                  {isUrdu
                    ? `تصدیقی تفصیلات واٹس ایپ پر ${confirmedBooking.phone} کو بھیج دی گئی ہیں۔`
                    : `Confirmation sent via WhatsApp to ${confirmedBooking.phone}`}
                </p>
              </div>

              {/* Appointment Card */}
              <div className="p-4 rounded-xl bg-[#F6F8FA] border border-[#E5EAF0] text-start text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#5B6B7F]">{isUrdu ? "مریض" : "Patient"}:</span>
                  <span className="font-semibold text-[#0F172A]">{confirmedBooking.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B6B7F]">{isUrdu ? "علاج" : "Treatment"}:</span>
                  <span className="font-semibold text-[#0F172A]">{confirmedBooking.reason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B6B7F]">{isUrdu ? "تاریخ و وقت" : "Date & Time"}:</span>
                  <span className="font-semibold text-[#2E9C89]">
                    {confirmedBooking.date} · {confirmedBooking.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B6B7F]">{isUrdu ? "مقام" : "Location"}:</span>
                  <span className="font-semibold text-[#0F172A]">Gulberg III, Lahore</span>
                </div>
              </div>

              {/* Action Buttons: Add to Calendar & WhatsApp */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={downloadIcsFile}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0F172A] hover:bg-[#2E9C89] text-white font-semibold text-xs transition-clinical cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#4FB8A6]" />
                  <span>{isUrdu ? "کیلنڈر میں شامل کریں (.ics)" : "Add to Calendar (.ics)"}</span>
                </button>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-xl border border-[#E5EAF0] text-xs font-semibold text-[#5B6B7F] hover:bg-[#F6F8FA]"
                >
                  {isUrdu ? "مکمل" : "Done"}
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Step 1: Treatment Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  1. {isUrdu ? "مطلوبہ علاج" : "Select Treatment"}
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EAF0] bg-white text-xs text-[#0F172A] focus:outline-none focus:border-[#4FB8A6]"
                >
                  {TREATMENTS_OPTIONS.map((t) => (
                    <option key={t.id} value={t.name}>
                      {isUrdu ? t.nameUr : t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Date Selector (7 Days) */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  2. {isUrdu ? "تاریخ منتخب کریں" : "Select Date"}
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {nextDays.map((d) => {
                    const isSelected = selectedDate === d.dateStr;
                    return (
                      <button
                        type="button"
                        key={d.dateStr}
                        onClick={() => setSelectedDate(d.dateStr)}
                        className={`p-2 rounded-xl text-center border transition-clinical cursor-pointer ${
                          isSelected
                            ? "bg-[#0F172A] text-white border-[#0F172A]"
                            : "bg-[#F6F8FA] text-[#0F172A] border-[#E5EAF0] hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-[10px] block opacity-80">{d.dayName}</span>
                        <span className="text-xs font-bold block">{d.dayNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Time Slot Grid */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    3. {isUrdu ? "دستیاب وقت" : "Available Time Slot"}
                  </label>
                  {checkingSlots && (
                    <span className="text-[10px] text-[#2E9C89] flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Checking...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot) => {
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 rounded-lg text-xs font-semibold border transition-clinical cursor-pointer ${
                            isSelected
                              ? "bg-[#2E9C89] text-white border-[#2E9C89]"
                              : "bg-white text-[#0F172A] border-[#E5EAF0] hover:bg-[#F6F8FA]"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })
                  ) : (
                    <p className="col-span-5 text-center text-xs text-[#5B6B7F] py-2">
                      No slots available for this date.
                    </p>
                  )}
                </div>
              </div>

              {/* Step 4: Name & Pakistani WhatsApp Phone */}
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  4. {isUrdu ? "مریض کی تفصیلات" : "Patient Details"}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5B6B7F] absolute left-3 top-3 rtl:right-3 rtl:left-auto" />
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder={isUrdu ? "مریض کا مکمل نام" : "Full Name"}
                    className="w-full pl-9 pr-3 py-2.5 rtl:pr-9 rtl:pl-3 rounded-xl border border-[#E5EAF0] text-xs text-[#0F172A] focus:outline-none focus:border-[#4FB8A6]"
                  />
                </div>

                <div className="relative">
                  <Phone className="w-4 h-4 text-[#5B6B7F] absolute left-3 top-3 rtl:right-3 rtl:left-auto" />
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder={isUrdu ? "واٹس ایپ نمبر (0300 1234567)" : "WhatsApp Phone (0300 1234567)"}
                    className="w-full pl-9 pr-3 py-2.5 rtl:pr-9 rtl:pl-3 rounded-xl border border-[#E5EAF0] text-xs text-[#0F172A] focus:outline-none focus:border-[#4FB8A6]"
                  />
                </div>
              </div>

              {/* Mandatory Consent Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#5B6B7F]">
                  <input
                    type="checkbox"
                    checked={whatsappConsent}
                    onChange={(e) => setWhatsappConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#2E9C89] focus:ring-[#4FB8A6]"
                  />
                  <span>
                    {isUrdu
                      ? "میں اس اپوائنٹمنٹ کے بارے میں واٹس ایپ/ایس ایم ایس پر رابطہ کرنے پر رضامند ہوں۔"
                      : "I agree to receive appointment confirmations and reminders on WhatsApp/SMS."}
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#0F172A] hover:bg-[#2E9C89] text-white font-semibold text-xs transition-clinical disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#4FB8A6]" />
                      <span>{isUrdu ? "بکنگ ہو رہی ہے..." : "Securing Your Slot..."}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#4FB8A6]" />
                      <span>{isUrdu ? "وقت کی تصدیق کریں" : "Confirm Appointment"}</span>
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
