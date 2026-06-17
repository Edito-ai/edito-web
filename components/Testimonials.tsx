"use client";

import React from "react";

const testimonials = [
  {
    quote: "Before Stedtio, our podcast pipeline required three tools: desilencing scripts, standard caption apps, and a video compiler. Now we run everything in Stedtio in 15 minutes instead of 2 hours. Game changer.",
    name: "Marek Krawczyk",
    title: "Video Producer, Creators Lab",
  },
  {
    quote: "The AI transcript-based text editor is shockingly smart. Being able to delete filler words from my written draft and watching my video timeline instantly cut to match is magical.",
    name: "Ashley Lin",
    title: "TikTok Creator (1.2M followers)",
  },
  {
    quote: "We operate a newsletter combined with daily short clips. Stedtio\u2019s ability to ingest our draft, build caption variations, and format video ratios automatically cut our agency\u2019s editing budget by 40% this quarter.",
    name: "Jordan Hayes",
    title: "Founder, MediaGroup Agency",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 max-w-6xl mx-auto px-6">
      {/* Section Header */}
      <div className="max-w-2xl mb-16">
        <span className="font-mono text-xs text-accent tracking-[0.2em] uppercase mb-4 block">
          TESTIMONIALS
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.03em] text-text-primary mb-4">
          Used by Top-Tier Creators
        </h2>
        <p className="text-text-muted text-base font-body leading-[1.7]">
          See how editors and content production spaces are scaling their delivery metrics with Stedtio.
        </p>
      </div>

      {/* Staggered Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12 items-start">
        {testimonials.map((t, i) => (
          <div
            key={t.name}
            className={`relative ${i === 1 ? "md:mt-12" : ""}`}
          >
            {/* Large quotation mark */}
            <span
              className="absolute -top-8 -left-2 font-display text-[120px] leading-none text-accent opacity-[0.12] select-none pointer-events-none"
              aria-hidden="true"
            >
              &ldquo;
            </span>

            {/* Quote */}
            <p className="relative z-10 font-display text-lg md:text-xl text-text-primary italic leading-relaxed mb-6">
              &ldquo;{t.quote}&rdquo;
            </p>

            {/* Attribution */}
            <div>
              <h5 className="font-display text-sm font-bold text-text-primary">{t.name}</h5>
              <span className="text-xs text-text-muted">{t.title}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
