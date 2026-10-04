"use client";

import { useLocale } from "next-intl";
import { CLINIC_CONFIG, ClinicTreatment } from "@/config/clinic";
import { ArrowRight, CheckCircle2, Clock, Calendar } from "lucide-react";

interface ServicesSectionProps {
  onSelectService?: (serviceName: string) => void;
}

export function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const locale = useLocale();
  const isUrdu = locale === "ur";

  return (
    <section id="treatments" className="py-16 md:py-24 bg-white border-b border-[#E5EAF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F8FA] border border-[#E5EAF0] text-[#2E9C89] text-xs font-semibold">
            <span>{isUrdu ? "شفاف کلینیکل فیس" : "Transparent Starting Fees"}</span>
          </div>
          <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F172A] tracking-tight">
            {isUrdu ? "علاجات اور شفاف قیمتیں" : "Dental Treatments & Pricing"}
          </h2>
          <p className="text-[#5B6B7F] text-sm sm:text-base max-w-xl mx-auto">
            {isUrdu
              ? "کوئی پوشیدہ فیس نہیں۔ تمام قیمتیں مشاورت اور جانچ کے بعد واضح کی جاتی ہیں۔"
              : "Clear starting prices with zero hidden charges. Single source of truth across our reception, chatbot, and booking."}
          </p>
          <p className="text-xs text-[#2E9C89] font-medium bg-[#E8F7F4] inline-block px-3 py-1 rounded-full border border-[#C2ECE4]">
            {isUrdu ? "حتمی فیس کا تعین معائنے اور ایکسرے کے بعد کیا جاتا ہے۔" : "Final cost is confirmed after comprehensive examination."}
          </p>
        </div>

        {/* 4 Core Clinical Treatment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CLINIC_CONFIG.treatments.map((item: ClinicTreatment) => {
            const formattedPrice = `PKR ${item.startingPricePkr.toLocaleString()}`;

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-[#F6F8FA] border border-[#E5EAF0] p-6 flex flex-col justify-between hover:bg-white hover:border-[#4FB8A6] hover:shadow-clinical transition-clinical"
              >
                <div>
                  {/* Category & Duration */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5B6B7F] bg-white px-2.5 py-1 rounded-md border border-[#E5EAF0]">
                      <Clock className="w-3 h-3 text-[#2E9C89]" />
                      <span>{isUrdu ? item.durationUr : item.duration}</span>
                    </div>

                    <span className="text-[10px] font-bold text-[#2E9C89] uppercase tracking-wider bg-[#E8F7F4] px-2 py-0.5 rounded-full border border-[#C2ECE4]">
                      {isUrdu ? "پرنسپل کیئر" : "Specialist"}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-sans text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#2E9C89] transition-colors leading-snug">
                    {isUrdu ? item.nameUr : item.name}
                  </h3>
                  <p className="text-xs text-[#5B6B7F] leading-relaxed mb-6 font-normal">
                    {isUrdu ? item.descriptionUr : item.description}
                  </p>
                </div>

                {/* Price Box & Action */}
                <div className="pt-4 border-t border-[#E5EAF0] space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5B6B7F] tracking-wider block">
                      {isUrdu ? "ابتدائی فیس" : "Starting from"}
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                        {formattedPrice}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#5B6B7F] mt-1 leading-tight">
                      {isUrdu ? item.priceNoteUr : item.priceNote}
                    </p>
                  </div>

                  {/* Book this treatment button */}
                  <button
                    onClick={() => onSelectService?.(isUrdu ? item.nameUr : item.name)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#0F172A] hover:text-white border border-[#E5EAF0] hover:border-[#0F172A] transition-clinical active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#2E9C89]" />
                    <span>{isUrdu ? "یہ علاج بک کریں" : "Book This Treatment"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
