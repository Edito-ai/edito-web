"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
      <nav
        className={`pointer-events-auto w-full max-w-5xl rounded-2xl border transition-all duration-500 ease-out ${
          scrolled
            ? "border-zinc-700/60 bg-zinc-950/80 backdrop-blur-xl shadow-2xl shadow-black/40"
            : "border-zinc-800/40 bg-zinc-950/40 backdrop-blur-md shadow-lg shadow-black/20"
        }`}
      >
        <div className="px-5 md:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center shrink-0">
            <Image
              src="/logo_dark.png"
              alt="edito.ai"
              width={120}
              height={30}
              className="h-7 w-auto object-contain"
              priority
            />
          </a>

          {/* Desktop Nav Links — centered */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {["Features", "Playground", "Workflow", "Pricing", "FAQs"].map(
              (item) => {
                const href =
                  item === "Workflow"
                    ? "#pipeline"
                    : `#${item.toLowerCase()}`;
                return (
                  <a
                    key={item}
                    href={href}
                    className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                  >
                    {item}
                  </a>
                );
              }
            )}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button className="px-4 py-1.5 rounded-lg text-[13px] font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
              Sign In
            </button>
            <button className="px-5 py-2 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-[13px] transition-all duration-300 shadow-md shadow-purple-600/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]">
              Get Started Free
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Drawer */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
            mobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-5 pb-5 pt-1 flex flex-col gap-1 border-t border-zinc-800/50">
            {["Features", "Playground", "Workflow", "Pricing", "FAQs"].map(
              (item) => {
                const href =
                  item === "Workflow"
                    ? "#pipeline"
                    : `#${item.toLowerCase()}`;
                return (
                  <a
                    key={item}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-xl text-[15px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all"
                  >
                    {item}
                  </a>
                );
              }
            )}
            <div className="h-px bg-zinc-800/60 my-2" />
            <div className="flex flex-col gap-3 pt-1">
              <button className="w-full py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800/30 text-zinc-300 font-semibold text-sm text-center transition-colors">
                Sign In
              </button>
              <button className="w-full py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm text-center transition-colors shadow-lg shadow-purple-600/15">
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
