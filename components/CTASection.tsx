"use client";

import React from "react";
import { ShieldCheck, Award, Check } from "lucide-react";

export default function CTASection() {
  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new Event("show-building-popup"));
  };

  return (
    <section className="py-24 max-w-5xl mx-auto px-6 text-center">
      <div className="p-10 md:p-16 rounded-3xl border border-zinc-800 bg-linear-to-b from-zinc-950 to-[#0b0b0d] relative overflow-hidden shadow-2xl">
        <div className="absolute top-[-30%] left-[20%] w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          Supercharge Your Workflow Today
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
          Join thousands of modern editors and video teams utilizing our integrated AI system to write drafts, generate captions, and render viral short clips.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center mb-8">
          <input
            type="email"
            placeholder="Enter your email address..."
            className="px-5 py-3 rounded-full text-sm font-medium bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-purple-500 w-full sm:w-[280px]"
          />
          <button
            onClick={handleActionClick}
            className="px-6 py-3 rounded-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-md shadow-purple-600/15"
          >
            Start Free Trial
          </button>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-6 text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-purple-400" /> NO CREDIT CARD REQUIRED</span>
          <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-purple-400" /> CANCEL ANYTIME</span>
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-purple-400" /> 10 FREE CREDITS INSTANTLY</span>
        </div>
      </div>
    </section>
  );
}
