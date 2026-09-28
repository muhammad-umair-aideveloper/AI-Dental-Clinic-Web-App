"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import { BookingModal } from "@/components/booking/BookingModal";
import {
  Calendar,
  Clock,
  User,
  Phone,
  MessageCircle,
  MapPin,
  Home,
  PlusCircle,
  RefreshCw,
  LogOut,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Mail,
  FileText,
} from "lucide-react";

interface Appointment {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  reason?: string;
  status: "confirmed" | "completed" | "cancelled";
  created_at?: string;
}

function UserDashboardContent() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUrdu = locale === "ur";
  const { user, role, logout, isLoading: authLoading } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [unauthorizedNotice, setUnauthorizedNotice] = useState(false);

  // Check if user was redirected from an admin-only route
  useEffect(() => {
    if (searchParams.get("error") === "admin_only") {
      setUnauthorizedNotice(true);
    }
  }, [searchParams]);

  // Auth Protection: If loaded and no session, redirect to home
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}?auth=required`);
    }
  }, [authLoading, user, locale, router]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      if (data.appointments) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}`);
  };

  const formatSlotLabel = (slot: string) => {
    if (!slot) return "";
    const [h, m] = slot.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m || "00"} ${ampm}`;
  };

  // Filter appointments for this user
  const userPhone = user?.phone?.replace(/[^0-9]/g, "") || "";
  const userName = user?.name?.toLowerCase() || "";
  const userAppointments = appointments.filter((apt) => {
    if (!userPhone && !userName) return true;
    const aptPhone = apt.phone.replace(/[^0-9]/g, "");
    if (userPhone && (aptPhone.includes(userPhone) || userPhone.includes(aptPhone))) {
      return true;
    }
    if (userName && apt.name.toLowerCase().includes(userName)) {
      return true;
    }
    return false;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#04326d] animate-spin" />
          <p className="text-sm font-medium text-slate-600 font-sans">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/${locale}`} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#04326d] text-white flex items-center justify-center text-base shadow-soft">
                🦷
              </div>
              <div>
                <span className="font-heading font-bold text-[#001a4b] text-base block tracking-tight">
                  {isUrdu ? "لاہور ڈینٹل" : "Lahore Dental"}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#04326d]">
                  {isUrdu ? "مریض پورٹل" : "Patient Portal"}
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={fetchAppointments}
                disabled={loading}
                title="Refresh Status"
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>

              <button
                onClick={() => setIsBookingOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#04326d] hover:bg-[#001a4b] text-white font-semibold text-xs sm:text-sm shadow-soft transition-all cursor-pointer font-sans"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isUrdu ? "نیا وقت بک کریں" : "Book Appointment"}</span>
              </button>

              <Link
                href={`/${locale}`}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{isUrdu ? "ہوم" : "Home"}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isUrdu ? "لاگ آؤٹ" : "Logout"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Unauthorized Route Attempt Warning Banner */}
        {unauthorizedNotice && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm font-sans">
              <strong className="font-bold text-amber-950 block">
                Access Restricted: Admin Privileges Required
              </strong>
              <p>
                You attempted to access the clinic owner & admin dashboard. Since your account is assigned the{" "}
                <span className="font-bold font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">
                  user
                </span>{" "}
                role, you have been safely redirected to your Patient Portal.
              </p>
            </div>
          </div>
        )}

        {/* Patient Profile Card */}
        <div className="bg-gradient-to-r from-[#001a4b] via-[#04326d] to-[#001a4b] rounded-3xl p-6 sm:p-8 text-white shadow-soft relative overflow-hidden border border-[#b2bed6]/30">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider text-sky-100">
                  {isUrdu ? "مریض کا پورٹل" : "Patient Portal"}
                </span>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 text-xs font-semibold border border-emerald-400/40">
                  Active User Account
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white !text-white">
                {isUrdu ? `خوش آمدید، ${user?.name || "محترم مریض"}` : `Welcome back, ${user?.name || "Patient"}`}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-sky-100 pt-1">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-200" />
                  <span className="text-white/95">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-sky-200" />
                    <span className="text-white/95">{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded text-[11px]">
                    Role: {role || "user"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBookingOpen(true)}
                className="px-5 py-3 rounded-full bg-white text-[#001a4b] hover:bg-sky-50 font-bold text-sm transition-all shadow-soft cursor-pointer"
              >
                + New Appointment
              </button>
            </div>
          </div>

          <div className="absolute -right-8 -bottom-10 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Appointment Process Timeline */}
        <div className="bg-white rounded-3xl p-6 border border-[#b2bed6]/40 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#04326d]" />
            <h2 className="text-base font-heading font-bold text-[#001a4b]">
              {isUrdu ? "ڈینٹل اپائنٹمنٹ کا طریقہ کار" : "Your Dental Care Process"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#b2bed6]/15 border border-[#b2bed6]/40 text-xs space-y-1">
              <span className="w-6 h-6 rounded-full bg-[#04326d] text-white font-bold flex items-center justify-center text-[11px] mb-2">
                1
              </span>
              <p className="font-bold text-[#001a4b]">Booked & Confirmed</p>
              <p className="text-slate-500 text-[11px]">
                Your preferred slot is instantly locked in clinic calendar.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#b2bed6]/15 border border-[#b2bed6]/40 text-xs space-y-1">
              <span className="w-6 h-6 rounded-full bg-[#04326d] text-white font-bold flex items-center justify-center text-[11px] mb-2">
                2
              </span>
              <p className="font-bold text-[#001a4b]">Clinic Verification</p>
              <p className="text-slate-500 text-[11px]">
                Reception team confirms your slot and prepares room.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#b2bed6]/15 border border-[#b2bed6]/40 text-xs space-y-1">
              <span className="w-6 h-6 rounded-full bg-[#04326d] text-white font-bold flex items-center justify-center text-[11px] mb-2">
                3
              </span>
              <p className="font-bold text-[#001a4b]">Consultation Day</p>
              <p className="text-slate-500 text-[11px]">
                Arrive 10 min early at Main Boulevard Gulberg III clinic.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#b2bed6]/15 border border-[#b2bed6]/40 text-xs space-y-1">
              <span className="w-6 h-6 rounded-full bg-[#04326d] text-white font-bold flex items-center justify-center text-[11px] mb-2">
                4
              </span>
              <p className="font-bold text-[#001a4b]">Gentle Treatment</p>
              <p className="text-slate-500 text-[11px]">
                Painless, sterilized care by PMDC certified specialists.
              </p>
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-[#001a4b]">
              {isUrdu ? "آپ کی بکنگز" : "Your Appointments"}
            </h2>
            <span className="text-xs text-slate-500 font-medium font-sans">
              Showing {userAppointments.length} appointment(s)
            </span>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 font-sans">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-[#04326d]" />
              <p className="text-base font-medium">Loading appointments...</p>
            </div>
          ) : userAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 shadow-xs">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <h3 className="font-heading font-bold text-[#001a4b] text-lg sm:text-xl tracking-tight">
                  {isUrdu ? "کوئی بکنگ نہیں ملی" : "No Appointments Booked Yet"}
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 font-sans leading-relaxed">
                  {isUrdu
                    ? "آپ نے ابھی تک کوئی وقت بک نہیں کیا ہے۔ معائنے کے لیے نیچے کلک کریں۔"
                    : "Schedule your checkup today. Our dentists are available 6 days a week in Gulberg III, Lahore."}
                </p>
              </div>
              <button
                onClick={() => setIsBookingOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#04326d] hover:bg-[#001a4b] text-white font-semibold text-base font-sans shadow-soft transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isUrdu ? "وقت بک کریں" : "Book An Appointment Now"}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-3xl p-6 border border-[#b2bed6]/40 shadow-soft space-y-4 hover:border-[#04326d] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 uppercase block">
                        ID: {apt.id}
                      </span>
                      <h3 className="font-heading font-extrabold text-[#001a4b] text-lg">
                        {apt.reason || "General Consultation"}
                      </h3>
                    </div>

                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        apt.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : apt.status === "cancelled"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-[#b2bed6]/30 text-[#001a4b]"
                      }`}
                    >
                      {apt.status === "confirmed" && "✓ Confirmed"}
                      {apt.status === "completed" && "✓ Completed"}
                      {apt.status === "cancelled" && "✕ Cancelled"}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#b2bed6]/15 border border-[#b2bed6]/40 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-[#001a4b] font-bold">
                      <Calendar className="w-4 h-4 text-[#04326d]" />
                      <span>{apt.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#04326d] font-extrabold bg-white px-3 py-1 rounded-xl shadow-xs border border-[#b2bed6]/30">
                      <Clock className="w-4 h-4 text-[#04326d]" />
                      <span>{formatSlotLabel(apt.time)}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <p className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Doctor: <strong>Dr. Sarah Tariq Khan</strong> (BDS, RDS)</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Plaza 42-B, Main Boulevard, Gulberg III, Lahore</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={`https://wa.me/923001234567?text=${encodeURIComponent(
                        `Hello Lahore Dental! I am checking my appointment ${apt.id} on ${apt.date} at ${apt.time}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Clinic</span>
                    </a>

                    <a
                      href="https://maps.google.com/?q=Gulberg+III+Lahore"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          fetchAppointments();
        }}
      />
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#04326d] animate-spin" />
            <p className="text-sm font-medium text-slate-600 font-sans">
              Loading your dashboard...
            </p>
          </div>
        </div>
      }
    >
      <UserDashboardContent />
    </Suspense>
  );
}
