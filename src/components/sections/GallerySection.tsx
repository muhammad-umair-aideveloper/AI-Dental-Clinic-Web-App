"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

export function GallerySection() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<"all" | "transformations" | "clinic">("all");

  const galleryItems = [
    {
      category: "transformations",
      title: "Laser Teeth Whitening Transformation",
      beforeAfter: "6 Shades Lighter • 45 Minutes",
      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=700&q=80",
    },
    {
      category: "transformations",
      title: "Clear Aligners Smile Correction",
      beforeAfter: "8 Months Treatment • Zero Wires",
      image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=700&q=80",
    },
    {
      category: "transformations",
      title: "Permanent Bio-Titanium Implant",
      beforeAfter: "Molar Restored • Full Natural Function",
      image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=700&q=80",
    },
    {
      category: "clinic",
      title: "German Digital Operatory Suite",
      beforeAfter: "Low-Dose Digital HD Radiography",
      image: "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=700&q=80",
    },
    {
      category: "clinic",
      title: "Hospital-Grade Class-B Autoclave Room",
      beforeAfter: "100% Sterile Multi-Step Protocol",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=700&q=80",
    },
    {
      category: "clinic",
      title: "Comfortable Patient Consultation Lounge",
      beforeAfter: "Anxiety-Free Relaxing Environment",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=700&q=80",
    },
  ];

  const filteredItems =
    activeTab === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeTab);

  return (
    <section id="gallery" className="py-16 md:py-24 bg-[#b2bed6]/15 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b2bed6]/30 border border-[#b2bed6] text-[#001a4b] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#04326d]" />
            <span>{t("gallery.badge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#001a4b] tracking-tight">
            {t("gallery.title")}
          </h2>
          <p className="text-[#001a4b]/80 text-base sm:text-lg">
            {t("gallery.subtitle")}
          </p>

          {/* Filter Pills */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#04326d] text-white shadow-soft"
                  : "bg-white text-[#001a4b] hover:bg-[#b2bed6]/25 border border-[#b2bed6]"
              }`}
            >
              {t("gallery.tabs.all")}
            </button>
            <button
              onClick={() => setActiveTab("transformations")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === "transformations"
                  ? "bg-[#04326d] text-white shadow-soft"
                  : "bg-white text-[#001a4b] hover:bg-[#b2bed6]/25 border border-[#b2bed6]"
              }`}
            >
              {t("gallery.tabs.transformations")}
            </button>
            <button
              onClick={() => setActiveTab("clinic")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === "clinic"
                  ? "bg-[#04326d] text-white shadow-soft"
                  : "bg-white text-[#001a4b] hover:bg-[#b2bed6]/25 border border-[#b2bed6]"
              }`}
            >
              {t("gallery.tabs.clinic")}
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl overflow-hidden bg-white border border-[#b2bed6]/60 shadow-soft hover:shadow-card hover:border-[#04326d] transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001a4b]/90 via-transparent to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-[#04326d]/90 text-white mb-1.5">
                    {item.beforeAfter}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                    {item.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
