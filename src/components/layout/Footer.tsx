import { useTranslations } from "next-intl";
import { Phone, Mail, MapPin, Clock, MessageCircle, ShieldCheck } from "lucide-react";
import { CLINIC_CONFIG } from "@/config/clinic";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-[#F6F8FA] text-[#5B6B7F] pt-16 pb-20 sm:pb-12 border-t border-[#E5EAF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Accreditation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white border border-[#E5EAF0] overflow-hidden p-0.5 shrink-0 flex items-center justify-center">
                <img
                  src="/images/logo.png"
                  alt="Lahore Dental Logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span className="font-bold text-lg text-[#0F172A] tracking-tight">
                {CLINIC_CONFIG.name}
              </span>
            </div>

            <p className="text-xs text-[#5B6B7F] leading-relaxed">
              {CLINIC_CONFIG.subheadline}
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-[#2E9C89]">
              <ShieldCheck className="w-4 h-4 text-[#2E9C89]" />
              <span className="font-semibold">{CLINIC_CONFIG.doctor.pmdcNumber}</span>
            </div>

            <div className="flex gap-2.5 pt-2">
              <a
                href={`https://wa.me/${CLINIC_CONFIG.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white border border-[#E5EAF0] hover:border-[#4FB8A6] text-[#0F172A] hover:text-[#2E9C89] flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
              <a
                href={`tel:${CLINIC_CONFIG.phone}`}
                className="w-8 h-8 rounded-full bg-white border border-[#E5EAF0] hover:border-[#4FB8A6] text-[#0F172A] hover:text-[#2E9C89] flex items-center justify-center transition-colors"
                aria-label="Phone"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
              <a
                href={`mailto:${CLINIC_CONFIG.email}`}
                className="w-8 h-8 rounded-full bg-white border border-[#E5EAF0] hover:border-[#4FB8A6] text-[#0F172A] hover:text-[#2E9C89] flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Treatments List */}
          <div>
            <h3 className="text-[#0F172A] text-xs uppercase tracking-wider font-bold mb-4">
              {t("footer.servicesTitle")}
            </h3>
            <ul className="space-y-2.5 text-xs">
              {CLINIC_CONFIG.treatments.map((t) => (
                <li key={t.id}>
                  <a href="#treatments" className="text-[#5B6B7F] hover:text-[#0F172A] transition-colors">
                    {t.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Section Links */}
          <div>
            <h3 className="text-[#0F172A] text-xs uppercase tracking-wider font-bold mb-4">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#treatments" className="text-[#5B6B7F] hover:text-[#0F172A] transition-colors">
                  Treatments & Fees
                </a>
              </li>
              <li>
                <a href="#before-after" className="text-[#5B6B7F] hover:text-[#0F172A] transition-colors">
                  Clinical Results
                </a>
              </li>
              <li>
                <a href="#doctor" className="text-[#5B6B7F] hover:text-[#0F172A] transition-colors">
                  Doctor Profile & Safety
                </a>
              </li>
              <li>
                <a href="#location" className="text-[#5B6B7F] hover:text-[#0F172A] transition-colors">
                  Location & Hours
                </a>
              </li>
            </ul>
          </div>

          {/* Clinical Timings & Emergency */}
          <div>
            <h3 className="text-[#0F172A] text-xs uppercase tracking-wider font-bold mb-4">
              {t("footer.hoursTitle")}
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-[#2E9C89] shrink-0 mt-0.5" />
                <span>Mon – Sat: 11:00 AM – 09:00 PM</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#2E9C89] shrink-0 mt-0.5" />
                <span>Gulberg III, Lahore, Pakistan</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E5EAF0] mt-2">
                <span className="text-[10px] uppercase font-bold text-[#D64545] block mb-0.5">
                  Emergency Toothache Hotline
                </span>
                <a
                  href={`tel:${CLINIC_CONFIG.emergencyPhone}`}
                  className="font-bold text-[#0F172A] hover:text-[#D64545] text-xs flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-[#D64545]" />
                  {CLINIC_CONFIG.emergencyPhone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#E5EAF0] space-y-3">
          <p className="text-[11px] text-[#5B6B7F] text-center leading-relaxed max-w-3xl mx-auto">
            {t("footer.disclaimer")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#5B6B7F] gap-2 pt-2">
            <p>© {new Date().getFullYear()} Lahore Dental Clinic. All clinical rights reserved.</p>
            <div className="flex items-center gap-3">
              <a
                href="/en/admin-dashboard"
                className="text-[#5B6B7F] hover:text-[#0F172A] font-medium"
              >
                Staff Portal
              </a>
              <span>·</span>
              <span>Gulberg III, Lahore</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
