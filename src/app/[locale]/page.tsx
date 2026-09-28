"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { WhyChooseUsSection } from "@/components/sections/WhyChooseUsSection";
import { DoctorSection } from "@/components/sections/DoctorSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { BookingModal } from "@/components/booking/BookingModal";

export default function HomePage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState<string | undefined>();
  const [bookingTime, setBookingTime] = useState<string | undefined>();

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleOpenBookingModal = (serviceName?: string, date?: string, time?: string) => {
    if (serviceName) setSelectedService(serviceName);
    if (date) setBookingDate(date);
    if (time) setBookingTime(time);
    setIsBookingModalOpen(true);
  };

  const handleSelectService = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsBookingModalOpen(true);
  };

  const handleBookWithDoctor = (date?: string, time?: string) => {
    handleOpenBookingModal("General Checkup & Consultation", date, time);
  };

  const handleResetService = () => {
    setSelectedService(null);
    setIsChatOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Sticky Header with both direct Booking Modal & AI Chat actions */}
      <Navbar onOpenChat={() => handleOpenBookingModal()} />

      {/* Main Content Sections */}
      <main className="flex-1">
        <HeroSection onOpenChat={() => handleOpenBookingModal()} />
        <ServicesSection onSelectService={handleSelectService} />
        <WhyChooseUsSection />
        <DoctorSection
          onOpenChat={handleOpenChat}
          onBookAppointment={handleBookWithDoctor}
        />
        <GallerySection />
        <TestimonialsSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Date & Time Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedService={selectedService}
        initialDate={bookingDate}
        initialTime={bookingTime}
        onSwitchToAiChat={() => {
          setIsBookingModalOpen(false);
          setIsChatOpen(true);
        }}
      />

      {/* Floating AI Chat Assistant */}
      <ChatWidget
        initialOpen={isChatOpen}
        selectedService={selectedService}
        onResetService={handleResetService}
        onOpenBookingModal={() => {
          setIsChatOpen(false);
          setIsBookingModalOpen(true);
        }}
      />
    </div>
  );
}
