"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthProvider";
import { useDialog } from "@/components/ui/DialogProvider";
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
  MapPin,
  ChevronLeft,
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
  const { showToast, confirm, alert } = useDialog();

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
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [pickerYear, setPickerYear] = useState<number>(() => {
    const parts = (new Date().toISOString().split("T")[0]).split("-");
    return parts.length === 3 ? parseInt(parts[0], 10) : 2026;
  });
  const [pickerMonth, setPickerMonth] = useState<number>(() => {
    const parts = (new Date().toISOString().split("T")[0]).split("-");
    return parts.length === 3 ? parseInt(parts[1], 10) - 1 : 9; // 9 = October (0-indexed)
  });

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
    const shouldLogout = await confirm({
      title: "Sign Out of Clinic Console?",
      message: "You will be redirected to the admin login portal.",
      confirmText: "Sign Out",
      cancelText: "Stay Logged In",
      type: "warning",
    });
    if (!shouldLogout) return;

    await logout();
    showToast({
      type: "info",
      title: "Logged Out",
      message: "Successfully signed out of admin session.",
    });
    router.push(`/${locale}/admin/login`);
  };

  // Status Change
  const handleStatusChange = async (
    id: string,
    newStatus: "confirmed" | "completed" | "cancelled" | "no-show"
  ) => {
    if (newStatus === "no-show") {
      const willMarkNoShow = await confirm({
        title: "Mark Patient as No-Show?",
        message:
          "This will increment their missed appointment counter. Accumulating 2+ no-shows will automatically enforce the Rs. 2,000 Advance Token rule.",
        confirmText: "Yes, Mark No-Show",
        cancelText: "Cancel",
        type: "danger",
      });
      if (!willMarkNoShow) return;
    } else if (newStatus === "cancelled") {
      const willCancel = await confirm({
        title: "Cancel Appointment?",
        message: "Are you sure you want to cancel this scheduled appointment slot?",
        confirmText: "Yes, Cancel",
        cancelText: "Keep Slot",
        type: "warning",
      });
      if (!willCancel) return;
    }

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
        showToast({
          type: "success",
          title: "Status Updated",
          message: `Appointment marked as ${newStatus}.`,
        });
        // Refresh patients if no-show to update counter
        if (newStatus === "no-show") {
          fetchData();
        }
      } else {
        showToast({
          type: "error",
          title: "Update Failed",
          message: "Unable to update appointment status.",
        });
      }
    } catch (err) {
      console.error("Status update error:", err);
      showToast({
        type: "error",
        title: "Server Error",
        message: "Failed to communicate with appointment API.",
      });
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
      showToast({
        type: "success",
        title: "Reminder Logged",
        message: `WhatsApp reminder dispatched for ${apt.name}.`,
      });
    } catch (e) {
      // ignore
    }
  };

  // Trigger Bulk Reminders for Tomorrow
  const handleTriggerBulkReminders = async () => {
    const proceed = await confirm({
      title: "Send Tomorrow's Reminders?",
      message: `Trigger automated reminder dispatch for all ${tomorrowApts.length} confirmed appointments tomorrow?`,
      confirmText: "Send Bulk Reminders",
      cancelText: "Cancel",
      type: "info",
    });
    if (!proceed) return;

    setBulkReminderLoading(true);
    try {
      const res = await fetch("/api/admin/reminders/bulk", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showToast({
          type: "success",
          title: "Bulk Reminders Sent",
          message: data.message || `Processed reminders for tomorrow.`,
        });
        fetchData();
      } else {
        showToast({
          type: "error",
          title: "Dispatch Error",
          message: data.error || "Failed to trigger bulk reminders",
        });
      }
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Network Error",
        message: err.message || "Network error sending reminders",
      });
    } finally {
      setBulkReminderLoading(false);
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
        showToast({
          type: "success",
          title: "Notes Saved",
          message: "Clinical patient notes updated successfully.",
        });
      } else {
        showToast({
          type: "error",
          title: "Save Failed",
          message: "Failed to update clinical notes.",
        });
      }
    } catch (err) {
      console.error("Failed saving notes:", err);
      showToast({
        type: "error",
        title: "Network Error",
        message: "Unable to reach server to save notes.",
      });
    } finally {
      setSavingNotes(false);
    }
  };

  // Toggle Advance Token Requirement
  const handleToggleAdvanceToken = async (patient: Patient) => {
    const nextVal = !patient.advanceTokenRequired;
    const confirmed = await confirm({
      title: nextVal ? "Enforce Advance Token Deposit?" : "Clear Token Requirement?",
      message: nextVal
        ? `Patient ${patient.name} will be required to pay a non-refundable Rs. 2,000 advance token deposit before booking any future appointments.`
        : `Remove token penalty for ${patient.name}? They will be able to book normal appointments without advance fee.`,
      confirmText: nextVal ? "Enforce Rs. 2,000 Token" : "Remove Penalty",
      cancelText: "Cancel",
      type: nextVal ? "danger" : "info",
    });
    if (!confirmed) return;

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
        showToast({
          type: "success",
          title: "Patient Policy Updated",
          message: nextVal
            ? `Advance Token (Rs. 2,000) enforced for ${patient.name}.`
            : `Advance Token requirement cleared for ${patient.name}.`,
        });
      } else {
        showToast({
          type: "error",
          title: "Update Failed",
          message: "Failed to modify token requirement.",
        });
      }
    } catch (e) {
      showToast({
        type: "error",
        title: "Server Error",
        message: "Failed to update patient record.",
      });
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

  // Synchronize picker month & year whenever selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const parts = selectedDate.split("-");
      if (parts.length === 3) {
        setPickerYear(parseInt(parts[0], 10));
        setPickerMonth(parseInt(parts[1], 10) - 1);
      }
    }
  }, [selectedDate]);

  // Calendar Days Computation for custom Dark Picker
  const calendarMonthDays = useMemo(() => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = monthNames[pickerMonth];

    // First day of current picker month
    const firstDay = new Date(pickerYear, pickerMonth, 1);
    // Day of week: 0 is Sun, 1 is Mon ... 6 is Sat. Reference starts on MON!
    const dayOfWeek = firstDay.getDay(); // 0(Sun) -> 6, 1(Mon) -> 0
    const startOffset = (dayOfWeek + 6) % 7; // Monday = 0, Sunday = 6

    const totalDaysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(pickerYear, pickerMonth, 0).getDate();

    const days: Array<{
      dayNum: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isToday: boolean;
    }> = [];

    // Prev month overflow days
    for (let i = startOffset - 1; i >= 0; i--) {
      const dNum = prevMonthTotalDays - i;
      const prevM = pickerMonth === 0 ? 11 : pickerMonth - 1;
      const prevY = pickerMonth === 0 ? pickerYear - 1 : pickerYear;
      const dStr = `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`;
      days.push({
        dayNum: dNum,
        dateStr: dStr,
        isCurrentMonth: false,
        isSelected: dStr === selectedDate,
        isToday: dStr === todayStr,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dStr = `${pickerYear}-${String(pickerMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNum: d,
        dateStr: dStr,
        isCurrentMonth: true,
        isSelected: dStr === selectedDate,
        isToday: dStr === todayStr,
      });
    }

    // Trailing next month overflow days to fill rows of 7
    const remaining = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const nextM = pickerMonth === 11 ? 0 : pickerMonth + 1;
      const nextY = pickerMonth === 11 ? pickerYear + 1 : pickerYear;
      const dStr = `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`;
      days.push({
        dayNum: n,
        dateStr: dStr,
        isCurrentMonth: false,
        isSelected: dStr === selectedDate,
        isToday: dStr === todayStr,
      });
    }

    return { monthName, year: pickerYear, days };
  }, [pickerYear, pickerMonth, selectedDate, todayStr]);

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
    <div className="min-h-screen bg-[#EEF1F8] p-3 sm:p-5 lg:p-7 text-[#2D3748] font-sans antialiased selection:bg-[#544BB9] selection:text-white pb-16">

      {/* Main Claymorphic Dashboard Shell Container */}
      <div className="max-w-[1700px] mx-auto bg-[#F7F9FD] border border-white/80 rounded-[36px] shadow-[0_24px_60px_rgba(110,125,160,0.12)] p-4 sm:p-6 lg:p-7 flex flex-col lg:flex-row gap-6">
        
        {/* ========================================================= */}
        {/* 1. LEFT PURPLE NAVIGATION CAPSULE (Matches Reference Image) */}
        {/* ========================================================= */}
        <aside className="lg:w-20 w-full bg-gradient-to-b from-[#544BB9] via-[#4A3FA8] to-[#3E3494] rounded-[28px] p-3.5 flex lg:flex-col flex-row items-center justify-between lg:justify-start gap-4 shadow-[0_16px_36px_rgba(84,75,185,0.32)] shrink-0">
          {/* Brand Squircle Icon */}
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner font-bold text-lg">
            🦷
          </div>

          <div className="h-[1px] w-8 bg-white/15 my-1 hidden lg:block" />

          {/* Navigation Tabs Icons */}
          <nav className="flex lg:flex-col flex-row items-center gap-3 w-full justify-center">
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
                  title={tab.label}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 relative group cursor-pointer ${
                    isActive
                      ? "bg-white text-[#544BB9] shadow-[0_8px_20px_rgba(0,0,0,0.15)] scale-105 font-bold"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <span className="absolute -left-1 w-1.5 h-6 bg-[#FD7289] rounded-r-full hidden lg:block" />
                  )}
                  {tab.count !== undefined && tab.count > 0 && !isActive && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FD7289]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Sign-Out Button */}
          <div className="lg:mt-auto hidden lg:block">
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="w-12 h-12 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. MAIN CENTER WORKSPACE AREA                             */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Top Header Bar */}
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#8A94A6]">
                  Primary Dashboard
                </span>
                <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  Live
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2640] tracking-tight mt-0.5">
                Lahore Dental Clinic Console
              </h1>
              <p className="text-xs text-[#8A94A6] font-medium flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#544BB9]" />
                PMDC Registered • Gulberg III, Lahore • Open Now (11:00 AM – 9:00 PM)
              </p>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              {/* Search Pill */}
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 text-[#8A94A6] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patient, phone..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200/80 rounded-full pl-9 pr-4 py-2 text-xs font-medium text-[#1E2640] placeholder-[#8A94A6] focus:outline-none focus:ring-2 focus:ring-[#544BB9]/20 shadow-sm"
                />
              </div>

              {/* Remind Tomorrow's Pill */}
              <button
                type="button"
                onClick={handleTriggerBulkReminders}
                disabled={bulkReminderLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-[0_6px_16px_rgba(16,185,129,0.25)] transition-transform active:scale-95 cursor-pointer shrink-0"
              >
                {bulkReminderLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Remind Tomorrow ({tomorrowApts.length})</span>
              </button>

              {/* + Walk-In Booking Pill */}
              <button
                type="button"
                onClick={() => setShowNewModal(true)}
                className="bg-[#544BB9] hover:bg-[#463CA3] text-white text-xs font-semibold px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-[0_8px_20px_rgba(84,75,185,0.25)] transition-transform active:scale-95 cursor-pointer shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Walk-In</span>
              </button>

              {/* Doctor Avatar Pill */}
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#544BB9] to-[#FD7289] p-0.5 shrink-0 shadow-sm">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-[#544BB9]">
                    ST
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg lg:hidden"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* ========================================================================= */}
          {/* TAB 1: CALENDAR (CHAIR 1 & CHAIR 2 VISUAL SPLIT + IMAGE 1 HERO CARDS)     */}
          {/* ========================================================================= */}
          {activeTab === "calendar" && (
            <div className="space-y-6">
              
              {/* HERO STATS ROW (Matching Image 1's Signature Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                {/* Card A: Signature Deep Purple Overview Widget (7 cols) */}
                <div className="md:col-span-8 bg-gradient-to-br from-[#544BB9] via-[#493CA6] to-[#3A2D94] rounded-[28px] p-6 text-white shadow-[0_18px_36px_rgba(84,75,185,0.32)] relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <h3 className="text-lg font-extrabold text-white tracking-tight drop-shadow-xs">Today&apos;s Operatory Flow</h3>
                      <p className="text-xs text-indigo-100 font-medium mt-0.5">
                        <span className="font-bold text-white">{todayApts.length}</span> Confirmed Appointments · <span className="font-bold text-emerald-300">{todayApts.filter((a) => a.status === "completed").length}</span> Completed
                      </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-bold text-white border border-white/30 shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live Asia/Karachi</span>
                    </div>
                  </div>

                  {/* Glowing Wave SVG Representation (Signature Feature in Image 1) */}
                  <div className="my-2 relative z-10">
                    <div className="relative h-20 w-full flex items-center">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 80" fill="none">
                        <path
                          d="M0,60 C80,60 120,20 200,30 C280,40 340,10 420,35 C460,50 480,30 500,40"
                          stroke="rgba(253, 114, 137, 0.95)"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M0,60 C80,60 120,20 200,30 C280,40 340,10 420,35 C460,50 480,30 500,40 L500,80 L0,80 Z"
                          fill="url(#purpleGlow)"
                          opacity="0.35"
                        />
                        <defs>
                          <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FD7289" />
                            <stop offset="100%" stopColor="#544BB9" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <circle cx="200" cy="30" r="6" fill="#FFFFFF" stroke="#FD7289" strokeWidth="4" />
                      </svg>
                      
                      <div className="absolute left-[38%] top-0 -translate-y-2 bg-white/25 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-extrabold border border-white/40 text-white shadow-lg">
                        Peak: Chair 1 Surgery
                      </div>
                    </div>

                    <div className="flex justify-between text-[11px] text-indigo-100 font-bold px-2">
                      <span>11 AM</span>
                      <span>1 PM</span>
                      <span>3 PM</span>
                      <span>5 PM</span>
                      <span>7 PM</span>
                      <span>9 PM</span>
                    </div>
                  </div>

                  {/* 3-Column Pill Footer */}
                  <div className="grid grid-cols-3 gap-3 pt-3.5 border-t border-white/20 relative z-10">
                    <div>
                      <span className="text-[11px] text-indigo-200 block font-semibold">Chair 1 Load</span>
                      <p className="text-xl font-black text-white tracking-tight">{chair1Today.length} Patients</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-indigo-200 block font-semibold">Chair 2 Load</span>
                      <p className="text-xl font-black text-white tracking-tight">{chair2Today.length} Patients</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-indigo-200 block font-semibold">Autoclave Protocol</span>
                      <p className="text-xl font-black text-[#5EEAD4] drop-shadow-xs">Class-B OK</p>
                    </div>
                  </div>
                </div>

                {/* Card B: Signature Coral-Rose Highlight Widget (4 cols) */}
                <div className="md:col-span-4 bg-gradient-to-br from-[#FD7289] via-[#FC617C] to-[#F54B68] rounded-[28px] p-6 text-white shadow-[0_18px_36px_rgba(253,114,137,0.32)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center text-white shadow-inner">
                        <Send className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] uppercase font-extrabold tracking-widest bg-white/25 border border-white/30 text-white px-3 py-1 rounded-full">
                        Action Required
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-bold text-white tracking-tight">Tomorrow&apos;s Patients</h4>
                      <p className="text-3xl lg:text-4xl font-black text-white tracking-tight mt-1 drop-shadow-xs">
                        {tomorrowPendingReminders.length} Pending
                      </p>
                      <p className="text-xs text-rose-100 font-medium mt-1">
                        <span className="font-bold text-white">{tomorrowApts.length - tomorrowPendingReminders.length}</span> reminder(s) already dispatched.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTriggerBulkReminders}
                    disabled={bulkReminderLoading}
                    className="w-full bg-white hover:bg-white/95 text-[#E02447] font-extrabold text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all active:scale-95 cursor-pointer mt-4"
                  >
                    {bulkReminderLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-[#E02447]" />
                    )}
                    <span className="text-[#E02447]">Remind All Tomorrow</span>
                    <ChevronRight className="w-4 h-4 ml-auto text-[#E02447]" />
                  </button>
                </div>
              </div>

              {/* Main Scheduling Section + Right Activity Panel */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* Operatory Chairs Area (8 cols on XL) */}
                <div className="xl:col-span-8 space-y-5">
                  {/* Calendar Controls Bar (Single Horizontal Row) */}
                  <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-[0_8px_24px_rgba(90,105,145,0.05)] flex flex-wrap items-center justify-between gap-3 relative z-30">
                    {/* Left: Quick Date Pills & Custom Popover Trigger on same row */}
                    <div className="flex items-center gap-3">
                      <div className="bg-[#EEF1F8] p-1 rounded-full flex items-center text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate(todayStr);
                            setShowDatePicker(false);
                          }}
                          className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                            selectedDate === todayStr
                              ? "bg-[#544BB9] text-white shadow-sm font-bold"
                              : "text-[#8A94A6] hover:text-[#1E2640]"
                          }`}
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate(tomorrowStr);
                            setShowDatePicker(false);
                          }}
                          className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                            selectedDate === tomorrowStr
                              ? "bg-[#544BB9] text-white shadow-sm font-bold"
                              : "text-[#8A94A6] hover:text-[#1E2640]"
                          }`}
                        >
                          Tomorrow
                        </button>
                      </div>

                      {/* Custom Dark-Themed Rounded Calendar Dropdown Popover */}
                      <div className="relative inline-block">
                        {/* Interactive Trigger Capsule Pill */}
                        <button
                          type="button"
                          onClick={() => setShowDatePicker((prev) => !prev)}
                          className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border shadow-xs flex items-center gap-2 cursor-pointer transition-all ${
                            showDatePicker
                              ? "border-[#6C5CE7] bg-[#EEF1F8] text-[#544BB9] ring-2 ring-[#6C5CE7]/20"
                              : "border-slate-200/90 bg-white text-slate-800 hover:border-[#6C5CE7] hover:text-[#544BB9]"
                          }`}
                        >
                          <span className="font-mono font-bold">{selectedDate}</span>
                          <CalendarIcon className="w-3.5 h-3.5 text-[#544BB9]" />
                        </button>

                        {/* Dropdown Backdrop to close on click outside */}
                        {showDatePicker && (
                          <div
                            className="fixed inset-0 z-40 bg-transparent"
                            onClick={() => setShowDatePicker(false)}
                          />
                        )}

                        {/* Pixel-Perfect Dark Calendar Card (image_11.png Reference) */}
                        {showDatePicker && (
                          <div className="absolute left-0 top-full mt-2.5 z-50 w-[320px] rounded-3xl bg-gradient-to-b from-[#141324] to-[#0A0A0F] border border-white/10 shadow-[0_24px_50px_rgba(10,10,25,0.7),0_10px_20px_rgba(108,92,231,0.2)] p-5 text-white animate-in fade-in zoom-in-95 origin-top duration-150 overflow-hidden font-sans">
                            {/* Top Purple Accent Indicator Bar */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-1 bg-gradient-to-r from-transparent via-[#6C5CE7] to-transparent rounded-b-full shadow-[0_0_12px_#6C5CE7]" />
                            {/* Ambient Top Glow Blob */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-10 bg-[#6C5CE7]/20 blur-xl pointer-events-none rounded-full" />

                            {/* Header: Month & Navigation Arrows */}
                            <div className="flex items-center justify-between mb-4 relative z-10 pt-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (pickerMonth === 0) {
                                    setPickerMonth(11);
                                    setPickerYear((y) => y - 1);
                                  } else {
                                    setPickerMonth((m) => m - 1);
                                  }
                                }}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-all cursor-pointer"
                                aria-label="Previous month"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>

                              <h3 className="text-sm font-semibold tracking-wide text-neutral-100 font-sans">
                                {calendarMonthDays.monthName} {calendarMonthDays.year}
                              </h3>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (pickerMonth === 11) {
                                    setPickerMonth(0);
                                    setPickerYear((y) => y + 1);
                                  } else {
                                    setPickerMonth((m) => m + 1);
                                  }
                                }}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-all cursor-pointer"
                                aria-label="Next month"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Weekday Row (MON to SUN) */}
                            <div className="grid grid-cols-7 gap-1 text-center mb-2.5 relative z-10">
                              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
                                <span
                                  key={day}
                                  className="text-[10px] font-bold tracking-[0.05em] text-neutral-500 py-1"
                                >
                                  {day}
                                </span>
                              ))}
                            </div>

                            {/* Calendar Days 7x Grid */}
                            <div className="grid grid-cols-7 gap-y-1.5 gap-x-1 text-center relative z-10">
                              {calendarMonthDays.days.map((item, idx) => {
                                const isSelected = item.isSelected;

                                return (
                                  <div
                                    key={`${item.dateStr}-${idx}`}
                                    className="flex items-center justify-center h-9 w-9 mx-auto"
                                  >
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDate(item.dateStr);
                                        setShowDatePicker(false);
                                      }}
                                      className={`h-9 w-9 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer ${
                                        isSelected
                                          ? "bg-[#6C5CE7] text-white font-bold shadow-[0_4px_16px_rgba(108,92,231,0.65)] scale-105"
                                          : item.isCurrentMonth
                                          ? "text-neutral-200 font-medium hover:bg-white/10 hover:text-white"
                                          : "text-neutral-600 font-normal hover:text-neutral-400"
                                      }`}
                                    >
                                      {item.dayNum}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Status Indicators (Same Row) */}
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-[#8A94A6]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#38A169]" /> Confirmed
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#544BB9]" /> Completed
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#E53E3E]" /> No-Show
                      </span>
                    </div>
                  </div>

                  {/* Split Chair Grid Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                    
                    {/* CHAIR 1 OPERATORY COLUMN */}
                    <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-[0_12px_28px_rgba(90,105,145,0.06)] flex flex-col">
                      <div className="flex items-start justify-between gap-3 w-full pb-3.5 mb-3 border-b border-slate-100">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#544BB9]/10 text-[#544BB9] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            1
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-sm font-extrabold text-[#1E2640] truncate">
                              Chair 1 — Surgical &amp; Endodontics
                            </h2>
                            <p className="text-[11px] font-semibold text-[#544BB9] truncate">
                              Dental Implants, Single-Visit RCT
                            </p>
                          </div>
                        </div>
                        <span className="whitespace-nowrap shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-[#544BB9] font-mono">
                          {chair1Apts.length} booked
                        </span>
                      </div>

                      <div className="space-y-3 flex-1">
                        {chair1Apts.length === 0 ? (
                          <div className="h-44 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                            <Clock className="w-6 h-6 text-slate-400 mb-1" />
                            <p className="text-xs font-bold text-slate-700">
                              Chair 1 is open on {selectedDate}
                            </p>
                            <button
                              onClick={() => {
                                setNewPatient((p) => ({ ...p, date: selectedDate, chair: "chair-1" }));
                                setShowNewModal(true);
                              }}
                              className="mt-2 text-xs text-[#544BB9] font-extrabold hover:underline cursor-pointer"
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
                    <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-[0_12px_28px_rgba(90,105,145,0.06)] flex flex-col">
                      <div className="flex items-start justify-between gap-3 w-full pb-3.5 mb-3 border-b border-slate-100">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#FD7289]/15 text-[#E02447] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            2
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-sm font-extrabold text-[#1E2640] truncate">
                              Chair 2 — Preventive &amp; Orthodontics
                            </h2>
                            <p className="text-[11px] font-semibold text-[#E02447] truncate">
                              Scaling, Clear Aligners, Whitening
                            </p>
                          </div>
                        </div>
                        <span className="whitespace-nowrap shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-[#E02447] font-mono">
                          {chair2Apts.length} booked
                        </span>
                      </div>

                      <div className="space-y-3 flex-1">
                        {chair2Apts.length === 0 ? (
                          <div className="h-44 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                            <Clock className="w-6 h-6 text-slate-300 mb-1" />
                            <p className="text-xs font-semibold text-slate-600">
                              Chair 2 is open on {selectedDate}
                            </p>
                            <button
                              onClick={() => {
                                setNewPatient((p) => ({ ...p, date: selectedDate, chair: "chair-2" }));
                                setShowNewModal(true);
                              }}
                              className="mt-2 text-[11px] text-[#FD7289] font-bold hover:underline cursor-pointer"
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

                {/* ========================================================= */}
                {/* RIGHT ACTIVITY PANEL (Matching "Friends & Map" in Image 1)  */}
                {/* ========================================================= */}
                <aside className="xl:col-span-4 flex flex-col gap-5">
                  {/* Top Panel: Today's Patient Queue */}
                  <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-[0_12px_28px_rgba(90,105,145,0.06)] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#544BB9]" />
                        <h3 className="text-sm font-bold text-[#1E2640]">Patient Queue</h3>
                      </div>
                      <span className="text-[11px] font-semibold text-[#544BB9] font-mono">
                        {dateAppointments.length} Active
                      </span>
                    </div>

                    <div className="space-y-3">
                      {dateAppointments.length === 0 ? (
                        <p className="text-xs text-slate-500 font-medium text-center py-4">
                          No patients scheduled for this date.
                        </p>
                      ) : (
                        dateAppointments.slice(0, 5).map((apt, idx) => (
                          <div key={apt.id} className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-[#EEF1F8]/60 transition-colors border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs ${
                                  idx % 2 === 0 ? "bg-[#544BB9]" : "bg-[#FD7289]"
                                }`}
                              >
                                {apt.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-[#1E2640] truncate">
                                  {apt.name}
                                </h5>
                                <p className="text-[11px] font-semibold text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                                  <span className="font-bold text-[#544BB9] bg-[#EEF1F8] px-1.5 py-0.2 rounded-md font-mono">{apt.time}</span>
                                  <span>{apt.reason || "Consultation"}</span>
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSendReminder(apt)}
                              title="Send WhatsApp Reminder"
                              className="w-8 h-8 rounded-full bg-[#EEF1F8] hover:bg-[#544BB9] text-[#544BB9] hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Bottom Panel: Gulberg III Operatory & Valet Status */}
                  <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-[0_12px_28px_rgba(90,105,145,0.06)] flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#FD7289]" />
                        <h3 className="text-sm font-bold text-[#1E2640]">Gulberg III Clinic</h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        Open Now
                      </span>
                    </div>

                    <div className="relative h-28 rounded-2xl bg-gradient-to-br from-[#E8ECF5] to-[#DFE5F2] overflow-hidden border border-slate-200/60 p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-[#8A94A6]">
                        <span>Plaza 42-B, Main Boulevard</span>
                        <span className="text-[#544BB9] font-bold">Valet: Free</span>
                      </div>

                      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-xl border border-white shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FD7289] animate-ping" />
                        <span className="text-[10px] font-bold text-[#1E2640]">
                          Lahore Dental Suites
                        </span>
                        <span className="text-[9px] text-[#8A94A6] ml-auto">Chair 1 &amp; 2 Active</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#8A94A6] flex justify-between pt-1">
                      <span>Sterilization: Class-B Vacuum</span>
                      <span className="text-emerald-600 font-bold">134°C OK</span>
                    </div>
                  </div>
                </aside>
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
        </div>
      </div>

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
            ? "bg-slate-50 border-slate-200 opacity-80"
            : "bg-white border-slate-100 shadow-[0_4px_16px_rgba(90,105,145,0.04)] hover:shadow-[0_8px_24px_rgba(90,105,145,0.08)] hover:border-[#544BB9]/30"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black font-mono text-[#544BB9] bg-[#EEF1F8] px-2.5 py-0.5 rounded-full border border-indigo-100">
                {apt.time}
              </span>
              <h3 className="text-xs font-bold text-[#1E2640]">{apt.name}</h3>
            </div>
            <p className="text-[11px] font-mono font-medium text-slate-500 mt-1 flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{apt.phone}</span>
            </p>
            <p className="text-xs text-[#544BB9] font-bold mt-1">
              {apt.reason || "General Consultation"}
            </p>
          </div>

          {/* Status Badge */}
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              isConfirmed
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : isCompleted
                ? "bg-indigo-50 text-[#544BB9] border border-indigo-100"
                : isNoShow
                ? "bg-rose-50 text-rose-700 border border-rose-100"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {apt.status}
          </span>
        </div>

        {/* Action Controls for Receptionist */}
        <div className="mt-3 pt-3 border-t border-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            {/* WhatsApp Reminder Button */}
            <button
              type="button"
              onClick={() => handleSendReminder(apt)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                apt.whatsapp_reminder_sent
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-[#EEF1F8] hover:bg-[#544BB9] text-[#544BB9] hover:text-white"
              }`}
              title="Send WhatsApp appointment reminder"
            >
              <MessageCircle className="w-3 h-3" />
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
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
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
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full cursor-pointer transition-colors"
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
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-full cursor-pointer transition-colors"
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
