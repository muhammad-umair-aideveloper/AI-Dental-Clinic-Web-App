"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function UserDashboardRedirect() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    // Patient accounts are not required. Redirect to homepage.
    router.replace(`/${locale}`);
  }, [router, locale]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F8FA] p-4 text-center">
      <div className="max-w-md bg-white rounded-2xl border border-[#E5EAF0] p-6 shadow-clinical space-y-3">
        <h2 className="text-base font-bold text-[#0F172A]">Redirecting to Lahore Dental Clinic...</h2>
        <p className="text-xs text-[#5B6B7F]">
          Patient accounts are no longer needed. All appointments, records, and reports are handled seamlessly via WhatsApp.
        </p>
      </div>
    </div>
  );
}
