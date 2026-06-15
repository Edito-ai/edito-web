"use client";

import React from "react";

export default function Workflow() {
  return (
    <section id="pipeline" className="py-24 max-w-7xl mx-auto px-6 scroll-mt-20">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <span className="text-purple-400 text-sm font-extrabold uppercase tracking-widest mb-3 block">STEP-BY-STEP WORKFLOW</span>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          How Edito Syncs Content
        </h2>
        <p className="text-zinc-400 text-base">
          Create high-converting, fully customized publications with minimal manual adjustments.
        </p>
      </div>

      {/* Timeline Pipeline Grid */}
      <div className="relative">
        {/* Connector Line */}
        <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-linear-to-r from-purple-500 via-indigo-500 to-pink-500/20 -translate-y-1/2 z-0" />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
          {/* Step 1 */}
          <div className="bg-[#08080a] border border-zinc-800/80 p-8 rounded-2xl flex flex-col justify-between group hover:border-purple-500/30 transition-all">
            <div>
              <span className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-sm font-black mb-6 group-hover:bg-purple-500 group-hover:text-white transition-all">01</span>
              <h3 className="text-lg font-bold text-white mb-2">Draft Script</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Provide keywords or outlines. The AI draft editor structures full video scripts, hook highlights, and pacing pointers.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#08080a] border border-zinc-800/80 p-8 rounded-2xl flex flex-col justify-between group hover:border-indigo-500/30 transition-all">
            <div>
              <span className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-sm font-black mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all">02</span>
              <h3 className="text-lg font-bold text-white mb-2">Create Media</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Record locally or drag in raw segments. Our timeline automatically maps audio paths to generate speech transcripts.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#08080a] border border-zinc-800/80 p-8 rounded-2xl flex flex-col justify-between group hover:border-pink-500/30 transition-all">
            <div>
              <span className="w-8 h-8 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 text-sm font-black mb-6 group-hover:bg-pink-500 group-hover:text-white transition-all">03</span>
              <h3 className="text-lg font-bold text-white mb-2">Auto-Cut & Polish</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Let AI scrub silences, compile matching B-roll footage layers, overlay subtitles, and output clean content audio.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-[#08080a] border border-zinc-800/80 p-8 rounded-2xl flex flex-col justify-between group hover:border-zinc-700 transition-all">
            <div>
              <span className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-sm font-black mb-6 group-hover:bg-white group-hover:text-black transition-all">04</span>
              <h3 className="text-lg font-bold text-white mb-2">Omni-Channel Share</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Compile optimized threads for social channels. Export high-quality media frames ready to publish.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
