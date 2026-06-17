"use client";

import React from "react";

const features = [
  {
    icon: "✍️",
    name: "Smart Copywriter",
    description: "Write video scripts, blog drafts, newsletters, and summaries. Trained on viral hooks, audience engagement, and modern SEO.",
    bullets: ["Viral Hooks Generator", "Structured Script Outlines", "Multivariant Copy Tone"],
  },
  {
    icon: "🎬",
    name: "Viral Caption Suite",
    description: "Repurpose copy into optimized posts for LinkedIn, X, Instagram, and TikTok with contextual hashtags and emoji placement.",
    bullets: ["Auto-Format Thread Creator", "Hashtag Recommender", "Emoji Smart-Placements"],
  },
  {
    icon: "📢",
    name: "Intelligent Video Editor",
    description: "Edit videos via transcript timeline. Auto-remove silence, add dynamic subtitles, generate B-roll clips, and enhance voice tracks.",
    bullets: ["AI Silence & Gap Trimmer", "Kinetic Subtitle Overlays", "Sound Match Vocals Enhancer"],
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 max-w-6xl mx-auto px-6 scroll-mt-20">
      {/* Section Header — Left Aligned */}
      <div className="max-w-2xl mb-16">
        <span className="font-mono text-xs text-accent tracking-[0.2em] uppercase mb-4 block">
          CORE CAPABILITIES
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.03em] text-text-primary mb-4">
          A Multi-Tool Workspace Powered by AI
        </h2>
        <p className="text-text-muted text-base font-body leading-[1.7]">
          Say goodbye to jumping between writing portals, editing timelines, and social hubs. Stedtio covers the full production lifecycle.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div
            key={feature.name}
            className="p-7 rounded-xl bg-surface border border-border hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
          >
            {/* Icon */}
            <div className="w-11 h-11 rounded-lg bg-border flex items-center justify-center mb-5 text-xl">
              {feature.icon}
            </div>

            {/* Feature Name */}
            <h3 className="font-display text-lg font-semibold text-text-primary mb-3">
              {feature.name}
            </h3>

            {/* Description */}
            <p className="text-text-muted text-[15px] font-body leading-relaxed mb-5">
              {feature.description}
            </p>

            {/* Bullets */}
            <ul className="flex flex-col gap-2 mt-auto">
              {feature.bullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-2.5 font-mono text-xs text-text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
