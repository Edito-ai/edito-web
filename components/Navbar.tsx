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
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });

    const checkUser = () => {
      const stored = localStorage.getItem("stedio_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener("auth-change", checkUser);
    window.addEventListener("storage", checkUser);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("auth-change", checkUser);
      window.removeEventListener("storage", checkUser);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <nav
        className={`w-full border-b transition-all duration-300 ease-out ${
          scrolled
            ? "border-border bg-background/90 backdrop-blur-xl"
            : "border-transparent bg-background"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo_dark_v3.png"
              alt="stedio.ai"
              width={120}
              height={30}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav Links — centered */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-1.5 rounded-md text-[13px] font-medium text-text-muted hover:text-text-primary transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-[13px] font-medium text-text-muted">
                  Hello, <span className="text-text-primary font-semibold">{user.name}</span>
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem("stedio_token");
                    localStorage.removeItem("stedio_user");
                    window.dispatchEvent(new Event("auth-change"));
                  }}
                  className="px-4 py-1.5 rounded-md text-[13px] font-semibold text-text-muted hover:text-text-primary transition-all duration-200 cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-1.5 rounded-md text-[13px] font-medium text-text-muted hover:text-text-primary transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 rounded-md bg-accent text-black font-bold text-[13px] transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-text-muted hover:text-text-primary transition-colors"
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
          <div className="px-6 pb-5 pt-1 flex flex-col gap-1 border-t border-border">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-md text-[15px] font-medium text-text-muted hover:text-text-primary transition-all"
              >
                {item.label}
              </Link>
            ))}
            <div className="h-px bg-border my-2" />
            <div className="flex flex-col gap-3 pt-1">
              {user ? (
                <>
                  <span className="text-[15px] font-medium text-text-muted px-3 py-1">
                    Hello, <span className="text-text-primary font-semibold">{user.name}</span>
                  </span>
                  <button
                    onClick={() => {
                      localStorage.removeItem("stedio_token");
                      localStorage.removeItem("stedio_user");
                      window.dispatchEvent(new Event("auth-change"));
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-md border border-border text-text-muted hover:text-text-primary font-semibold text-sm text-center transition-all cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-md border border-border text-text-muted hover:text-text-primary font-semibold text-sm text-center transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-md bg-accent text-black font-bold text-sm text-center transition-all"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto"
      onClick={() => setIsOpen(false)}
      style={{ animation: "fadeIn 0.2s ease-out forwards" }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div
        className="relative w-full max-w-sm rounded-xl border border-border bg-surface p-6 md:p-8 text-center flex flex-col items-center gap-5 select-none"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
      >
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-md text-text-muted hover:text-text-primary transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon container */}
        <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-xl font-display font-bold text-text-primary tracking-tight">Hold on, man!</h3>
          <p className="text-text-muted text-sm leading-relaxed">
            We are still actively building this feature. Check back soon!
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={() => setIsOpen(false)}
          className="w-full py-2.5 rounded-md bg-accent text-black font-bold text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        >
          Okay, got it
        </button>
      </div>
    </div>
  );
}
