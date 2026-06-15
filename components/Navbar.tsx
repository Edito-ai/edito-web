"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Sparkles } from "lucide-react";

const navItems = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new Event("show-building-popup"));
  };

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
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo_dark.png"
              alt="edito.ai"
              width={120}
              height={30}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav Links — centered */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/6 transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleActionClick}
              className="px-4 py-1.5 rounded-lg text-[13px] font-semibold text-zinc-300 hover:text-white hover:bg-white/6 transition-all duration-200"
            >
              Sign In
            </button>
            <button
              onClick={handleActionClick}
              className="px-5 py-2 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-[13px] transition-all duration-300 shadow-md shadow-purple-600/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started Free
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/6 transition-colors"
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
            mobileMenuOpen ? "max-h-[450px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-5 pb-5 pt-1 flex flex-col gap-1 border-t border-zinc-800/50">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-[15px] font-medium text-zinc-300 hover:text-white hover:bg-white/6 transition-all"
              >
                {item.label}
              </Link>
            ))}
            <div className="h-px bg-zinc-800/60 my-2" />
            <div className="flex flex-col gap-3 pt-1">
              <button
                onClick={handleActionClick}
                className="w-full py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800/30 text-zinc-300 font-semibold text-sm text-center transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleActionClick}
                className="w-full py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm text-center transition-colors shadow-lg shadow-purple-600/15"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </nav>
      <BuildingPopup />
    </div>
  );
}

function BuildingPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShow = () => setIsOpen(true);
    window.addEventListener("show-building-popup", handleShow);
    return () => window.removeEventListener("show-building-popup", handleShow);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in pointer-events-auto"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 shadow-2xl text-center flex flex-col items-center gap-5 glass-panel select-none animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Style tag for animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleUp {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 0.2s ease-out forwards;
          }
          .animate-scale-up {
            animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>

        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/6 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon container */}
        <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white tracking-tight">Hold on, man!</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            We are still actively building this feature. Check back soon!
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={() => setIsOpen(false)}
          className="w-full py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm transition-all duration-300 shadow-md shadow-purple-600/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          Okay, got it
        </button>
      </div>
    </div>
  );
}

