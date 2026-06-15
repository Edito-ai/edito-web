"use client";

import React from "react";
import { PenTool, MessageSquare, Video, Check } from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-6 scroll-mt-20">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <span className="text-purple-400 text-sm font-extrabold uppercase tracking-widest mb-3 block">CORE CAPABILITIES</span>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          A Multi-Tool Workspace Powered by AI
        </h2>
        <p className="text-zinc-400 text-base md:text-lg">
          Say goodbye to jumping between writing portals, editing timelines, and social hubs. edito.ai covers the full production lifecycle.
        </p>
      </div>

      {/* Features Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1 */}
        <div className="p-8 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 hover:border-purple-500/40 transition-all duration-300 relative group overflow-hidden glow-card">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
            <PenTool className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">1. Smart Copywriter</h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            Write video scripts, blog drafts, newsletters, and video summaries. Trained on highly interactive hooks, audience engagement, and modern SEO paradigms.
          </p>
          <ul className="text-zinc-500 text-xs flex flex-col gap-2">
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Viral Hooks Generator</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Structure Script Outlines</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Multivariant Copy Tone</li>
          </ul>
        </div>

        {/* Card 2 */}
        <div className="p-8 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 hover:border-indigo-500/40 transition-all duration-300 relative group overflow-hidden glow-card">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">2. Viral Caption Suite</h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            Repurpose your copy into optimized posts for LinkedIn, X (Twitter), Instagram, and TikTok. Adds contextually matching hashtags, emojis, and visual threads.
          </p>
          <ul className="text-zinc-500 text-xs flex flex-col gap-2">
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-500" /> Auto-Format Thread Creator</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-500" /> Hashtag Recommender</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-500" /> Emoji Smart-Placements</li>
          </ul>
        </div>

        {/* Card 3 */}
        <div className="p-8 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 hover:border-pink-500/40 transition-all duration-300 relative group overflow-hidden glow-card">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">3. Intelligent Video Editor</h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            Edit videos via their transcript timeline. Auto-remove silence, add smart dynamic subtitles, generate contextually relevant B-roll clips, and enhance voice tracks instantly.
          </p>
          <ul className="text-zinc-500 text-xs flex flex-col gap-2">
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-pink-500" /> AI Silence & Gap Trimmer</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-pink-500" /> Kinetic Subtitle Overlays</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-pink-500" /> Sound Match Vocals Enhancer</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
