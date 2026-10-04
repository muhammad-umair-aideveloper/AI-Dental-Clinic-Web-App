"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Lock, Mail, AlertCircle, Loader2, ArrowRight } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";

export default function StaffLoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your staff email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await login(email.trim(), password);

      if (!res.success) {
        setError(res.error || "Invalid staff credentials.");
        setLoading(false);
      } else {
        // Full navigation ensures AuthProvider and middleware session are completely synchronized
        window.location.href = `/${locale}/admin-dashboard`;
      }
    } catch (err: any) {
      setError(err?.message || "Network error occurred. Please check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5EAF0] p-8 shadow-clinical space-y-6">
        {/* Brand / Portal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#F6F8FA] border border-[#E5EAF0] mx-auto flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#2E9C89]" />
          </div>
          <h1 className="font-sans text-xl font-bold text-[#0F172A] tracking-tight">
            Clinic Staff Access
          </h1>
          <p className="text-xs text-[#5B6B7F]">
            Lahore Dental Clinic · Reception & Surgeon Management Portal
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
              Staff Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5B6B7F] absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@lahoredental.pk"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5EAF0] text-xs text-[#0F172A] focus:outline-none focus:border-[#4FB8A6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5B6B7F] absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5EAF0] text-xs text-[#0F172A] focus:outline-none focus:border-[#4FB8A6]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#0F172A] hover:bg-[#2E9C89] text-white font-semibold text-xs transition-clinical disabled:opacity-50 cursor-pointer shadow-sm mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#4FB8A6]" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#4FB8A6]" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5EAF0] text-center">
          <p className="text-[11px] text-[#5B6B7F]">
            Patients do not require login. All booking confirmations and clinical records are delivered via verified WhatsApp links.
          </p>
        </div>
      </div>
    </div>
  );
}
