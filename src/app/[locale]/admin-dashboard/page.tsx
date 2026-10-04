"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  MessageCircle,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  LogOut,
  Lock,
  PlusCircle,
  Mail,
  Home,
  Check,
  PhoneCall,
  Loader2,
  FileText,
  Shield,
  ShieldAlert,
  Bot,
  AlertTriangle,
  Send,
  Eye,
  Share2,
  Copy,
  ChevronRight,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { AIAssistantManager } from "@/components/admin/AIAssistantManager";
import { CLINIC_CONFIG } from "@/config/clinic";

interface Appointment {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  reason?: string;
  status: "confirmed" | "completed" | "cancelled" | "no-show";
  chair?: "chair-1" | "chair-2";
  whatsapp_reminder_sent?: boolean;
  reminder_sent_at?: string;
  language?: string;
  created_at?: string;
}

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  created_at: string;
  status: "unread" | "read" | "resolved";
}

interface XRay {
  id: string;
  title: string;
  category: "OPG" | "Periapical" | "Bitewing" | "Intraoral Photo";
  date: string;
  url: string;
  notes?: string;
}

interface Patient {
  phone: string;
  name: string;
  email?: string;
  notes: string;
  noShowCount: number;
  advanceTokenRequired: boolean;
  createdAt: string;
  xrays: XRay[];
  appointments?: Appointment[];
}

export default function AdminDashboardPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, role, logout, isLoading: authLoading } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "calendar" | "patients" | "inquiries" | "treatments" | "ai-assistant" | "settings"
  >("calendar");

  // Data State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Calendar State
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [calendarView, setCalendarView] = useState<"day" | "week">("day");

  // Patient Detail Drawer State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [patientNotesInput, setPatientNotesInput] = useState("");

  // Secure Link Modal State
  const [secureLinkModalPatient, setSecureLinkModalPatient] = useState<Patient | null>(null);
  const [secureHours, setSecureHours] = useState(48);
  const [secureViews, setSecureViews] = useState(5);
  const [generatedLink, setGeneratedLink] = useState<{ url: string; token: string } | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Image Preview Modal
  const [previewImage, setPreviewImage] = useState<XRay | null>(null);

  // Reschedule Modal State
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleChair, setRescheduleChair] = useState<"chair-1" | "chair-2">("chair-1");
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Walk-in / New Appointment Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: "",
    date: todayStr,
    time: "11:00",
    reason: "General Consultation",
    chair: "chair-2" as "chair-1" | "chair-2",
  });

  // Bulk Reminder State
  const [bulkReminderLoading, setBulkReminderLoading] = useState(false);
  const [bulkReminderMsg, setBulkReminderMsg] = useState<string | null>(null);

  // Strict RBAC: Check admin role
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push(`/${locale}/admin/login`);
      } else if (role !== "admin") {
        router.push(`/${locale}?error=admin_only`);
      }
    }
  }, [authLoading, user, role, locale, router]);

  // Fetch admin data
  const fetchData = async () => {
    setLoadingData(true);
    try {
      const res = await fetch("/api/admin/data");
      const data = await res.json();
      if (res.ok) {
        if (data.appointments) setAppointments(data.appointments);
        if (data.inquiries) setInquiries(data.inquiries);
        if (data.patients) setPatients(data.patients);
        if (data.aiStatus) setAiStatus(data.aiStatus);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && role === "admin") {
      fetchData();
    }
  }, [user, role]);

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}/admin/login`);
  };

  // Status Change
  const handleStatusChange = async (
    id: string,
    newStatus: "confirmed" | "completed" | "cancelled" | "no-show"
  ) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
        );
        // Refresh patients if no-show to update counter
        if (newStatus === "no-show") {
          fetchData();
        }
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // Send Single WhatsApp Reminder
  const handleSendReminder = async (apt: Appointment) => {
    const cleanPhone = apt.phone.replace(/[^0-9]/g, "");
    const waPhone = cleanPhone.startsWith("0")
      ? "92" + cleanPhone.slice(1)
      : cleanPhone.startsWith("92")
      ? cleanPhone
      : "92" + cleanPhone;

    const message = `Assalam-o-Alaikum ${apt.name}, this is a reminder from Lahore Dental Clinic for your appointment on ${apt.date} at ${apt.time} for ${apt.reason || "Consultation"}. Please reply 1 to confirm or call +92 300 1234567 to reschedule.`;
    const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(url, "_blank");

    // Mark reminder recorded on backend
    try {
      await fetch(`/api/appointments/${apt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reminder_sent" }),
      });
      setAppointments((prev) =>
        prev.map((a) => (a.id === apt.id ? { ...a, whatsapp_reminder_sent: true } : a))
      );
    } catch (e) {
      // ignore
    }
  };

  // Trigger Bulk Reminders for Tomorrow
  const handleTriggerBulkReminders = async () => {
    setBulkReminderLoading(true);
    setBulkReminderMsg(null);
    try {
      const res = await fetch("/api/admin/reminders/bulk", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setBulkReminderMsg(data.message || `Processed reminders for tomorrow.`);
        fetchData();
      } else {
        setBulkReminderMsg(data.error || "Failed to trigger bulk reminders");
      }
    } catch (err: any) {
      setBulkReminderMsg(err.message || "Network error sending reminders");
    } finally {
      setBulkReminderLoading(false);
      setTimeout(() => setBulkReminderMsg(null), 6000);
    }
  };

  // Reschedule Appointment Submit
  const handleRescheduleSubmit = async () => {
    if (!rescheduleApt) return;
    setRescheduling(true);
    setRescheduleError(null);

    try {
      const res = await fetch(`/api/appointments/${rescheduleApt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          date: rescheduleDate,
          time: rescheduleTime,
          chair: rescheduleChair,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === rescheduleApt.id
              ? {
                  ...a,
                  date: rescheduleDate,
                  time: rescheduleTime,
                  chair: rescheduleChair,
                }
              : a
          )
        );
        setRescheduleApt(null);
      } else {
        setRescheduleError(data.error || "Schedule conflict on chosen chair.");
      }
    } catch (err: any) {
      setRescheduleError(err.message || "Failed to reschedule.");
    } finally {
      setRescheduling(false);
    }
  };

  // Walk-in / Phone Create Appointment
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAppointment(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPatient.name,
          phone: newPatient.phone,
          date: newPatient.date,
          time: newPatient.time,
          reason: newPatient.reason,
          chair: newPatient.chair,
          language: "en",
        }),
      });

      if (res.ok) {
        setShowNewModal(false);
        setNewPatient({
          name: "",
          phone: "",
          date: todayStr,
          time: "11:00",
          reason: "General Consultation",
          chair: "chair-2",
        });
        fetchData();
      }
    } catch (err) {
      console.error("Create appointment error:", err);
    } finally {
      setCreatingAppointment(false);
    }
  };

  // Generate Secure Link
  const handleGenerateSecureLink = async () => {
    if (!secureLinkModalPatient) return;
    setGeneratingLink(true);
    try {
      const res = await fetch(
        `/api/admin/patients/${encodeURIComponent(secureLinkModalPatient.phone)}/secure-link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expiresInHours: secureHours,
            maxViews: secureViews,
          }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        const fullUrl = `${window.location.origin}${data.link.url}`;
        setGeneratedLink({ url: fullUrl, token: data.link.token });
      }
    } catch (err) {
      console.error("Failed to generate link:", err);
    } finally {
      setGeneratingLink(false);
    }
  };

  // Save Patient Notes
  const handleSavePatientNotes = async () => {
    if (!selectedPatient) return;
    setSavingNotes(true);
    try {
      const res = await fetch(
        `/api/admin/patients/${encodeURIComponent(selectedPatient.phone)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: patientNotesInput }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedPatient((prev) => (prev ? { ...prev, notes: patientNotesInput } : null));
        setPatients((prev) =>
          prev.map((p) => (p.phone === selectedPatient.phone ? { ...p, notes: patientNotesInput } : p))
        );
      }
    } catch (err) {
      console.error("Failed saving notes:", err);
    } finally {
      setSavingNotes(false);
    }
  };

  // Toggle Advance Token Requirement
  const handleToggleAdvanceToken = async (patient: Patient) => {
    const nextVal = !patient.advanceTokenRequired;
    try {
      const res = await fetch(`/api/admin/patients/${encodeURIComponent(patient.phone)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advanceTokenRequired: nextVal }),
      });
      if (res.ok) {
        setPatients((prev) =>
          prev.map((p) => (p.phone === patient.phone ? { ...p, advanceTokenRequired: nextVal } : p))
        );
        if (selectedPatient && selectedPatient.phone === patient.phone) {
          setSelectedPatient((prev) => (prev ? { ...prev, advanceTokenRequired: nextVal } : null));
        }
      }
    } catch (e) {
      // ignore
    }
  };

  // Stats calculation
  const todayApts = appointments.filter((a) => a.date === todayStr);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const tomorrowApts = appointments.filter((a) => a.date === tomorrowStr && a.status === "confirmed");
  const tomorrowPendingReminders = tomorrowApts.filter((a) => !a.whatsapp_reminder_sent);

  const chair1Today = todayApts.filter((a) => (a.chair || "chair-1") === "chair-1" && a.status !== "cancelled");
  const chair2Today = todayApts.filter((a) => a.chair === "chair-2" && a.status !== "cancelled");

  // Filtered Appointments for Selected Date
  const dateAppointments = appointments.filter((a) => a.date === selectedDate);
  const chair1Apts = dateAppointments.filter(
    (a) => (a.chair || "chair-1") === "chair-1"
  );
  const chair2Apts = dateAppointments.filter((a) => a.chair === "chair-2");

  // Filtered Patients
  const filteredPatients = patients.filter((p) => {
    const q = patientSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.phone.includes(q);
  });

  if (authLoading || (!user && role !== "admin")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-sm w-full text-center shadow-xs">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-800">Verifying Clinic Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-16">
      {/* Top Clinical Header */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold text-sm">
                🦷
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold tracking-tight text-slate-900">
                    Lahore Dental • Reception &amp; Clinical Management
                  </h1>
                  <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  PMDC Registered Clinic Console • Gulberg III, Lahore
                </p>
              </div>
            </div>

            {/* Quick Actions & Staff Profile */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTriggerBulkReminders}
                disabled={bulkReminderLoading}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Send WhatsApp confirmation reminder to all patients booked for tomorrow"
              >
                {bulkReminderLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Remind Tomorrow&apos;s ({tomorrowApts.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowNewModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Walk-In Booking</span>
              </button>

              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600 hidden md:inline">
                  Dr. Sarah / Staff
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                  title="Sign out of Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 overflow-x-auto border-t border-slate-100 py-1.5 text-xs font-semibold">
            {[
              { id: "calendar", label: "Chair Calendar", icon: CalendarIcon, count: todayApts.length },
              { id: "patients", label: "Patient Records & X-Rays", icon: User, count: patients.length },
              { id: "inquiries", label: "Inquiries", icon: Mail, count: inquiries.length },
              { id: "treatments", label: "Treatments & Prices", icon: DollarSign },
              { id: "ai-assistant", label: "AI Assistant & Knowledge", icon: Bot },
              { id: "settings", label: "Clinic Settings", icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Bulk Reminder Feedback Alert */}
      {bulkReminderMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
            <span>{bulkReminderMsg}</span>
            <button
              onClick={() => setBulkReminderMsg(null)}
              className="text-emerald-700 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* ========================================================================= */}
        {/* TAB 1: CALENDAR (CHAIR 1 & CHAIR 2 VISUAL SPLIT) */}
        {/* ========================================================================= */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Today&apos;s Appointments
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">{todayApts.length}</div>
                <span className="text-xs text-emerald-600 mt-0.5 block">
                  {todayApts.filter((a) => a.status === "completed").length} completed
                </span>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Chair 1 (Implants / RCT)
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">{chair1Today.length}</div>
                <span className="text-xs text-slate-500 mt-0.5 block">Surgical operatory</span>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Chair 2 (Scaling / Aligners)
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">{chair2Today.length}</div>
                <span className="text-xs text-slate-500 mt-0.5 block">General dentistry</span>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Tomorrow Pending Reminders
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {tomorrowPendingReminders.length}
                </div>
                <span className="text-xs text-amber-600 mt-0.5 block">
                  {tomorrowApts.length - tomorrowPendingReminders.length} sent
                </span>
              </div>
            </div>

            {/* Calendar Controls Bar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    selectedDate === todayStr
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate(tomorrowStr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    selectedDate === tomorrowStr
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Tomorrow
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Confirmed
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Completed
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> No-Show
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Cancelled
                </span>
              </div>
            </div>

            {/* Split Chair Grid View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CHAIR 1 OPERATORY COLUMN */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      <h2 className="text-sm font-bold text-slate-900">
                        Chair 1 — Surgical &amp; Endodontics
                      </h2>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Dental Implants, Surgical Extractions, Single-Visit Root Canal (RCT)
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-mono">
                    {chair1Apts.length} booked
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {chair1Apts.length === 0 ? (
                    <div className="h-44 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                      <Clock className="w-6 h-6 text-slate-300 mb-1" />
                      <p className="text-xs font-semibold text-slate-600">Chair 1 is open on {selectedDate}</p>
                      <button
                        onClick={() => {
                          setNewPatient((p) => ({ ...p, date: selectedDate, chair: "chair-1" }));
                          setShowNewModal(true);
                        }}
                        className="mt-2 text-[11px] text-emerald-600 font-bold hover:underline"
                      >
                        + Book a surgery/RCT slot
                      </button>
                    </div>
                  ) : (
                    chair1Apts.map((apt) => renderAppointmentCard(apt))
                  )}
                </div>
              </div>

              {/* CHAIR 2 OPERATORY COLUMN */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <h2 className="text-sm font-bold text-slate-900">
                        Chair 2 — Preventive &amp; Orthodontics
                      </h2>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ultrasonic Scaling, Clear Aligners, Laser Whitening, Checkups
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                    {chair2Apts.length} booked
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {chair2Apts.length === 0 ? (
                    <div className="h-44 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                      <Clock className="w-6 h-6 text-slate-300 mb-1" />
                      <p className="text-xs font-semibold text-slate-600">Chair 2 is open on {selectedDate}</p>
                      <button
                        onClick={() => {
                          setNewPatient((p) => ({ ...p, date: selectedDate, chair: "chair-2" }));
                          setShowNewModal(true);
                        }}
                        className="mt-2 text-[11px] text-emerald-600 font-bold hover:underline"
                      >
                        + Book a scaling/aligner slot
                      </button>
                    </div>
                  ) : (
                    chair2Apts.map((apt) => renderAppointmentCard(apt))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PATIENTS (TIMELINE, CLINICAL NOTES, X-RAYS, SECURE EXPIRING LINKS) */}
        {/* ========================================================================= */}
        {activeTab === "patients" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Patients Directory List */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Patient Records</h2>
                  <p className="text-[11px] text-slate-500">Phone-based medical files &amp; PACS</p>
                </div>
                <span className="text-xs font-bold text-slate-600 font-mono">
                  {filteredPatients.length} total
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by patient name or phone..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 outline-none transition-colors"
                />
              </div>

              {/* List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredPatients.map((patient) => {
                  const isSelected = selectedPatient?.phone === patient.phone;
                  return (
                    <div
                      key={patient.phone}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setPatientNotesInput(patient.notes || "");
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200/70 text-slate-800"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xs font-bold">{patient.name}</h3>
                          <p
                            className={`text-[11px] font-mono mt-0.5 ${
                              isSelected ? "text-slate-300" : "text-slate-500"
                            }`}
                          >
                            {patient.phone}
                          </p>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-col items-end gap-1">
                          {patient.advanceTokenRequired && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white uppercase tracking-wider">
                              Token Required
                            </span>
                          )}
                          {patient.noShowCount > 0 && !patient.advanceTokenRequired && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                isSelected ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {patient.noShowCount} No-show{patient.noShowCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`flex items-center justify-between text-[11px] mt-2 pt-2 border-t ${
                          isSelected ? "border-white/10 text-slate-300" : "border-slate-200 text-slate-500"
                        }`}
                      >
                        <span>{patient.appointments?.length || 0} visits</span>
                        <span>{patient.xrays?.length || 0} scans on file</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Patient Profile & PACS Scan Drawer */}
            <div className="lg:col-span-7 space-y-6">
              {selectedPatient ? (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
                  {/* Patient Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900">{selectedPatient.name}</h2>
                        {selectedPatient.advanceTokenRequired ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                            Advance Token Required (Rs. 2,000)
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Standard Booking
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {selectedPatient.phone} • {selectedPatient.email || "No email on record"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSecureLinkModalPatient(selectedPatient);
                          setGeneratedLink(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Send Secure Link</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleAdvanceToken(selectedPatient)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                          selectedPatient.advanceTokenRequired
                            ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                            : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        {selectedPatient.advanceTokenRequired ? "Clear Token Flag" : "Flag Advance Token"}
                      </button>
                    </div>
                  </div>

                  {/* Radiographic Scans & OPG Gallery */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Digital X-Rays &amp; OPG Scans
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Private clinic storage • Shareable via expiring signed links
                        </p>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {selectedPatient.xrays?.length || 0} scan{selectedPatient.xrays?.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {selectedPatient.xrays && selectedPatient.xrays.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedPatient.xrays.map((xr) => (
                          <div
                            key={xr.id}
                            onClick={() => setPreviewImage(xr)}
                            className="bg-slate-900 rounded-2xl p-3 border border-slate-800 text-white group cursor-pointer hover:border-emerald-500 transition-all relative overflow-hidden"
                          >
                            <div className="relative w-full aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden mb-2">
                              <Image
                                src={xr.url}
                                alt={xr.title}
                                fill
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                {xr.category}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">{xr.date}</span>
                            </div>
                            <h4 className="text-xs font-semibold text-slate-200 mt-1 truncate">
                              {xr.title}
                            </h4>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">No radiographic scans attached yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Doctor Clinical Notes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Doctor / Receptionist Clinical Notes
                      </label>
                      <button
                        type="button"
                        onClick={handleSavePatientNotes}
                        disabled={savingNotes}
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:underline cursor-pointer"
                      >
                        {savingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        <span>Save Notes</span>
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={patientNotesInput}
                      onChange={(e) => setPatientNotesInput(e.target.value)}
                      placeholder="Add observations, drug sensitivities, scheduled implants, quadrant details..."
                      className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 outline-none leading-relaxed"
                    />
                  </div>

                  {/* Treatment History Timeline */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                      Treatment History Timeline
                    </h3>
                    <div className="space-y-2">
                      {selectedPatient.appointments && selectedPatient.appointments.length > 0 ? (
                        selectedPatient.appointments.map((apt) => (
                          <div
                            key={apt.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-semibold text-slate-900">
                                {apt.reason || "Consultation"}
                              </span>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {apt.date} at {apt.time} • {apt.chair === "chair-1" ? "Chair 1 (Surgical)" : "Chair 2 (General)"}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                                apt.status === "confirmed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : apt.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : apt.status === "no-show"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {apt.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">No previous visits recorded.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-xs">
                  <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-800">Select a Patient</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Click any patient from the left column to inspect their medical records, view OPG scans, and generate expiring access links.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: INQUIRIES */}
        {/* ========================================================================= */}
        {activeTab === "inquiries" && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Website Inquiries &amp; Consultations</h2>
                <p className="text-xs text-slate-500">Direct patient leads from the contact form</p>
              </div>
              <span className="text-xs font-bold text-slate-600 font-mono">
                {inquiries.length} inquiries
              </span>
            </div>

            <div className="space-y-3">
              {inquiries.map((inq) => {
                const cleanPhone = inq.phone.replace(/[^0-9]/g, "");
                const waPhone = cleanPhone.startsWith("0") ? "92" + cleanPhone.slice(1) : cleanPhone;
                return (
                  <div
                    key={inq.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900">{inq.name}</h3>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(inq.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1">{inq.message}</p>
                      <p className="text-[11px] font-mono text-slate-500 mt-1">Phone: {inq.phone}</p>
                    </div>

                    <a
                      href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                        `Assalam-o-Alaikum ${inq.name}, thank you for contacting Lahore Dental. Regarding your inquiry: `
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs shrink-0 self-start sm:self-center"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Reply on WhatsApp</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TREATMENTS & PRICES */}
        {/* ========================================================================= */}
        {activeTab === "treatments" && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                Treatments, Clinical Tiers &amp; Starting Fees
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Single source of truth: fees shown here match public cards, booking selector, and AI assistant answers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CLINIC_CONFIG.treatments.map((srv) => (
                <div
                  key={srv.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Starting from Rs. {srv.startingPricePkr.toLocaleString()}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{srv.duration}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-2">{srv.name}</h3>
                    <p className="text-xs text-slate-600 mt-1">{srv.description}</p>
                    <p className="text-[11px] text-slate-400 mt-1 italic">{srv.priceNote}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Operatory: {srv.id === "implants" || srv.id === "root-canal" ? "Chair 1 (Surgical)" : "Chair 2 (General)"}
                    </span>
                    <span className="text-emerald-700 font-medium">Standardized Protocol</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
              <strong>Clinical Fee Policy:</strong> Prices listed are baseline starting fees. Final quotes are confirmed only following clinical and radiographic examination by Dr. Sarah Tariq Khan.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: AI ASSISTANT & KNOWLEDGE */}
        {/* ========================================================================= */}
        {activeTab === "ai-assistant" && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-900">AI Assistant Environment Status:</span>
                <span className="text-emerald-700 font-semibold">Configured (OPENAI_API_KEY)</span>
              </div>
              <span className="text-slate-400 font-mono">Model: gpt-4o-mini • Provider: openai</span>
            </div>
            <AIAssistantManager />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CLINIC SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6 max-w-3xl">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Clinic Operational Settings</h2>
              <p className="text-xs text-slate-500">Reception rules and automation parameters</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900">No-Show Advance Token Threshold</h3>
                <p className="text-slate-600">
                  When a patient accumulates <strong>2 or more no-shows</strong>, their file is automatically flagged as &quot;Advance Token Required&quot;. Reception will collect a non-refundable Rs. 2,000 reservation deposit before blocking chair time.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900">Operating Schedule</h3>
                <p className="text-slate-600">
                  Monday – Saturday: 11:00 AM – 09:00 PM (Asia/Karachi). Sunday: Emergency Hotline only.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900">Doctor Credentials (PMDC)</h3>
                <p className="text-slate-600">
                  Dr. Sarah Tariq Khan • PMDC Registration # 68241-D • BDS (UHS), RDS, C-Implant (ITI Switzerland)
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: RESCHEDULE APPOINTMENT WITH CONFLICT PROTECTION */}
      {/* ========================================================================= */}
      {rescheduleApt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reschedule Appointment</h3>
                <p className="text-xs text-slate-500">{rescheduleApt.name} ({rescheduleApt.phone})</p>
              </div>
              <button
                onClick={() => setRescheduleApt(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {rescheduleError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{rescheduleError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Time Slot</label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-mono"
                >
                  {[
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
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chair Operatory</label>
                <select
                  value={rescheduleChair}
                  onChange={(e: any) => setRescheduleChair(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white"
                >
                  <option value="chair-1">Chair 1 (Surgical / Implants / RCT)</option>
                  <option value="chair-2">Chair 2 (General / Scaling / Aligners)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRescheduleApt(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRescheduleSubmit}
                disabled={rescheduling}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
              >
                {rescheduling ? "Checking Conflict..." : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: WALK-IN / NEW PHONE BOOKING */}
      {/* ========================================================================= */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">New Walk-In / Phone Booking</h3>
                <p className="text-xs text-slate-500">Direct chair reservation</p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mahmood"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Mobile (+92)</label>
                <input
                  type="tel"
                  required
                  placeholder="03001234567"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newPatient.date}
                    onChange={(e) => setNewPatient({ ...newPatient, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={newPatient.time}
                    onChange={(e) => setNewPatient({ ...newPatient, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-mono"
                  >
                    {[
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
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operatory Chair</label>
                <select
                  value={newPatient.chair}
                  onChange={(e: any) => setNewPatient({ ...newPatient, chair: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white"
                >
                  <option value="chair-1">Chair 1 (Surgical / Implants / RCT)</option>
                  <option value="chair-2">Chair 2 (General / Scaling / Aligners)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Treatment / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Scaling & Ultrasonic Polishing"
                  value={newPatient.reason}
                  onChange={(e) => setNewPatient({ ...newPatient, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAppointment}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  {creatingAppointment ? "Saving..." : "Create Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GENERATE SECURE EXPIRING LINK */}
      {/* ========================================================================= */}
      {secureLinkModalPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Generate Secure Patient Link</h3>
                <p className="text-xs text-slate-500">
                  {secureLinkModalPatient.name} ({secureLinkModalPatient.phone})
                </p>
              </div>
              <button
                onClick={() => setSecureLinkModalPatient(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {!generatedLink ? (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Create an encrypted, view-limited, revocable web link for the patient to view their OPG X-rays and diagnosis report.
                </p>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Link Expiry Duration</label>
                  <select
                    value={secureHours}
                    onChange={(e) => setSecureHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white"
                  >
                    <option value={24}>24 Hours</option>
                    <option value={48}>48 Hours (Recommended)</option>
                    <option value={72}>72 Hours</option>
                    <option value={168}>7 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maximum Allowed Views</label>
                  <select
                    value={secureViews}
                    onChange={(e) => setSecureViews(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white"
                  >
                    <option value={3}>3 Views</option>
                    <option value={5}>5 Views (Standard)</option>
                    <option value={10}>10 Views</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateSecureLink}
                  disabled={generatingLink}
                  className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  {generatingLink ? "Generating Token..." : "Generate Secure Link"}
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Secure Link Ready
                  </p>
                  <p className="text-[11px] mt-1 font-mono break-all">{generatedLink.url}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLink.url);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 3000);
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                  </button>

                  <a
                    href={`https://wa.me/${
                      secureLinkModalPatient.phone.replace(/[^0-9]/g, "").startsWith("0")
                        ? "92" + secureLinkModalPatient.phone.replace(/[^0-9]/g, "").slice(1)
                        : secureLinkModalPatient.phone.replace(/[^0-9]/g, "")
                    }?text=${encodeURIComponent(
                      `Assalam-o-Alaikum ${secureLinkModalPatient.name}, here is your secure digital X-ray and dental report link from Lahore Dental Clinic: ${generatedLink.url}\n\n(This link expires automatically in ${secureHours} hours).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Link</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: IMAGE / OPG FULL PREVIEW */}
      {/* ========================================================================= */}
      {previewImage && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-4xl w-full shadow-2xl space-y-3 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  {previewImage.category}
                </span>
                <h3 className="text-sm font-bold text-slate-100">{previewImage.title}</h3>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="relative w-full aspect-[16/9] bg-black rounded-xl overflow-hidden">
              <Image
                src={previewImage.url}
                alt={previewImage.title}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            {previewImage.notes && (
              <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <strong>Radiologist Notes:</strong> {previewImage.notes}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Helper renderer for Appointment Cards
  function renderAppointmentCard(apt: Appointment) {
    const isNoShow = apt.status === "no-show";
    const isConfirmed = apt.status === "confirmed";
    const isCompleted = apt.status === "completed";

    return (
      <div
        key={apt.id}
        className={`p-4 rounded-2xl border transition-all ${
          isNoShow
            ? "bg-rose-50/60 border-rose-200"
            : isCompleted
            ? "bg-slate-50 border-slate-200 opacity-75"
            : "bg-white border-slate-200/90 shadow-xs hover:border-slate-400"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                {apt.time}
              </span>
              <h3 className="text-xs font-bold text-slate-900">{apt.name}</h3>
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-1">{apt.phone}</p>
            <p className="text-xs text-slate-700 font-medium mt-1">
              {apt.reason || "General Consultation"}
            </p>
          </div>

          {/* Status Badge */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
              isConfirmed
                ? "bg-emerald-100 text-emerald-800"
                : isCompleted
                ? "bg-blue-100 text-blue-800"
                : isNoShow
                ? "bg-rose-100 text-rose-800"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {apt.status}
          </span>
        </div>

        {/* Action Controls for Receptionist */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            {/* WhatsApp Reminder Button */}
            <button
              type="button"
              onClick={() => handleSendReminder(apt)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                apt.whatsapp_reminder_sent
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
              title="Send WhatsApp appointment reminder"
            >
              <MessageCircle className="w-3 h-3 text-emerald-600" />
              <span>{apt.whatsapp_reminder_sent ? "Reminder Sent" : "WhatsApp"}</span>
            </button>

            {/* Reschedule Button */}
            <button
              type="button"
              onClick={() => {
                setRescheduleApt(apt);
                setRescheduleDate(apt.date);
                setRescheduleTime(apt.time);
                setRescheduleChair(apt.chair || "chair-1");
                setRescheduleError(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Reschedule
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Mark Completed */}
            {isConfirmed && (
              <button
                type="button"
                onClick={() => handleStatusChange(apt.id, "completed")}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                title="Mark Completed"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}

            {/* Mark No-Show */}
            {!isNoShow && (
              <button
                type="button"
                onClick={() => handleStatusChange(apt.id, "no-show")}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                title="Mark No-Show (Auto-increments strike counter)"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
