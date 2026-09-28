"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "./AuthProvider";
import {
  User,
  Calendar,
  LogOut,
  LogIn,
  X,
  Shield,
  Loader2,
  Lock,
  Mail,
  Phone,
} from "lucide-react";

export function AuthButton() {
  const locale = useLocale();
  const router = useRouter();
  const { user, role, login, signup, logout, isLoading } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setFormError(null);
  };

  const handleOpenModal = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      if (authMode === "signin") {
        const res = await login(email, password);
        if (res.success && res.user) {
          setModalOpen(false);
          resetForm();
          // Role-based redirect
          if (res.user.role === "admin") {
            router.push(`/${locale}/admin-dashboard`);
          } else {
            router.push(`/${locale}/user-dashboard`);
          }
        } else {
          setFormError(res.error || "Invalid email or password.");
        }
      } else {
        // Sign Up (Role is automatically assigned as "user" on backend)
        const res = await signup({
          name: name.trim() || email.split("@")[0],
          email,
          phone,
          password,
        });
        if (res.success && res.user) {
          setModalOpen(false);
          resetForm();
          // New signups are always normal users
          router.push(`/${locale}/user-dashboard`);
        } else {
          setFormError(res.error || "Failed to create account.");
        }
      }
    } catch (err: any) {
      setFormError(err?.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}`);
  };

  // Authenticated State View
  if (user) {
    const isAdmin = role === "admin";
    const dashboardHref = isAdmin
      ? `/${locale}/admin-dashboard`
      : `/${locale}/user-dashboard`;
    const label = isAdmin ? "Admin Portal" : "My Dashboard";

    return (
      <div className="flex items-center gap-2">
        <Link
          href={dashboardHref}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all border ${
            isAdmin
              ? "text-[#001a4b] bg-[#b2bed6]/25 hover:bg-[#b2bed6]/40 border-[#04326d]/30"
              : "text-[#04326d] bg-sky-50 hover:bg-sky-100 border-sky-200"
          }`}
        >
          {isAdmin ? (
            <Shield className="w-3.5 h-3.5 text-[#04326d]" />
          ) : (
            <Calendar className="w-3.5 h-3.5 text-[#04326d]" />
          )}
          <span>{label}</span>
        </Link>

        <div className="flex items-center gap-1.5 pl-1">
          <div
            className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#001a4b] to-[#04326d] text-white font-bold text-xs flex items-center justify-center shadow-xs"
            title={`${user.name} (${user.role})`}
          >
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Guest State View (Sign In & Sign Up buttons)
  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleOpenModal("signin")}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-all shadow-xs cursor-pointer active:scale-95 font-sans"
        >
          <LogIn className="w-3.5 h-3.5 text-[#04326d]" />
          <span>Sign In</span>
        </button>

        <button
          onClick={() => handleOpenModal("signup")}
          className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#04326d] hover:bg-[#001a4b] rounded-full transition-all cursor-pointer shadow-soft font-sans"
        >
          <span>Sign Up</span>
        </button>
      </div>

      {/* Real Auth Modal (Sign In / Sign Up) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-sky-100 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🦷</span>
                <h3 className="font-heading font-bold text-[#001a4b] text-base">
                  {authMode === "signin" ? "Sign In to Lahore Dental" : "Create Patient Account"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setFormError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authMode === "signin"
                    ? "bg-white text-[#001a4b] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setFormError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authMode === "signup"
                    ? "bg-white text-[#001a4b] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sign Up
              </button>
            </div>

            <p className="text-xs text-slate-500 font-sans leading-relaxed">
              {authMode === "signin"
                ? "Sign in to access your appointments, medical history, and clinical records."
                : "Register in seconds to manage your appointments and communicate with our dentists."}
            </p>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium font-sans">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {authMode === "signup" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 font-sans">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tariq Mahmood"
                      className="w-full pl-9 pr-3 py-2 text-base rounded-xl border border-slate-200 focus:border-[#04326d] outline-none font-sans font-medium text-slate-800"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 font-sans">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={authMode === "signin" ? "text" : "email"}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={authMode === "signin" ? "user@example.com or admin" : "name@example.com"}
                    className="w-full pl-9 pr-3 py-2 text-base rounded-xl border border-slate-200 focus:border-[#04326d] outline-none font-sans font-medium text-slate-800"
                  />
                </div>
              </div>

              {authMode === "signup" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 font-sans">
                    Phone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="03001234567"
                      className="w-full pl-9 pr-3 py-2 text-base rounded-xl border border-slate-200 focus:border-[#04326d] outline-none font-sans font-medium text-slate-800"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 font-sans">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-base rounded-xl border border-slate-200 focus:border-[#04326d] outline-none font-sans font-medium text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#04326d] hover:bg-[#001a4b] text-white font-bold text-base shadow-soft transition-all cursor-pointer flex items-center justify-center gap-2 font-sans disabled:opacity-70 mt-2"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>
                    {authMode === "signin" ? "Sign In & Continue" : "Create Account"}
                  </span>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Reminder */}
            {authMode === "signin" && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-0.5 font-sans">
                <span className="font-bold text-slate-800 block">Available Accounts:</span>
                <div>
                  Admin: <code className="text-[#04326d] font-bold">admin</code> / <code className="text-[#04326d] font-bold">admin123</code>
                </div>
                <div>
                  Patient: <code className="text-[#04326d] font-bold">patient@lahoredental.pk</code> / <code className="text-[#04326d] font-bold">patient123</code>
                </div>
              </div>
            )}

            <div className="pt-2 text-[10px] text-slate-400 text-center border-t border-slate-100 font-sans">
              Secure PBKDF2 Encrypted Authentication & Lahore Dental
            </div>
          </div>
        </div>
      )}
    </>
  );
}
