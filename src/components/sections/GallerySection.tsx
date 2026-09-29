"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function GallerySection() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<"all" | "transformations" | "clinic">("all");

  const galleryItems = [
    { category: "transformations", title: "Laser Teeth Whitening Transformation", beforeAfter: "6 Shades Lighter • 45 Minutes", image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=700&q=80" },
    { category: "transformations", title: "Clear Aligners Smile Correction", beforeAfter: "8 Months Treatment • Zero Wires", image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=700&q=80" },
    { category: "transformations", title: "Permanent Bio-Titanium Implant", beforeAfter: "Molar Restored • Full Natural Function", image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=700&q=80" },
    { category: "clinic", title: "German Digital Operatory Suite", beforeAfter: "Low-Dose Digital HD Radiography", image: "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=700&q=80" },
    { category: "clinic", title: "Hospital-Grade Class-B Autoclave Room", beforeAfter: "100% Sterile Multi-Step Protocol", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=700&q=80" },
    { category: "clinic", title: "Comfortable Patient Consultation Lounge", beforeAfter: "Anxiety-Free Relaxing Environment", image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=700&q=80" },
  ];

  const filteredItems = activeTab === "all" ? galleryItems : galleryItems.filter((item) => item.category === activeTab);

  return (
    <section id="gallery" className="bg-zinc-50 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#b2bed6] bg-white text-[#04326d] uppercase text-[10px] font-bold tracking-[0.15em]">
            {t("gallery.badge")}
          </div>
          <h2 className="text-4xl font-extrabold text-[#001a4b] tracking-tight">
            {t("gallery.title")}
          </h2>
          <p className="text-slate-500 text-lg">
            {t("gallery.subtitle")}
          </p>

          <div className="flex items-center justify-center gap-6 pt-4 border-b border-slate-200/60 pb-2">
            {(["all", "transformations", "clinic"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-bold pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab ? "border-[#04326d] text-[#001a4b]" : "border-transparent text-slate-500 hover:text-[#001a4b]"
                }`}
              >
                {t(`gallery.tabs.${tab}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item, idx) => (
            <div key={idx} className="rounded-2xl overflow-hidden relative group border border-slate-200/60 bg-white">
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#001a4b]/70 via-transparent to-transparent opacity-90" />
              
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold tracking-widest mb-2">
                  {item.beforeAfter}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
