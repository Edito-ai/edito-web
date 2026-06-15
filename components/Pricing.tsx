"use client";

import React, { useState } from "react";
import { Sliders, ChevronRight, Check, X } from "lucide-react";

export default function Pricing() {
  const [sliderVideos, setSliderVideos] = useState(15);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new Event("show-building-popup"));
  };

  return (
    <section id="pricing" className="py-24 bg-zinc-950/20 border-y border-zinc-800/40 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-purple-400 text-sm font-extrabold uppercase tracking-widest mb-3 block">SIMPLE PRICING</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Flexible Plans Built to Scale
          </h2>
          <p className="text-zinc-400 text-base">
            Start free and scale as your content catalog grows. Save 20% with yearly payments.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-semibold ${billingPeriod === "monthly" ? "text-white" : "text-zinc-500"}`}>Monthly billing</span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
              className="w-12 h-6.5 rounded-full bg-zinc-800 p-1 flex items-center transition-all duration-300 relative"
              aria-label="Toggle billing period"
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-purple-500 transition-transform ${billingPeriod === "yearly" ? "translate-x-5.5" : "translate-x-0"}`} />
            </button>
            <span className={`text-sm font-semibold flex items-center gap-1.5 ${billingPeriod === "yearly" ? "text-purple-300" : "text-zinc-500"}`}>
              Yearly billing <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Calculator Slide */}
        <div className="max-w-3xl mx-auto mb-16 p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/50 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-extrabold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" /> Estimate Your Content Needs
              </h4>
              <p className="text-xs text-zinc-500 mt-1">Drag the slider to input the number of short videos you plan to edit monthly.</p>
            </div>
            <span className="text-lg font-black text-white">{sliderVideos} Videos / Month</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-600 font-bold">5</span>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={sliderVideos}
              onChange={(e) => setSliderVideos(Number(e.target.value))}
              className="flex-1 h-2 bg-zinc-900 border border-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <span className="text-xs text-zinc-600 font-bold">50+</span>
          </div>

          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-zinc-300">
              🚀 Recommended: <strong className="text-white">{sliderVideos <= 10 ? "Free Starter" : sliderVideos <= 30 ? "Solo Creator" : "Production House"} Plan</strong>. Includes approx. {sliderVideos * 10} minutes of AI speech parsing.
            </p>
            <a href="#pricing-grid" className="text-xs text-purple-300 hover:text-purple-200 font-bold flex items-center gap-1 shrink-0">
              View Plan Pricing <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div id="pricing-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Plan 1 */}
          <div className="p-8 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between">
            <div>
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Free Starter</span>
              <div className="flex items-baseline gap-1 mt-4 mb-6">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-zinc-500 text-sm">/ month</span>
              </div>
              <p className="text-zinc-400 text-xs mb-6">Perfect for checking out features, testing tools, and small social projects.</p>
              <div className="h-px bg-zinc-800/50 w-full mb-6" />
              <ul className="text-zinc-300 text-xs flex flex-col gap-3">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> 1 hour of AI Video editing / mo</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> 5,000 words AI content drafts</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Basic caption presets</li>
                <li className="flex items-center gap-2 text-zinc-600"><X className="w-3.5 h-3.5 shrink-0" /> No auto B-roll matching</li>
                <li className="flex items-center gap-2 text-zinc-600"><X className="w-3.5 h-3.5 shrink-0" /> No team share folders</li>
              </ul>
            </div>
            <button
              onClick={handleActionClick}
              className="w-full mt-8 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm transition-colors border border-zinc-800"
            >
              Get Started Free
            </button>
          </div>

          {/* Plan 2 */}
          <div className="p-8 rounded-2xl bg-linear-to-b from-[#0e0a1b] to-zinc-950/90 border-2 border-purple-500 hover:border-purple-400 transition-all flex flex-col justify-between relative shadow-xl shadow-purple-600/5">
            <span className="absolute top-4 right-4 px-2 py-0.5 rounded bg-purple-500 text-white text-[9px] font-black uppercase tracking-wider">MOST POPULAR</span>
            <div>
              <span className="text-purple-300 text-xs font-bold uppercase tracking-wider">Solo Creator</span>
              <div className="flex items-baseline gap-1 mt-4 mb-6">
                <span className="text-4xl font-extrabold text-white">
                  {billingPeriod === "monthly" ? "$29" : "$23"}
                </span>
                <span className="text-zinc-500 text-sm">/ month</span>
              </div>
              <p className="text-zinc-400 text-xs mb-6">Built for professional YouTubers, TikTokers, and freelance editors.</p>
              <div className="h-px bg-purple-950/50 w-full mb-6" />
              <ul className="text-zinc-300 text-xs flex flex-col gap-3">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> 15 hours of AI video editing / mo</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Unlimited AI content drafts</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Full custom caption models</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> AI auto B-roll generator matching</li>
                <li className="flex items-center gap-2 text-zinc-500"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> 1080p full rendering formats</li>
              </ul>
            </div>
            <button
              onClick={handleActionClick}
              className="w-full mt-8 py-3 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-md shadow-purple-600/10"
            >
              Unlock Pro Access
            </button>
          </div>

          {/* Plan 3 */}
          <div className="p-8 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between">
            <div>
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Production House</span>
              <div className="flex items-baseline gap-1 mt-4 mb-6">
                <span className="text-4xl font-extrabold text-white">
                  {billingPeriod === "monthly" ? "$89" : "$71"}
                </span>
                <span className="text-zinc-500 text-sm">/ month</span>
              </div>
              <p className="text-zinc-400 text-xs mb-6">Ideal for marketing agencies, content teams, and full production spaces.</p>
              <div className="h-px bg-zinc-800/50 w-full mb-6" />
              <ul className="text-zinc-300 text-xs flex flex-col gap-3">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> 60 hours of AI video editing / mo</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Unlimited AI drafts + API integrations</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Advanced multi-speaker translation</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> 4K Ultra-HD export formats</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Multi-user shared team folder</li>
              </ul>
            </div>
            <button
              onClick={handleActionClick}
              className="w-full mt-8 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm transition-colors border border-zinc-800"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
