"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { DoctorSection } from "@/components/sections/DoctorSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { Footer } from "@/components/layout/Footer";
import { MobileStickyBar } from "@/components/layout/MobileStickyBar";
import { BookingModal } from "@/components/booking/BookingModal";
import { ChatWidget } from "@/components/chat/ChatWidget";

export default function HomePage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleOpenBooking = (serviceName?: string) => {
    if (serviceName) setSelectedService(serviceName);
    setIsBookingModalOpen(true);
  };

  const handleSelectService = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F172A]">
      {/* 1. Sticky Navigation Header */}
      <Navbar onOpenBooking={() => handleOpenBooking()} />

      {/* 2. Public Sections in Strict Skill Order */}
      <main className="flex-1">
        {/* Section 1: Hero */}
        <HeroSection onOpenBooking={() => handleOpenBooking()} />

        {/* Section 2: Before / After Slider */}
        <BeforeAfterSection onSelectTreatment={handleSelectService} />

        {/* Section 3: Treatments & Pricing */}
        <ServicesSection onSelectService={handleSelectService} />

        {/* Section 4: Doctor & Trust */}
        <DoctorSection onOpenBooking={() => handleOpenBooking()} />

        {/* Section 5: Location & Timings */}
        <ContactSection onOpenBooking={() => handleOpenBooking()} />
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* 4. Sticky Mobile Bottom Bar (Book + WhatsApp) */}
      <MobileStickyBar onOpenBooking={() => handleOpenBooking()} />

      {/* 5. Frictionless Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedService={selectedService}
      />

      {/* 6. Contextual AI Chat Assistant */}
      <ChatWidget
        initialOpen={isChatOpen}
        selectedService={selectedService}
        onResetService={() => setSelectedService(null)}
        onOpenBookingModal={() => {
          setIsChatOpen(false);
          setIsBookingModalOpen(true);
        }}
      />
    </div>
  );
}
