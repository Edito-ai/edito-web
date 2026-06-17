"use client";

import React, { useState } from "react";
import { ArrowRight, Play, X } from "lucide-react";

export default function Hero() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-24">
      {/* Eyebrow */}
      <span className="font-mono text-xs text-accent tracking-[0.2em] uppercase mb-6">
        ALL-IN-ONE AI WORKSPACE
      </span>

      {/* H1 */}
      <h1 className="font-display text-5xl sm:text-7xl md:text-[80px] font-bold tracking-[-0.04em] leading-[1.05] max-w-4xl text-center text-text-primary mb-6">
        Edit Faster.
        <br />
        Publish Smarter.
      </h1>

      {/* Subtitle */}
      <p className="text-text-muted text-base md:text-lg font-body max-w-[520px] text-center leading-[1.7] mb-10">
        The AI workspace that writes your scripts, trims your silences, and generates captions — so you can publish faster.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mb-20">
        <a
          href="/dashboard"
          className="px-8 py-3.5 rounded-md bg-accent text-black font-bold text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2 group"
        >
          Start Free
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
        <button
          onClick={() => setShowDemoModal(true)}
          className="px-8 py-3.5 rounded-md border border-border bg-transparent text-text-muted hover:text-text-primary hover:border-[#2A2A30] font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2"
        >
          Watch Demo
          <Play className="w-4 h-4" />
        </button>
      </div>

      {/* Mockup with radial glow */}
      <div className="w-full max-w-4xl relative">
        {/* Subtle radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(232, 255, 71, 0.06) 0%, transparent 70%)" }}
        />

        {/* Dark mockup frame */}
        <div className="relative bg-surface border border-border rounded-xl overflow-hidden aspect-video">
          {/* Title bar */}
          <div className="h-10 border-b border-border bg-[#0E0E10] flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-red/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-accent/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-text-muted/40" />
            </div>
            <span className="text-[10px] font-mono text-text-muted">stedtio.com</span>
            <div className="w-8" />
          </div>

          {/* Simulated UI */}
          <div className="flex h-[calc(100%-40px)]">
            {/* Left sidebar */}
            <div className="w-[28%] border-r border-border p-4 hidden sm:flex flex-col gap-3">
              <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider">Project Files</span>
              <div className="flex flex-col gap-2">
                <div className="h-2.5 bg-border rounded-sm w-[85%]" />
                <div className="h-2.5 bg-border rounded-sm w-[70%]" />
                <div className="h-2.5 bg-accent/15 rounded-sm w-[90%] border-l-2 border-accent" />
                <div className="h-2.5 bg-border rounded-sm w-[60%]" />
                <div className="h-2.5 bg-border rounded-sm w-[75%]" />
              </div>
              <div className="mt-auto p-2 rounded-md bg-background border border-border flex items-center justify-between">
                <span className="text-[9px] text-text-muted">Draft v2.3</span>
                <div className="w-2 h-2 rounded-full bg-accent" />
              </div>
            </div>

            {/* Center content */}
            <div className="flex-1 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(30,30,34,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,30,34,0.3)_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" />
              <div className="relative flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-xl border border-border bg-background flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <Play className="w-3 h-3 text-accent" />
                  </div>
                </div>
                <span className="text-[10px] font-mono text-text-muted">00:04:12 — Ready</span>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="w-[24%] border-l border-border p-4 hidden lg:flex flex-col gap-3">
              <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider">AI Output</span>
              <div className="flex flex-col gap-2">
                <div className="h-2.5 bg-border rounded-sm w-[90%]" />
                <div className="h-2.5 bg-border rounded-sm w-[75%]" />
                <div className="h-2.5 bg-border rounded-sm w-[85%]" />
              </div>
              <div className="p-2 rounded-md bg-background border border-border">
                <span className="text-[9px] text-accent font-medium">✦ 3 captions generated</span>
              </div>
            </div>
          </div>

          {/* Bottom timeline bar */}
          <div className="h-10 border-t border-border bg-[#0E0E10] px-4 flex items-center gap-3 absolute bottom-0 left-0 right-0">
            <span className="text-[8px] font-mono text-text-muted">Timeline</span>
            <div className="flex-1 h-5 bg-background border border-border rounded-sm flex items-center relative overflow-hidden">
              <div className="absolute left-[35%] top-0 bottom-0 w-0.5 bg-accent z-10" />
              <div className="flex items-end gap-px px-2 w-full h-[60%] opacity-30">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-accent w-[2px] rounded-t"
                    style={{ height: `${Math.round(Math.sin(i * 0.5) * 5 + 7)}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Video Modal */}
      {showDemoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setShowDemoModal(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-xl border border-border bg-surface p-2 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
              <span className="text-xs font-mono font-semibold text-text-muted">Stedtio Product Walkthrough</span>
              <button
                onClick={() => setShowDemoModal(false)}
                className="p-1 rounded-md text-text-muted hover:text-text-primary transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player */}
            <div className="rounded-lg overflow-hidden aspect-video relative border border-border bg-black flex items-center justify-center">
              <video
                src="http://localhost:5000/api/assets/Modern_SaaS_product_demo_video.mp4"
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
