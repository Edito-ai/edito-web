import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Playground from "@/components/Playground";
import Features from "@/components/Features";
import Workflow from "@/components/Workflow";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import Faq from "@/components/Faq";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex-1 w-full bg-background text-zinc-100 font-sans selection:bg-purple-500/30 selection:text-purple-200 relative overflow-x-clip">
      
      {/* Background Neon Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-[20%] w-[600px] h-[600px] bg-purple-950/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <Navbar />

      {/* Hero Header */}
      <Hero />

      {/* Logo Grid banner */}
      <section className="border-y border-zinc-800/40 bg-zinc-950/20 py-10 w-full">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase mb-6">
            TRUSTED BY CONTENT TEAMS & CREATORS AT
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale contrast-200">
            <span className="text-xl font-black text-white">YOUTUBE SHORTS</span>
            <span className="text-xl font-black text-white">TIKTOK CREATIVE</span>
            <span className="text-xl font-black text-white">SUBSTACK</span>
            <span className="text-xl font-black text-white">PATREON</span>
            <span className="text-xl font-black text-white">MEDIUM</span>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <Features />

      {/* Interactive Simulator */}
      <Playground />

      {/* Workflow pipeline */}
      <Workflow />

      {/* Simple Pricing & Slider */}
      <Pricing />

      {/* Social Proof */}
      <Testimonials />

      {/* FAQs */}
      <Faq />

      {/* CTA final section */}
      <CTASection />

      {/* Site Footer */}
      <Footer />

    </div>
  );
}
