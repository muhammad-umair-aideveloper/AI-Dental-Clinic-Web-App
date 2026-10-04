"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useAuth } from "./AuthProvider";
import { Lock, LogOut } from "lucide-react";

export function AuthButton() {
  const locale = useLocale();
  const { user, role, logout } = useAuth();

  // If staff/admin is authenticated, show staff portal link and logout
  if (user && role === "admin") {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/${locale}/admin-dashboard`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0F172A] bg-[#F6F8FA] hover:bg-[#E5EAF0] border border-[#E5EAF0] rounded-full transition-clinical shadow-xs"
        >
          <Lock className="w-3.5 h-3.5 text-[#2E9C89]" />
          <span>Staff Portal</span>
        </Link>

        <button
          onClick={logout}
          title="Sign Out"
          className="p-1.5 text-[#5B6B7F] hover:text-[#D64545] rounded-full hover:bg-[#F6F8FA] transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Patients do not have accounts. Staff can access via /admin/login.
  return null;
}
