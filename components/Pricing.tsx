"use client";

import React, { useState } from "react";

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new Event("show-building-popup"));
  };

  return (
    <section id="pricing" className="py-24 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs text-accent tracking-[0.2em] uppercase mb-4 block">
            SIMPLE PRICING
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.03em] text-text-primary mb-4">
            Flexible Plans Built to Scale
          </h2>
          <p className="text-text-muted text-base font-body leading-[1.7]">
            Start free and scale as your content catalog grows. Save 20% with yearly payments.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                billingPeriod === "monthly"
                  ? "bg-accent text-black"
                  : "bg-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                billingPeriod === "yearly"
                  ? "bg-accent text-black"
                  : "bg-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              Yearly
              <span className={`text-[10px] font-bold ${billingPeriod === "yearly" ? "text-black/60" : "text-accent"}`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div id="pricing-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Plan 1 — Free Starter */}
          <div className="p-7 rounded-xl bg-surface border border-border hover:border-[#2A2A30] transition-all duration-200 flex flex-col justify-between">
            <div>
              <span className="font-mono text-text-muted text-xs uppercase tracking-wider">Free Starter</span>
              <div className="flex items-baseline gap-1 mt-4 mb-6">
                <span className="font-display text-4xl font-bold text-text-primary">$0</span>
                <span className="text-text-muted text-sm">/month</span>
              </div>
              <p className="text-text-muted text-sm font-body mb-6">Perfect for checking out features, testing tools, and small social projects.</p>
              <div className="h-px bg-border w-full mb-6" />
              <ul className="flex flex-col gap-3">
                {["1 hour of AI Video editing / mo", "5,000 words AI content drafts", "Basic caption presets"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs text-text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    {item}
                  </li>
                ))}
                {["No auto B-roll matching", "No team share folders"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs text-text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-border shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={handleActionClick}
              className="w-full mt-8 py-3 rounded-md border border-border bg-transparent text-text-primary hover:border-[#2A2A30] hover:text-white font-bold text-sm transition-all duration-200"
            >
              Get Started Free
            </button>
          </div>

          {/* Plan 2 — Solo Creator (Most Popular) */}
          <div className="p-7 rounded-xl bg-surface border border-accent transition-all duration-200 flex flex-col justify-between relative">
            <span className="absolute top-4 right-4 px-2.5 py-1 rounded-md bg-accent text-black text-[9px] font-mono font-bold uppercase tracking-wider">
              MOST POPULAR
            </span>
            <div>
              <span className="font-mono text-accent text-xs uppercase tracking-wider">Solo Creator</span>
              <div className="flex items-baseline gap-1 mt-4 mb-6">
                <span className="font-display text-4xl font-bold text-text-primary">
                  {billingPeriod === "monthly" ? "$29" : "$23"}
                </span>
                <span className="text-text-muted text-sm">/month</span>
              </div>
              <p className="text-text-muted text-sm font-body mb-6">Built for professional YouTubers, TikTokers, and freelance editors.</p>
              <div className="h-px bg-border w-full mb-6" />
              <ul className="flex flex-col gap-3">
                {[
                  "15 hours of AI video editing / mo",
                  "Unlimited AI content drafts",
                  "Full custom caption models",
                  "AI auto B-roll generator matching",
                  "1080p full rendering formats",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs text-text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={handleActionClick}
              className="w-full mt-8 py-3 rounded-md bg-accent text-black font-bold text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
            >
              Unlock Pro Access
            </button>
          </div>

          {/* Plan 3 — Production House */}
          <div className="p-7 rounded-xl bg-surface border border-border hover:border-[#2A2A30] transition-all duration-200 flex flex-col justify-between">
            <div>
              <span className="font-mono text-text-muted text-xs uppercase tracking-wider">Production House</span>
              <div className="flex items-baseline gap-1 mt-4 mb-6">
                <span className="font-display text-4xl font-bold text-text-primary">
                  {billingPeriod === "monthly" ? "$89" : "$71"}
                </span>
                <span className="text-text-muted text-sm">/month</span>
              </div>
              <p className="text-text-muted text-sm font-body mb-6">Ideal for marketing agencies, content teams, and full production spaces.</p>
              <div className="h-px bg-border w-full mb-6" />
              <ul className="flex flex-col gap-3">
                {[
                  "60 hours of AI video editing / mo",
                  "Unlimited AI drafts + API integrations",
                  "Advanced multi-speaker translation",
                  "4K Ultra-HD export formats",
                  "Multi-user shared team folder",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs text-text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={handleActionClick}
              className="w-full mt-8 py-3 rounded-md border border-border bg-transparent text-text-primary hover:border-[#2A2A30] hover:text-white font-bold text-sm transition-all duration-200"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
