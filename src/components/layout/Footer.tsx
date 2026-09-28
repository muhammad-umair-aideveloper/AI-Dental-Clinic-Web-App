import { useTranslations } from "next-intl";
import { Phone, Mail, MapPin, Clock, MessageCircle, Heart } from "lucide-react";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-[#001a4b] text-[#b2bed6] pt-16 pb-12 border-t border-[#04326d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#04326d] to-[#b2bed6] flex items-center justify-center text-white shadow-soft">
                <span className="text-xl">🦷</span>
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                {t("common.clinicName")}
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${t("common.whatsappNumber")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#04326d] hover:bg-[#b2bed6] text-[#b2bed6] hover:text-[#001a4b] flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={`tel:${t("common.phone")}`}
                className="w-9 h-9 rounded-full bg-[#04326d] hover:bg-[#b2bed6] text-[#b2bed6] hover:text-[#001a4b] flex items-center justify-center transition-colors"
                aria-label="Phone"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="mailto:info@lahoredental.pk"
                className="w-9 h-9 rounded-full bg-[#04326d] hover:bg-[#b2bed6] text-[#b2bed6] hover:text-[#001a4b] flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Treatments Col */}
          <div>
            <h3 className="text-white !text-white font-semibold text-base mb-4 tracking-wide">
              {t("footer.servicesTitle")}
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-200">
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  {t("services.items.checkup.title")}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  {t("services.items.scaling.title")}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  {t("services.items.rootCanal.title")}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  {t("services.items.braces.title")}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  {t("services.items.implants.title")}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  {t("services.items.whitening.title")}
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white !text-white font-semibold text-base mb-4 tracking-wide">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-200">
              <li>
                <a href="#why-us" className="hover:text-white transition-colors">
                  {t("nav.whyUs")}
                </a>
              </li>
              <li>
                <a href="#doctor" className="hover:text-white transition-colors">
                  {t("nav.doctor")}
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-white transition-colors">
                  {t("nav.gallery")}
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-white transition-colors">
                  {t("nav.testimonials")}
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  {t("nav.contact")}
                </a>
              </li>
            </ul>
          </div>

          {/* Working Hours & Emergency */}
          <div>
            <h3 className="text-white !text-white font-semibold text-base mb-4 tracking-wide">
              {t("footer.hoursTitle")}
            </h3>
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-sky-200 shrink-0 mt-0.5" />
                <span>{t("common.timings")}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-200 shrink-0 mt-0.5" />
                <span>{t("common.address")}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#04326d]/80 border border-[#b2bed6]/40 mt-3">
                <span className="text-xs uppercase font-bold text-sky-200 block mb-1">
                  24/7 Dental Emergency
                </span>
                <a
                  href={`tel:${t("common.emergencyPhone")}`}
                  className="text-white font-semibold text-sm hover:text-sky-200 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-rose-300" />
                  {t("common.emergencyPhone")}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#04326d] space-y-4">
          <p className="text-xs text-slate-300 text-center leading-relaxed max-w-4xl mx-auto">
            {t("footer.disclaimer")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-200 pt-2 gap-2">
            <p>
              © {new Date().getFullYear()} {t("common.clinicName")}. {t("footer.rights")}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="/en/admin-dashboard"
                className="text-slate-200 hover:text-white font-medium inline-flex items-center gap-1"
              >
                <span>🔐 Clinic Staff & Owner Portal</span>
              </a>
              <span className="text-[#04326d]">•</span>
              <p className="flex items-center gap-1">
                Crafted with <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" /> in Lahore
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
