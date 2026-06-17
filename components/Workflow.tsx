"use client";

import React from "react";

const steps = [
  {
    name: "Draft Script",
    description: "Provide keywords or outlines. The AI structures full video scripts with hook highlights and pacing pointers.",
  },
  {
    name: "Create Media",
    description: "Record locally or drag in raw segments. The timeline maps audio paths and generates speech transcripts automatically.",
  },
  {
    name: "Auto-Cut & Polish",
    description: "AI scrubs silences, compiles matching B-roll, overlays subtitles, and outputs clean audio tracks.",
  },
  {
    name: "Omni-Channel Share",
    description: "Compile optimized threads for social channels. Export high-quality media in any format, ready to publish.",
  },
];

export default function Workflow() {
  return (
    <section id="pipeline" className="py-24 max-w-6xl mx-auto px-6 scroll-mt-20">
      {/* Section Header */}
      <div className="max-w-2xl mb-16">
        <span className="font-mono text-xs text-accent tracking-[0.2em] uppercase mb-4 block">
          STEP-BY-STEP WORKFLOW
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.03em] text-text-primary mb-4">
          How Stedtio Syncs Content
        </h2>
        <p className="text-text-muted text-base font-body leading-[1.7]">
          Create high-converting, fully customized publications with minimal manual adjustments.
        </p>
      </div>

      {/* Horizontal Timeline — Desktop */}
      <div className="hidden lg:block">
        {/* Connector line */}
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-border" />
          {/* Accent dots */}
          <div className="flex justify-between relative">
            {steps.map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-accent -mt-1.5 relative z-10"
                style={{ marginLeft: i === 0 ? "0" : "auto", marginRight: i === steps.length - 1 ? "0" : "auto" }}
              />
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-4 gap-8 mt-8">
          {steps.map((step) => (
            <div key={step.name} className="flex flex-col">
              <div className="w-full h-0.5 bg-accent mb-6" />
              <h3 className="font-display text-base font-bold text-text-primary mb-2">
                {step.name}
              </h3>
              <p className="text-text-muted text-sm font-body leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Vertical Stack — Mobile */}
      <div className="lg:hidden flex flex-col gap-8">
        {steps.map((step) => (
          <div key={step.name} className="flex gap-4">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <div className="w-px flex-1 bg-border" />
            </div>
            <div className="pb-4">
              <h3 className="font-display text-base font-bold text-text-primary mb-1.5">
                {step.name}
              </h3>
              <p className="text-text-muted text-sm font-body leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
