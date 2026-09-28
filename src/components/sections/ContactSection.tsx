"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

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
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-[#b2bed6]/15 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b2bed6]/30 border border-[#b2bed6] text-[#001a4b] text-xs font-bold">
            <span>{t("contact.badge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#001a4b] tracking-tight">
            {t("contact.title")}
          </h2>
          <p className="text-[#001a4b]/80 text-base sm:text-lg">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Clinic Contact Info & Google Map */}
          <div className="lg:col-span-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Address */}
              <div className="p-5 rounded-2xl bg-white border border-[#b2bed6] shadow-soft">
                <div className="w-10 h-10 rounded-xl bg-[#b2bed6]/25 text-[#04326d] flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#001a4b] mb-1">
                  {t("contact.info.addressTitle")}
                </h4>
                <p className="text-xs text-[#001a4b]/75 leading-relaxed">
                  {t("common.address")}
                </p>
              </div>

              {/* Working Hours */}
              <div className="p-5 rounded-2xl bg-white border border-[#b2bed6] shadow-soft">
                <div className="w-10 h-10 rounded-xl bg-[#b2bed6]/25 text-[#04326d] flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#001a4b] mb-1">
                  {t("contact.info.timingsTitle")}
                </h4>
                <p className="text-xs text-[#001a4b]/75 leading-relaxed">
                  {t("common.timings")}
                </p>
              </div>

              {/* Phone & Hotline */}
              <div className="p-5 rounded-2xl bg-white border border-[#b2bed6] shadow-soft">
                <div className="w-10 h-10 rounded-xl bg-[#b2bed6]/25 text-[#04326d] flex items-center justify-center mb-3">
                  <Phone className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#001a4b] mb-1">
                  {t("contact.info.phoneTitle")}
                </h4>
                <a
                  href={`tel:${t("common.phone")}`}
                  className="text-xs text-[#04326d] font-bold hover:underline block"
                >
                  {t("common.displayPhone")}
                </a>
              </div>

              {/* WhatsApp */}
              <div className="p-5 rounded-2xl bg-white border border-[#b2bed6] shadow-soft">
                <div className="w-10 h-10 rounded-xl bg-[#b2bed6]/25 text-[#04326d] flex items-center justify-center mb-3">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#001a4b] mb-1">
                  {t("contact.info.whatsappTitle")}
                </h4>
                <a
                  href={`https://wa.me/${t("common.whatsappNumber")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#04326d] font-bold hover:underline block"
                >
                  Chat on WhatsApp &rarr;
                </a>
              </div>
            </div>

            {/* Google Maps Embed for Gulberg III, Lahore */}
            <div className="rounded-2xl overflow-hidden border border-[#b2bed6] shadow-soft h-64 bg-slate-100">
              <iframe
                title="Lahore Dental Clinic Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13606.31427138356!2d74.34360675!3d31.508544!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3919045a05b38f87%3A0x6b77df34972e391b!2sGulberg%20III%2C%20Lahore%2C%20Punjab!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-7 sm:p-9 border border-[#b2bed6] shadow-card font-sans">
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#001a4b] mb-2 tracking-tight">
              {t("contact.formTitle")}
            </h3>
            <p className="text-sm text-[#001a4b]/70 mb-6 font-sans leading-relaxed">
              Leave your inquiry below and our dental care coordinators will respond promptly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#001a4b] mb-1.5 uppercase font-sans">
                  {t("contact.nameLabel")} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("contact.namePlaceholder")}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 text-base rounded-xl border border-[#b2bed6] focus:border-[#04326d] focus:ring-2 focus:ring-[#b2bed6]/40 outline-none transition-all font-sans font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#001a4b] mb-1.5 uppercase font-sans">
                  {t("contact.phoneLabel")} *
                </label>
                <input
                  type="tel"
                  required
                  placeholder={t("contact.phonePlaceholder")}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 text-base rounded-xl border border-[#b2bed6] focus:border-[#04326d] focus:ring-2 focus:ring-[#b2bed6]/40 outline-none transition-all font-sans font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#001a4b] mb-1.5 uppercase font-sans">
                  {t("contact.messageLabel")}
                </label>
                <textarea
                  rows={4}
                  placeholder={t("contact.messagePlaceholder")}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-4 py-3 text-base rounded-xl border border-[#b2bed6] focus:border-[#04326d] focus:ring-2 focus:ring-[#b2bed6]/40 outline-none transition-all resize-none font-sans font-medium text-slate-800"
                />
              </div>

              {status === "success" && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-sans font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t("contact.successMsg")}</span>
                </div>
              )}

              {status === "error" && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-sans font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{t("contact.errorMsg")}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#001a4b] to-[#04326d] hover:from-[#04326d] hover:to-[#001a4b] text-white font-semibold text-base font-sans shadow-soft transition-all active:scale-98 disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("contact.sending")}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t("contact.submitBtn")}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
