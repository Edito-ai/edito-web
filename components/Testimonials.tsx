"use client";

import React from "react";
import { Star } from "lucide-react";

export default function Testimonials() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <span className="text-purple-400 text-sm font-extrabold uppercase tracking-widest mb-3 block">TESTIMONIALS</span>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          Used by Top-Tier Creators
        </h2>
        <p className="text-zinc-400 text-base">
          See how editors and content production spaces are scaling their delivery metrics with stedio.ai.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1 */}
        <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-yellow-400 mb-4">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6 italic">
              &quot;Before stedio.ai, our podcast pipeline required three tools: desilencing scripts, standard caption apps, and a video compiler. Now we run everything in stedio in 15 minutes instead of 2 hours. Game changer.&quot;
            </p>
          </div>
          <div className="flex items-center gap-3 border-t border-zinc-800/50 pt-4">
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
              MK
            </div>
            <div>
              <h5 className="text-sm font-bold text-white">Marek Krawczyk</h5>
              <span className="text-xs text-zinc-500">Video Producer, Creators Lab</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-yellow-400 mb-4">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6 italic">
              &quot;The AI transcript-based text editor is shockingly smart. Being able to delete filler words or entire boring paragraphs from my written draft and watching my video timeline instantly cut to match is magical.&quot;
            </p>
          </div>
          <div className="flex items-center gap-3 border-t border-zinc-800/50 pt-4">
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
              AL
            </div>
            <div>
              <h5 className="text-sm font-bold text-white">Ashley Lin</h5>
              <span className="text-xs text-zinc-500">TikTok Creator (1.2M followers)</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-yellow-400 mb-4">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6 italic">
              &quot;We operate a newsletter combined with daily short clips. stedio&apos;s ability to ingest our draft, build caption variations, and format video ratios automatically cut our agency&apos;s editing budget by 40% this quarter.&quot;
            </p>
          </div>
          <div className="flex items-center gap-3 border-t border-zinc-800/50 pt-4">
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
              JH
            </div>
            <div>
              <h5 className="text-sm font-bold text-white">Jordan Hayes</h5>
              <span className="text-xs text-zinc-500">Founder, MediaGroup Agency</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
