"use client";

import React, { useState } from "react";
import { Zap, ArrowRight, Play, Sparkles, Volume2, X } from "lucide-react";

export default function Hero() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  return (
    <section className="relative pt-28 pb-24 md:pt-36 md:pb-36 max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
      {/* Glow pill */}
      

      {/* Heading */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-5xl mb-6">
        The Complete AI Workspace for{" "}
        <span className="bg-linear-to-r from-purple-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
          Modern Editors
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-zinc-400 text-lg md:text-xl max-w-3xl leading-relaxed mb-10">
        From scripts and SEO-friendly copy to viral captions, micro-content formatting, and lightning-fast video editing. Streamline your entire production workflow in one unified AI platform.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16 justify-center">
        <a 
          href="#playground" 
          className="px-8 py-4 rounded-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base transition-all hover:scale-[1.02] shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 group"
        >
          Start Editing Free
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
        <button 
          onClick={() => setShowDemoModal(true)}
          className="px-8 py-4 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-white font-bold text-base transition-all flex items-center justify-center gap-2"
        >
          Watch Demo
          <Play className="w-4 h-4 fill-zinc-400" />
        </button>
      </div>

      {/* Hero Visual Mockup */}
      <div className="w-full max-w-5xl rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-2 shadow-2xl relative group">
        <div className="absolute inset-0 bg-linear-to-tr from-purple-600/10 via-transparent to-indigo-600/10 rounded-2xl pointer-events-none" />
        <div className="absolute -inset-px rounded-2xl bg-linear-to-r from-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 blur transition-all duration-700 pointer-events-none" />
        <div className="rounded-xl overflow-hidden aspect-video relative border border-zinc-800 bg-[#070709] flex items-center justify-center">
          
          {/* Mock Dashboard Representation */}
          <div className="absolute inset-0 flex flex-col">
            {/* Header */}
            <div className="h-12 border-b border-zinc-800/60 bg-[#0a0a0d] flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-semibold text-zinc-500">edito-workspace_v2.mp4</span>
              <div className="w-8" />
            </div>

            {/* Workspace Split */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel - Script Writer */}
              <div className="w-[30%] border-r border-zinc-800/60 bg-[#09090b] p-4 flex-col justify-between hidden sm:flex">
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">AI SCRIPT DRAFT</span>
                  <div className="flex flex-col gap-2">
                    <div className="h-3 bg-zinc-800/80 rounded w-[90%]" />
                    <div className="h-3 bg-zinc-800/80 rounded w-[85%]" />
                    <div className="h-3 bg-indigo-950/60 border-l-2 border-indigo-500 text-indigo-300 pl-1.5 py-0.5 rounded w-full flex items-center justify-between text-[9px]">
                      <span>[AI Suggestion: Insert B-Roll here]</span>
                      <Sparkles className="w-2.5 h-2.5" />
                    </div>
                    <div className="h-3 bg-zinc-800/80 rounded w-[95%]" />
                    <div className="h-3 bg-zinc-800/80 rounded w-[60%]" />
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2 justify-between">
                  <span className="text-[10px] text-zinc-400">Tone: High Energy</span>
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                </div>
              </div>

              {/* Center Panel - Video Editing Preview */}
              <div className="flex-1 bg-black relative flex items-center justify-center group/preview">
                {/* Grid Lines Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
                
                {/* Mock Video Preview */}
                <div className="relative w-[85%] h-[80%] rounded-lg overflow-hidden border border-zinc-800 bg-[#0b0c10] flex flex-col justify-between shadow-2xl">
                  <div className="p-3 flex items-center justify-between bg-zinc-900/60 backdrop-blur border-b border-zinc-800/60">
                    <span className="text-[10px] text-zinc-400">Preview (1080x1920)</span>
                    <span className="text-[10px] font-mono text-zinc-500">00:04:12</span>
                  </div>

                  {/* Inner Mock Frame */}
                  <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                    {/* Gradient Backdrop inside frame */}
                    <div className="absolute inset-0 bg-linear-to-tr from-purple-900/30 to-indigo-950/20" />
                    
                    {/* Avatar representational placeholder */}
                    <div className="w-20 h-20 rounded-full border border-purple-500/50 bg-linear-to-br from-purple-700 to-indigo-600 flex items-center justify-center z-10 shadow-lg shadow-purple-500/20 mb-4">
                      <Sparkles className="w-8 h-8 text-purple-200" />
                    </div>

                    {/* AI Kinetic Subtitle */}
                    <span className="z-10 font-extrabold text-sm sm:text-base md:text-lg uppercase tracking-wide bg-yellow-400 text-black px-3 py-1 rounded shadow-md text-center">
                      🔥 DOUBLE YOUR RETENTION
                    </span>
                  </div>

                  <div className="p-2.5 bg-zinc-900/80 backdrop-blur flex items-center justify-center gap-4 border-t border-zinc-800/60 text-zinc-400">
                    <Play className="w-3.5 h-3.5 fill-current cursor-pointer hover:text-white" />
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full w-[45%]" />
                    </div>
                    <Volume2 className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
                  </div>
                </div>
              </div>

              {/* Right Panel - Captions / Social Output */}
              <div className="w-[25%] border-l border-zinc-800/60 bg-[#09090b] p-4 flex-col justify-between hidden lg:flex">
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">AI CAPTION SUITE</span>
                  <div className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Zap className="w-2.5 h-2.5 text-purple-400" />
                      </div>
                      <span className="text-[9px] font-bold text-purple-300">TikTok Hooks</span>
                    </div>
                    <p className="text-[9px] text-zinc-400 italic">&quot;Here are 3 video edits that will literally force people...&quot;</p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-zinc-800/30 bg-zinc-900/10 flex flex-col gap-2 opacity-60">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center">
                        <CheckIcon className="w-2.5 h-2.5 text-zinc-400" />
                      </div>
                      <span className="text-[9px] font-bold text-zinc-400">LinkedIn Summary</span>
                    </div>
                  </div>
                </div>

                <button className="w-full py-2 rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-300 hover:bg-zinc-700 transition-colors">
                  Publish Draft
                </button>
              </div>
            </div>

            {/* Timeline Track */}
            <div className="h-16 border-t border-zinc-800/60 bg-[#09090c] px-4 flex items-center gap-4">
              <span className="text-[9px] font-mono text-zinc-500">Timeline</span>
              <div className="flex-1 h-8 bg-[#040405] border border-zinc-800/50 rounded flex items-center relative overflow-hidden">
                <div className="absolute left-[35%] top-0 bottom-0 w-0.5 bg-purple-500 z-10" />
                {/* Waveform representation with Math.round to prevent SSR float hydration mismatch */}
                <div className="flex items-end gap-px px-2 w-full h-[60%] opacity-40">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-indigo-400 w-1 rounded-t"
                      style={{ height: `${Math.round(Math.sin(i * 0.4) * 12 + 16)}px` }}
                    />
                  ))}
                </div>
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
            className="relative w-full max-w-4xl rounded-2xl border border-zinc-800/80 bg-zinc-950 p-2 shadow-2xl transition-all duration-300 scale-100 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-900/60">
              <span className="text-xs font-semibold text-zinc-400">Edito.ai Product Walkthrough</span>
              <button 
                onClick={() => setShowDemoModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/6 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Video Player */}
            <div className="rounded-xl overflow-hidden aspect-video relative border border-zinc-800 bg-black flex items-center justify-center">
              <video 
                src="/Modern_SaaS_product_demo_video.mp4" 
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

// Simple internal icon to replace Check since we only need simple visuals
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={3}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
