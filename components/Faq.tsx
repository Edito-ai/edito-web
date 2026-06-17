"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqData = [
  {
    q: "What makes Stedtio different from standard editors?",
    a: "Stedtio unites all content workflows in a single workspace. Instead of drafting a script in Docs, generating captions on ChatGPT, and exporting to Premiere — Stedtio lets you write, create subtitles, auto-cut silences, insert B-roll, and compile social variants in one visual workflow.",
  },
  {
    q: "How does the AI Video Editor work?",
    a: "Our video engine uses advanced speech-to-text models to build an interactive transcript. By editing the text script, you edit the video. It also automatically detects filler words (um, like), silent gaps, and compiles them in a single click.",
  },
  {
    q: "Can I export in different ratios like 9:16 and 16:9?",
    a: "Absolutely. Stedtio features smart reframing that tracks the primary focus of your horizontal video (16:9) and auto-centers it to fit vertical outputs (9:16) for TikTok, Reels, and YouTube Shorts.",
  },
  {
    q: "Is there a limit on video upload or processing?",
    a: "Free users can upload up to 2GB per video and process 1 hour of video monthly. Pro users get 50GB storage, 4K rendering, and up to 30 hours of AI processing, scaling based on your subscription credits.",
  },
];

export default function Faq() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faqs" className="py-24 max-w-4xl mx-auto px-6 scroll-mt-20">
      <div className="text-center mb-16">
        <span className="font-mono text-xs text-accent tracking-[0.2em] uppercase mb-4 block">
          COMMON QUESTIONS
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="flex flex-col">
        {faqData.map((faq, idx) => (
          <div key={idx} className="border-b border-border">
            <button
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="w-full py-6 flex items-center justify-between text-left font-display font-bold text-text-primary hover:text-white transition-colors duration-200"
            >
              <span className="pr-4">{faq.q}</span>
              <span className="text-text-muted shrink-0">
                {openFaq === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
            </button>

            <div
              className={`faq-answer ${openFaq === idx ? "open" : ""}`}
              style={{
                maxHeight: openFaq === idx ? "300px" : "0px",
                opacity: openFaq === idx ? 1 : 0,
                paddingBottom: openFaq === idx ? "24px" : "0px",
              }}
            >
              <p className="text-sm text-text-muted font-body leading-relaxed">
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
