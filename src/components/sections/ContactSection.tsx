"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Phone, Clock, MessageCircle, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export function ContactSection() {
  const t = useTranslations();
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", phone: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="bg-zinc-50 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#b2bed6] bg-white text-[#04326d] uppercase text-[10px] font-bold tracking-[0.15em]">
            {t("contact.badge")}
          </div>
          <h2 className="text-4xl font-extrabold text-[#001a4b] tracking-tight">
            {t("contact.title")}
          </h2>
          <p className="text-slate-500 text-lg">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 hover:border-[#04326d]/40 transition-colors">
              <MapPin className="w-6 h-6 text-[#04326d] mb-3" />
              <h4 className="font-bold text-[#001a4b] text-sm mb-1">{t("contact.info.addressTitle")}</h4>
              <p className="text-slate-500 text-sm">{t("common.address")}</p>
            </div>
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 hover:border-[#04326d]/40 transition-colors">
              <Clock className="w-6 h-6 text-[#04326d] mb-3" />
              <h4 className="font-bold text-[#001a4b] text-sm mb-1">{t("contact.info.timingsTitle")}</h4>
              <p className="text-slate-500 text-sm">{t("common.timings")}</p>
            </div>
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 hover:border-[#04326d]/40 transition-colors">
              <Phone className="w-6 h-6 text-[#04326d] mb-3" />
              <h4 className="font-bold text-[#001a4b] text-sm mb-1">{t("contact.info.phoneTitle")}</h4>
              <p className="text-slate-500 text-sm">{t("common.displayPhone")}</p>
            </div>
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 hover:border-[#04326d]/40 transition-colors">
              <MessageCircle className="w-6 h-6 text-[#04326d] mb-3" />
              <h4 className="font-bold text-[#001a4b] text-sm mb-1">{t("contact.info.whatsappTitle")}</h4>
              <a href={`https://wa.me/${t("common.whatsappNumber")}`} target="_blank" rel="noopener noreferrer" className="text-[#04326d] text-sm font-semibold hover:underline">
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-[#001a4b] mb-6 tracking-tight">
              {t("contact.formTitle")}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#001a4b] mb-1.5 uppercase tracking-wide">
                  {t("contact.nameLabel")} *
                </label>
                <input
                  type="text" required placeholder={t("contact.namePlaceholder")}
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#001a4b] focus:border-[#04326d] focus:ring-1 focus:ring-[#04326d]/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#001a4b] mb-1.5 uppercase tracking-wide">
                  {t("contact.phoneLabel")} *
                </label>
                <input
                  type="tel" required placeholder={t("contact.phonePlaceholder")}
                  value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#001a4b] focus:border-[#04326d] focus:ring-1 focus:ring-[#04326d]/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#001a4b] mb-1.5 uppercase tracking-wide">
                  {t("contact.messageLabel")}
                </label>
                <textarea
                  rows={4} placeholder={t("contact.messagePlaceholder")}
                  value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#001a4b] focus:border-[#04326d] focus:ring-1 focus:ring-[#04326d]/20 outline-none transition-all resize-none"
                />
              </div>
              
              {status === "success" && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4" />{t("contact.successMsg")}</div>}
              {status === "error" && <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-xl font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4" />{t("contact.errorMsg")}</div>}

              <button
                type="submit" disabled={loading}
                className="w-full rounded-full bg-[#001a4b] hover:bg-[#04326d] text-white font-semibold px-8 py-3 transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> {t("contact.submitBtn")}</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
