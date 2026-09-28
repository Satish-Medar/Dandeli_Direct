"use client";

import { Hero } from "@/components/Hero";
import { TrustBadges } from "@/components/TrustBadges";
import { BookingWizard } from "@/components/BookingWizard";
import { Testimonials } from "@/components/Testimonials";
import { AboutLocal } from "@/components/AboutLocal";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Hero />
      <TrustBadges />
      <BookingWizard />
      <Testimonials />
      <AboutLocal />
      <Footer />
    </main>
  );
}
