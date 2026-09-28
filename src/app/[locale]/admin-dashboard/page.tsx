"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Calendar,
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
} from "lucide-react";
import { AIAssistantManager } from "@/components/admin/AIAssistantManager";

interface Appointment {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  reason?: string;
  status: "confirmed" | "completed" | "cancelled";
  language?: string;
  created_at?: string;
}

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  created_at: string;
  status: string;
}

export default function AdminDashboardPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, role, logout, isLoading: authLoading } = useAuth();

  // Data State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<"appointments" | "inquiries" | "new" | "ai-knowledge">("appointments");

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "tomorrow">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // New Walk-in Appointment State
  const today = new Date().toISOString().split("T")[0];
  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: "",
    date: today,
    time: "11:00",
    reason: "General Consultation",
  });
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);

  // Strict RBAC: If not authenticated or not admin, redirect away
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push(`/${locale}?auth=required`);
      } else if (role !== "admin") {
        router.push(`/${locale}/user-dashboard?error=admin_only`);
      }
    }
  }, [authLoading, user, role, locale, router]);

  // Fetch admin appointments and inquiries
  const fetchData = async () => {
    setLoadingData(true);
    try {
      const res = await fetch("/api/admin/data");
      const data = await res.json();
      if (data.appointments) setAppointments(data.appointments);
      if (data.inquiries) setInquiries(data.inquiries);
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
    router.push(`/${locale}`);
  };

  // Update Status
  const handleStatusChange = async (id: string, newStatus: "confirmed" | "completed" | "cancelled") => {
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
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // Delete Appointment
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAppointments((prev) => prev.filter((apt) => apt.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Create New Walk-in Appointment
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAppointment(true);
    setCreationSuccess(false);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient),
      });

      const data = await res.json();

      if (res.ok) {
        setCreationSuccess(true);
        setNewPatient({
          name: "",
          phone: "",
          date: today,
          time: "11:00",
          reason: "General Consultation",
        });
        fetchData();
        setTimeout(() => setCreationSuccess(false), 3000);
      } else {
        alert(data.error || "Failed to create appointment");
      }
    } catch (err) {
      alert("Error booking appointment");
    } finally {
      setCreatingAppointment(false);
    }
  };

  const formatSlotLabel = (slot: string) => {
    if (!slot) return "";
    const [h, m] = slot.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m || "00"} ${ampm}`;
  };

  const getWhatsAppLink = (phone: string, patientName: string, date: string, time: string) => {
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) clean = "92" + clean.slice(1);
    else if (!clean.startsWith("92")) clean = "92" + clean;
    const msg = `Hello ${patientName}! This is a reminder from Lahore Dental for your appointment on ${date} at ${formatSlotLabel(time)}. Please arrive 10 minutes prior.`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      apt.name.toLowerCase().includes(q) ||
      apt.phone.toLowerCase().includes(q) ||
      (apt.reason && apt.reason.toLowerCase().includes(q));

    const todayStr = new Date().toISOString().split("T")[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    let matchDate = true;
    if (dateFilter === "today") matchDate = apt.date === todayStr;
    if (dateFilter === "tomorrow") matchDate = apt.date === tomorrowStr;

    const matchStatus = statusFilter === "all" || apt.status === statusFilter;

    return matchSearch && matchDate && matchStatus;
  });

  // KPI Calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const countToday = appointments.filter((a) => a.date === todayStr).length;
  const countConfirmed = appointments.filter((a) => a.status === "confirmed").length;

  if (authLoading || !user || role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#04326d] animate-spin" />
          <p className="text-sm font-medium text-slate-600 font-sans">
            Verifying admin security credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#04326d] text-white flex items-center justify-center text-lg shadow-soft">
                🦷
              </div>
              <div>
                <span className="font-heading font-bold text-[#001a4b] text-base tracking-tight block">
                  Lahore Dental
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#04326d]">
                    Admin Dashboard
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 uppercase">
                    Role: {role}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={fetchData}
                disabled={loadingData}
                title="Refresh Data"
                className="p-2 rounded-xl text-slate-600 hover:bg-[#b2bed6]/20 hover:text-[#04326d] transition-colors border border-slate-200 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
              </button>

              <Link
                href={`/${locale}`}
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium"
              >
                <Home className="w-3.5 h-3.5" />
                <span>View Site</span>
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Total Appointments
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#001a4b]">
                {appointments.length}
              </span>
              <span className="text-xs text-[#04326d] font-semibold bg-[#b2bed6]/20 px-2 py-0.5 rounded-md">
                All time
              </span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#b2bed6]/40 shadow-xs">
            <span className="text-xs font-semibold text-[#04326d] uppercase tracking-wider block mb-1">
              Today&apos;s Schedule
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#001a4b]">
                {countToday}
              </span>
              <span className="text-xs text-[#04326d] font-bold bg-[#b2bed6]/30 px-2 py-0.5 rounded-md">
                {todayStr}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-xs">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
              Confirmed
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
                {countConfirmed}
              </span>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                Active
              </span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Patient Inquiries
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#001a4b]">
                {inquiries.length}
              </span>
              <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                Messages
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "appointments"
                ? "bg-[#04326d] text-white shadow-soft"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Appointments ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "inquiries"
                ? "bg-[#04326d] text-white shadow-soft"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Web Inquiries ({inquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("new")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "new"
                ? "bg-[#04326d] text-white shadow-soft"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Walk-In / Phone Booking</span>
          </button>

          <button
            onClick={() => setActiveTab("ai-knowledge")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "ai-knowledge"
                ? "bg-[#04326d] text-white shadow-soft"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Assistant & Knowledge</span>
          </button>
        </div>

        {/* TAB 1: Appointments List */}
        {activeTab === "appointments" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by patient name, phone, or treatment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setDateFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    dateFilter === "all"
                      ? "bg-[#04326d] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Dates
                </button>
                <button
                  onClick={() => setDateFilter("today")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    dateFilter === "today"
                      ? "bg-[#04326d] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setDateFilter("tomorrow")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    dateFilter === "tomorrow"
                      ? "bg-[#04326d] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Tomorrow
                </button>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {filteredAppointments.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700">No appointments found</p>
                <p className="text-xs text-slate-400">
                  Try adjusting your search query or filters.
                </p>
              </div>
            )}

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{apt.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">{apt.phone}</p>
                    </div>

                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        apt.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : apt.status === "cancelled"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-[#b2bed6]/30 text-[#001a4b]"
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 text-xs space-y-1 text-slate-700">
                    <div className="flex items-center gap-1.5 font-semibold text-[#04326d]">
                      <Clock className="w-3.5 h-3.5 text-[#04326d]" />
                      <span>
                        {apt.date} • {formatSlotLabel(apt.time)}
                      </span>
                    </div>
                    <p className="text-slate-600 line-clamp-2">
                      <strong>Treatment:</strong> {apt.reason || "General Checkup"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${apt.phone}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-slate-600" />
                        <span>Call</span>
                      </a>
                      <a
                        href={getWhatsAppLink(apt.phone, apt.name, apt.date, apt.time)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-1">
                      {apt.status !== "completed" && (
                        <button
                          onClick={() => handleStatusChange(apt.id, "completed")}
                          title="Mark Completed"
                          className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      {apt.status !== "cancelled" && (
                        <button
                          onClick={() => handleStatusChange(apt.id, "cancelled")}
                          title="Cancel Booking"
                          className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(apt.id)}
                        title="Delete Record"
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Patient Name</th>
                      <th className="px-4 py-3.5">Contact</th>
                      <th className="px-4 py-3.5">Date & Time</th>
                      <th className="px-4 py-3.5">Treatment / Reason</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900">
                          {apt.name}
                          <span className="block text-[11px] font-normal text-slate-400">
                            ID: {apt.id}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-slate-700 block">{apt.phone}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <a
                              href={`tel:${apt.phone}`}
                              className="text-xs text-[#04326d] hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Phone className="w-3 h-3" /> Call
                            </a>
                            <span className="text-slate-300">•</span>
                            <a
                              href={getWhatsAppLink(apt.phone, apt.name, apt.date, apt.time)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <MessageCircle className="w-3 h-3 text-emerald-600" /> WhatsApp
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-semibold text-slate-900 block">{apt.date}</span>
                          <span className="text-xs text-[#04326d] font-bold bg-[#b2bed6]/20 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {formatSlotLabel(apt.time)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 max-w-xs truncate">
                          {apt.reason || "General Consultation"}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                              apt.status === "completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : apt.status === "cancelled"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-[#b2bed6]/30 text-[#001a4b]"
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {apt.status !== "completed" && (
                              <button
                                onClick={() => handleStatusChange(apt.id, "completed")}
                                title="Mark Completed"
                                className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {apt.status !== "cancelled" && (
                              <button
                                onClick={() => handleStatusChange(apt.id, "cancelled")}
                                title="Cancel Booking"
                                className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(apt.id)}
                              title="Delete Record"
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Inquiries List */}
        {activeTab === "inquiries" && (
          <div className="space-y-4">
            {inquiries.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No inquiries yet</p>
                <p className="text-xs text-slate-400">
                  Messages submitted on the contact form will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{inq.name}</h4>
                        <span className="text-xs text-slate-400">
                          {new Date(inq.created_at).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#b2bed6]/20 text-[#04326d]">
                        Web Inquiry
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
                      &ldquo;{inq.message}&rdquo;
                    </p>

                    <div className="flex items-center gap-3 pt-1">
                      <a
                        href={`tel:${inq.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>Call ({inq.phone})</span>
                      </a>
                      <a
                        href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Hello ${inq.name}! We received your inquiry at Lahore Dental.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Reply on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Walk-in Booking Form */}
        {activeTab === "new" && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-[#b2bed6]/40 p-6 sm:p-8 shadow-card space-y-5">
            <div>
              <h3 className="text-lg font-bold text-[#001a4b]">
                Book Walk-In or Phone Caller Appointment
              </h3>
              <p className="text-xs text-slate-500">
                Instantly reserves a dental slot in the database and updates calendar.
              </p>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#001a4b] mb-1 font-sans">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zainab Bibi"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-base rounded-xl border border-slate-200 focus:border-[#04326d] focus:ring-2 focus:ring-[#b2bed6]/30 outline-none font-sans font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#001a4b] mb-1 font-sans">
                  Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0300 1234567"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full px-4 py-2.5 text-base rounded-xl border border-slate-200 focus:border-[#04326d] focus:ring-2 focus:ring-[#b2bed6]/30 outline-none font-sans font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#001a4b] mb-1 font-sans">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={newPatient.date}
                    onChange={(e) => setNewPatient({ ...newPatient, date: e.target.value })}
                    className="w-full px-3 py-2 text-base rounded-xl border border-slate-200 focus:border-[#04326d] outline-none font-sans font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#001a4b] mb-1 font-sans">
                    Time Slot *
                  </label>
                  <select
                    value={newPatient.time}
                    onChange={(e) => setNewPatient({ ...newPatient, time: e.target.value })}
                    className="w-full px-3 py-2 text-base rounded-xl border border-slate-200 focus:border-[#04326d] outline-none bg-white font-sans font-medium text-slate-800"
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
                    ].map((slot) => (
                      <option key={slot} value={slot}>
                        {formatSlotLabel(slot)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#001a4b] mb-1 font-sans">
                  Treatment / Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scaling & Polishing"
                  value={newPatient.reason}
                  onChange={(e) => setNewPatient({ ...newPatient, reason: e.target.value })}
                  className="w-full px-4 py-2.5 text-base rounded-xl border border-slate-200 focus:border-[#04326d] focus:ring-2 focus:ring-[#b2bed6]/30 outline-none font-sans font-medium text-slate-800"
                />
              </div>

              {creationSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 font-sans font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Appointment saved and scheduled successfully!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={creatingAppointment}
                className="w-full py-3.5 px-4 rounded-xl bg-[#04326d] hover:bg-[#001a4b] text-white font-semibold text-base font-sans shadow-soft transition-all active:scale-98 disabled:opacity-70 cursor-pointer"
              >
                {creatingAppointment ? "Saving..." : "Save Appointment"}
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: AI Assistant & Knowledge Base Manager */}
        {activeTab === "ai-knowledge" && <AIAssistantManager />}
      </main>
    </div>
  );
}
