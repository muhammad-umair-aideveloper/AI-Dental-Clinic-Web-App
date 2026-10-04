"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  ShieldCheck,
  Clock,
  Eye,
  FileText,
  AlertTriangle,
  Lock,
  Download,
  CheckCircle,
} from "lucide-react";

interface SecureData {
  patient: {
    name: string;
    phone: string;
    notes: string;
    xrays: Array<{
      id: string;
      title: string;
      category: string;
      date: string;
      url: string;
      notes?: string;
    }>;
  };
  metadata: {
    expiresAt: string;
    viewsLeft: number;
    createdAt: string;
  };
}

export default function SecureRecordViewPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SecureData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedXRay, setSelectedXRay] = useState<number>(0);

  useEffect(() => {
    if (!token) return;

    const fetchRecord = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/view/${token}`);
        const json = await res.json();

        if (res.ok && json.success) {
          setData(json);
        } else {
          setError(json.error || "Unable to access secure record.");
        }
      } catch (err: any) {
        setError(err.message || "Network error loading record.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-base font-semibold text-slate-900">Verifying Secure Access Token...</h2>
          <p className="text-xs text-slate-500 mt-1">Decrypting PACS scans from Lahore Dental</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-6">{error || "This document link is invalid or expired."}</p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-left">
            Need this record? Please contact Lahore Dental reception on WhatsApp at{" "}
            <a href="https://wa.me/923001234567" className="text-emerald-600 font-semibold underline">
              +92 300 1234567
            </a>{" "}
            to issue a fresh secure link.
          </div>
        </div>
      </div>
    );
  }

  const { patient, metadata } = data;
  const activeScan = patient.xrays[selectedXRay];
  const expiresDate = new Date(metadata.expiresAt);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Security & Access Banner */}
        <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900">Lahore Dental • Patient Digital PACS</h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle className="w-3 h-3" /> Verified Secure Link
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Patient: <strong className="text-slate-800">{patient.name}</strong> ({patient.phone})
              </p>
            </div>
          </div>

          {/* Limits pills */}
          <div className="flex items-center gap-3 text-xs text-slate-600 self-end sm:self-center">
            <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Expires {expiresDate.toLocaleDateString()} {expiresDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 font-mono">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              {metadata.viewsLeft} view{metadata.viewsLeft === 1 ? "" : "s"} left
            </span>
          </div>
        </div>

        {/* Scan Viewer Card */}
        {patient.xrays.length > 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            {/* Scans Selector Bar if multiple */}
            {patient.xrays.length > 1 && (
              <div className="flex border-b border-slate-200 bg-slate-50/60 p-2 gap-2 overflow-x-auto">
                {patient.xrays.map((xr, idx) => (
                  <button
                    key={xr.id}
                    onClick={() => setSelectedXRay(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedXRay === idx
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {xr.category}: {xr.title}
                  </button>
                ))}
              </div>
            )}

            {/* Displayed Image Viewer */}
            <div className="p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[440px] relative">
              {activeScan?.url ? (
                <div className="relative w-full max-w-2xl aspect-[16/9] rounded-lg overflow-hidden border border-slate-800">
                  <Image
                    src={activeScan.url}
                    alt={activeScan.title}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <p className="text-slate-400 text-xs">Scan file preview unavailable</p>
              )}
            </div>

            {/* Scan Metadata Footer */}
            {activeScan && (
              <div className="p-4 sm:p-6 border-t border-slate-200 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {activeScan.category}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-1">{activeScan.title}</h2>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Date: {activeScan.date}</span>
                </div>
                {activeScan.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
                    <strong className="text-slate-800">Doctor&apos;s Radiological Notes:</strong> {activeScan.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No radiographic scans currently attached</h3>
            <p className="text-xs text-slate-500 mt-1">Clinical notes and examination records are kept on file.</p>
          </div>
        )}

        {/* Clinical Notes Card */}
        {patient.notes && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              Treatment Summary &amp; Recommendations
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{patient.notes}</p>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 py-4">
          Lahore Dental • Plaza 42-B, Main Boulevard, Gulberg III, Lahore • PMDC Registered
        </div>
      </div>
    </div>
  );
}
