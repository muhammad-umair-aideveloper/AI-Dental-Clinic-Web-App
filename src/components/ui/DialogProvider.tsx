"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  HelpCircle,
  Loader2,
} from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
}

export interface AlertOptions {
  title: string;
  message: string;
  buttonText?: string;
  type?: "info" | "success" | "warning" | "error";
}

interface DialogContextValue {
  showToast: (options: ToastOptions | string) => string;
  dismissToast: (id: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions | string) => Promise<void>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return ctx;
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  // -------------------------------------------------------------
  // TOAST NOTIFICATIONS STATE
  // -------------------------------------------------------------
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      type: ToastType;
      title?: string;
      message: string;
    }>
  >([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (opts: ToastOptions | string) => {
      const options: ToastOptions =
        typeof opts === "string" ? { message: opts, type: "info" } : opts;
      const id = options.id || Math.random().toString(36).substring(2, 9);
      const type = options.type || "info";
      const duration = options.duration ?? 4500;

      setToasts((prev) => [
        ...prev,
        {
          id,
          type,
          title: options.title,
          message: options.message,
        },
      ]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  // -------------------------------------------------------------
  // CONFIRM MODAL STATE
  // -------------------------------------------------------------
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: "danger" | "warning" | "info" | "success";
    resolve: (val: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmModal({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        type: options.type || "danger",
        resolve,
      });
    });
  }, []);

  const handleConfirmAction = (confirmed: boolean) => {
    if (confirmModal) {
      confirmModal.resolve(confirmed);
      setConfirmModal(null);
    }
  };

  // -------------------------------------------------------------
  // ALERT MODAL STATE
  // -------------------------------------------------------------
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    buttonText: string;
    type: "info" | "success" | "warning" | "error";
    resolve: () => void;
  } | null>(null);

  const alert = useCallback((opts: AlertOptions | string): Promise<void> => {
    const options: AlertOptions =
      typeof opts === "string"
        ? { title: "Notice", message: opts, type: "info" }
        : opts;

    return new Promise((resolve) => {
      setAlertModal({
        isOpen: true,
        title: options.title || "Notice",
        message: options.message,
        buttonText: options.buttonText || "Understood",
        type: options.type || "info",
        resolve,
      });
    });
  }, []);

  const handleAlertClose = () => {
    if (alertModal) {
      alertModal.resolve();
      setAlertModal(null);
    }
  };

  return (
    <DialogContext.Provider
      value={{
        showToast,
        dismissToast,
        confirm,
        alert,
      }}
    >
      {children}

      {/* ========================================================= */}
      {/* 1. FLOATING TOAST CONTAINER (Top Right, Non-blocking)       */}
      {/* ========================================================= */}
      <div
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              icon: CheckCircle2,
              iconColor: "text-emerald-500",
              badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
              barColor: "bg-emerald-500",
            },
            error: {
              icon: XCircle,
              iconColor: "text-rose-500",
              badgeBg: "bg-rose-50 text-rose-700 border-rose-200/80",
              barColor: "bg-rose-500",
            },
            warning: {
              icon: AlertTriangle,
              iconColor: "text-amber-500",
              badgeBg: "bg-amber-50 text-amber-800 border-amber-200/80",
              barColor: "bg-amber-500",
            },
            info: {
              icon: Info,
              iconColor: "text-[#544BB9]",
              badgeBg: "bg-[#EEF1F8] text-[#544BB9] border-indigo-200/80",
              barColor: "bg-[#544BB9]",
            },
          }[toast.type];

          const IconComponent = typeConfig.icon;

          return (
            <div
              key={toast.id}
              className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-[0_16px_36px_rgba(30,41,59,0.14)] p-4 flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-4 relative overflow-hidden"
            >
              {/* Left accent stripe */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${typeConfig.barColor}`}
              />

              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${typeConfig.badgeBg}`}
              >
                <IconComponent className={`w-4 h-4 ${typeConfig.iconColor}`} />
              </div>

              <div className="flex-1 min-w-0 pr-1">
                {toast.title && (
                  <h4 className="text-xs font-bold text-[#1E2640] mb-0.5">
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 2. CUSTOM CONFIRMATION MODAL                               */}
      {/* ========================================================= */}
      {confirmModal?.isOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_24px_60px_rgba(15,23,42,0.2)] max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            {/* Header Icon & Title */}
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  confirmModal.type === "danger"
                    ? "bg-rose-50 text-rose-600 border-rose-200"
                    : confirmModal.type === "warning"
                    ? "bg-amber-50 text-amber-600 border-amber-200"
                    : confirmModal.type === "success"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-indigo-50 text-[#544BB9] border-indigo-200"
                }`}
              >
                {confirmModal.type === "danger" ? (
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                ) : confirmModal.type === "warning" ? (
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                ) : confirmModal.type === "success" ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : (
                  <HelpCircle className="w-6 h-6 text-[#544BB9]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#1E2640] tracking-tight">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleConfirmAction(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                {confirmModal.cancelText}
              </button>

              <button
                type="button"
                onClick={() => handleConfirmAction(true)}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-transform active:scale-95 cursor-pointer ${
                  confirmModal.type === "danger"
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/25"
                    : confirmModal.type === "warning"
                    ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/25"
                    : confirmModal.type === "success"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25"
                    : "bg-[#544BB9] hover:bg-[#433A9B] shadow-indigo-600/25"
                }`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. CUSTOM ALERT MODAL                                      */}
      {/* ========================================================= */}
      {alertModal?.isOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_24px_60px_rgba(15,23,42,0.2)] max-w-sm w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                  alertModal.type === "error"
                    ? "bg-rose-50 text-rose-600 border-rose-200"
                    : alertModal.type === "warning"
                    ? "bg-amber-50 text-amber-600 border-amber-200"
                    : alertModal.type === "success"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-indigo-50 text-[#544BB9] border-indigo-200"
                }`}
              >
                {alertModal.type === "error" ? (
                  <XCircle className="w-5 h-5 text-rose-600" />
                ) : alertModal.type === "warning" ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                ) : alertModal.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Info className="w-5 h-5 text-[#544BB9]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#1E2640]">
                  {alertModal.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {alertModal.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleAlertClose}
                className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {alertModal.buttonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
