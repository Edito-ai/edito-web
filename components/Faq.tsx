"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";

export default function Faq() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqData = [
    {
      q: "What makes Edito.ai different from standard editors?",
      a: "Edito.ai unites all content workflows in a single workspace. Instead of drafting a script in Docs, generating captions on ChatGPT, and exporting to Premiere—Edito lets you write, create subtitles, auto-cut silences, insert B-roll, and compile social variants in one visual workflow."
    },
    {
      q: "How does the AI Video Editor work?",
      a: "Our video engine uses advanced speech-to-text models to build an interactive transcript. By editing the text script, you edit the video! It also automatically detects filler words (um, like), silent gaps, and compiles them in a single click."
    },
    {
      q: "Can I export in different ratios like 9:16 and 16:9?",
      a: "Absolutely! Edito.ai features smart reframing that tracks the primary focus of your horizontal video (16:9) and auto-centers it to fit vertical outputs (9:16) for TikTok, Reels, and YouTube Shorts."
    },
    {
      q: "Is there a limit on video upload or processing?",
      a: "Free users can upload up to 2GB per video and process 1 hour of video monthly. Pro users get 50GB storage, 4K rendering, and up to 30 hours of AI processing, scaling based on your subscription credits."
    }
  ];

  return (
    <section id="faqs" className="py-24 max-w-4xl mx-auto px-6 scroll-mt-20">
      <div className="text-center mb-16">
        <span className="text-purple-400 text-sm font-extrabold uppercase tracking-widest mb-3 block">COMMON QUESTIONS</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">Frequently Asked Questions</h2>
      </div>

      <div className="flex flex-col gap-4">
        {faqData.map((faq, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-zinc-800/80 bg-zinc-950/30 overflow-hidden transition-all"
          >
            <button
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="w-full p-5 flex items-center justify-between text-left font-bold text-zinc-200 hover:text-white transition-colors"
            >
              <span>{faq.q}</span>
              <span className="text-zinc-500">
                {openFaq === idx ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
            </button>
            
            {openFaq === idx && (
              <div className="px-5 pb-5 pt-1 text-sm text-zinc-400 border-t border-zinc-800/50 leading-relaxed animate-fade-in">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
