import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TickerTape from "@/components/TickerTape";
import Features from "@/components/Features";
import Workflow from "@/components/Workflow";
import Testimonials from "@/components/Testimonials";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex-1 w-full bg-background text-text-primary font-body relative overflow-x-clip">

      {/* Navigation */}
      <Navbar />

      {/* Hero Header */}
      <Hero />

      {/* Ticker Tape Marquee */}
      <TickerTape />

      {/* Core Features */}
      <Features />

      {/* Workflow Pipeline */}
      <Workflow />

      {/* Social Proof */}
      <Testimonials />

      {/* FAQs */}
      <Faq />

      {/* Site Footer */}
      <Footer />

    </div>
  );
}
