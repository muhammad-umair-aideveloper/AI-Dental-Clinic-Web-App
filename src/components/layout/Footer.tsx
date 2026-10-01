import { useTranslations } from "next-intl";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-[#001a4b] pt-16 pb-12 border-t border-[#04326d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-white font-bold text-xl tracking-tight">
              <div className="w-8 h-8 rounded-full bg-white overflow-hidden p-0.5 shrink-0 flex items-center justify-center">
                <img src="/images/logo.png" alt="Lahore Dental Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <span>{t("common.clinicName")}</span>
            </div>
            <p className="text-[#b2bed6]/90 text-sm leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="flex gap-3 pt-2">
              <a href={`https://wa.me/${t("common.whatsappNumber")}`} className="w-8 h-8 rounded-full border border-[#04326d] hover:border-[#b2bed6] text-[#b2bed6] hover:text-white flex items-center justify-center transition-all">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href={`tel:${t("common.phone")}`} className="w-8 h-8 rounded-full border border-[#04326d] hover:border-[#b2bed6] text-[#b2bed6] hover:text-white flex items-center justify-center transition-all">
                <Phone className="w-4 h-4" />
              </a>
              <a href="mailto:info@lahoredental.pk" className="w-8 h-8 rounded-full border border-[#04326d] hover:border-[#b2bed6] text-[#b2bed6] hover:text-white flex items-center justify-center transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white/60 text-[10px] uppercase tracking-[0.15em] font-bold mb-4">{t("footer.servicesTitle")}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#services" className="text-[#b2bed6] hover:text-white transition-colors">{t("services.items.checkup.title")}</a></li>
              <li><a href="#services" className="text-[#b2bed6] hover:text-white transition-colors">{t("services.items.scaling.title")}</a></li>
              <li><a href="#services" className="text-[#b2bed6] hover:text-white transition-colors">{t("services.items.rootCanal.title")}</a></li>
              <li><a href="#services" className="text-[#b2bed6] hover:text-white transition-colors">{t("services.items.braces.title")}</a></li>
              <li><a href="#services" className="text-[#b2bed6] hover:text-white transition-colors">{t("services.items.implants.title")}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white/60 text-[10px] uppercase tracking-[0.15em] font-bold mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#why-us" className="text-[#b2bed6] hover:text-white transition-colors">{t("nav.whyUs")}</a></li>
              <li><a href="#doctor" className="text-[#b2bed6] hover:text-white transition-colors">{t("nav.doctor")}</a></li>
              <li><a href="#gallery" className="text-[#b2bed6] hover:text-white transition-colors">{t("nav.gallery")}</a></li>
              <li><a href="#testimonials" className="text-[#b2bed6] hover:text-white transition-colors">{t("nav.testimonials")}</a></li>
              <li><a href="#contact" className="text-[#b2bed6] hover:text-white transition-colors">{t("nav.contact")}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white/60 text-[10px] uppercase tracking-[0.15em] font-bold mb-4">{t("footer.hoursTitle")}</h3>
            <div className="space-y-3 text-sm text-[#b2bed6]">
              <div className="flex items-start gap-2.5"><Clock className="w-4 h-4 mt-0.5" /> <span>{t("common.timings")}</span></div>
              <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 mt-0.5" /> <span>{t("common.address")}</span></div>
              <div className="bg-[#04326d]/40 border border-[#04326d] rounded-xl p-3 mt-4">
                <span className="text-[10px] uppercase font-bold text-white mb-1 block">Emergency</span>
                <a href={`tel:${t("common.emergencyPhone")}`} className="text-white font-semibold hover:text-sky-200 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> {t("common.emergencyPhone")}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#04326d]">
          <div className="flex flex-col sm:flex-row items-center justify-between text-[#b2bed6]/50 text-xs gap-4">
            <p>© {new Date().getFullYear()} {t("common.clinicName")}. {t("footer.rights")}</p>
            <p>{t("footer.disclaimer")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
