"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  User,
  Mail,
  Video,
  Users,
  Lock,
  Check,
  ShieldCheck,
} from "lucide-react";

const PLATFORMS = [
  { id: "youtube", label: "YouTube", icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ), color: "from-red-500 to-red-600" },
  { id: "instagram", label: "Instagram", icon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  ), color: "from-pink-500 to-purple-500" },
  { id: "tiktok", label: "TikTok", icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.87a8.16 8.16 0 004.76 1.52V6.96a4.85 4.85 0 01-1-.27z"/>
    </svg>
  ), color: "from-cyan-400 to-pink-500" },
  { id: "twitter", label: "X / Twitter", icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ), color: "from-zinc-400 to-zinc-500" },
  { id: "linkedin", label: "LinkedIn", icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ), color: "from-blue-500 to-blue-600" },
  { id: "other", label: "Other", icon: Users, color: "from-zinc-600 to-zinc-700" },
];

const FOLLOWER_RANGES = [
  { id: "0-1K", label: "0 – 1K", desc: "Just starting out" },
  { id: "1K-10K", label: "1K – 10K", desc: "Growing" },
  { id: "10K-100K", label: "10K – 100K", desc: "Established" },
  { id: "100K-1M", label: "100K – 1M", desc: "Influencer" },
  { id: "1M+", label: "1M+", desc: "Star creator" },
];

const TOTAL_STEPS = 5;

const setAuthCookie = (token: string) => {
  if (typeof window !== "undefined") {
    document.cookie = `Stedtio_token=${token}; path=/; SameSite=Lax`;
  }
};

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState("");
  const [followers, setFollowers] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const router = useRouter();

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(timer);
  }, [step]);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const canProceed = () => {
    switch (step) {
      case 0: return name.trim().length >= 2;
      case 1: return otpVerified;
      case 2: return platform !== "";
      case 3: return followers !== "";
      case 4: return password.length >= 6 && password === confirmPassword;
      default: return false;
    }
  };

  const nextStep = () => {
    if (!canProceed()) return;
    setError("");
    if (step < TOTAL_STEPS - 1) {
      setDirection("next");
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setError("");
      setDirection("prev");
      setStep(step - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (step === 1 && !otpSent) {
        sendOtp();
      } else {
        nextStep();
      }
    }
  };

  // --- OTP Logic ---
  const sendOtp = async () => {
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    setError("");
    setOtpLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        setOtpLoading(false);
        return;
      }
      setOtpSent(true);
      setResendTimer(60);
      setOtpLoading(false);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Failed to send OTP");
      setOtpLoading(false);
    }
  };

  const verifyOtp = async (fullOtp: string) => {
    setError("");
    setOtpLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: fullOtp }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
        setOtpLoading(false);
        return;
      }
      setOtpVerified(true);
      setOtpLoading(false);
      // Auto-advance after verification
      setTimeout(() => {
        setDirection("next");
        setStep(2);
      }, 600);
    } catch {
      setError("Verification failed");
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits filled
    const fullOtp = newOtp.join("");
    if (fullOtp.length === 6) {
      verifyOtp(fullOtp);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split("");
      setOtp(newOtp);
      verifyOtp(pasted);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, platform, followers }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }
      localStorage.setItem("Stedtio_token", data.token);
      localStorage.setItem("Stedtio_user", JSON.stringify(data.user));
      // Sync to cookie for server-side middleware protection
      setAuthCookie(data.token);
      window.dispatchEvent(new Event("auth-change"));
      router.push("/dashboard");
    } catch {
      setError("Unable to connect to server");
      setLoading(false);
    }
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  const stepContent = [
    // Step 0 — Name
    <div key="name" className="space-y-6">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mx-auto text-accent">
        <User className="w-6 h-6" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-text-primary tracking-tight">What&apos;s your name?</h2>
        <p className="text-text-muted text-sm mt-2">Let&apos;s start with the basics</p>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Your full name"
        className="w-full max-w-sm mx-auto block px-6 py-3.5 rounded-lg bg-background border border-border text-text-primary placeholder:text-text-muted/40 text-lg text-center focus:border-accent focus:ring-1 focus:ring-accent outline-hidden transition-all duration-200"
        autoFocus
      />
    </div>,

    // Step 1 — Email + OTP
    <div key="email" className="space-y-6">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mx-auto text-accent">
        {otpVerified ? (
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
        ) : (
          <Mail className="w-6 h-6" />
        )}
      </div>
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-text-primary tracking-tight">
          {otpVerified ? "Email verified!" : otpSent ? "Enter the code" : "What\u0027s your email?"}
        </h2>
        <p className="text-text-muted text-sm mt-2">
          {otpVerified
            ? "Your email has been confirmed"
            : otpSent
            ? <>We sent a 6-digit code to <span className="text-text-primary font-medium">{email}</span></>
            : "We\u0027ll send you a verification code"}
        </p>
      </div>

      {otpVerified ? (
        <div className="flex flex-col items-center justify-center gap-2 py-4 animate-[scaleUp_0.3s_ease-out]">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-emerald-400 font-semibold text-lg">Verified</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setOtpVerified(false);
              setOtpSent(false);
              setOtp(["", "", "", "", "", ""]);
              setError("");
            }}
            className="text-text-muted hover:text-text-primary text-xs transition-colors mt-2 underline cursor-pointer"
          >
            Change email
          </button>
        </div>
      ) : !otpSent ? (
        <div className="max-w-sm mx-auto space-y-4">
          <input
            ref={inputRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="you@example.com"
            className="w-full px-6 py-4 rounded-lg bg-background border border-border text-text-primary placeholder:text-text-muted/40 text-lg text-center focus:border-accent focus:ring-1 focus:ring-accent outline-hidden transition-all duration-200"
          />
          <button
            type="button"
            onClick={sendOtp}
            disabled={otpLoading || !email}
            className={`w-full py-3 rounded-lg font-bold font-display text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              email && !otpLoading
                ? "bg-accent text-background hover:bg-accent/90"
                : "bg-zinc-800/50 text-text-muted/50 cursor-not-allowed"
            }`}
          >
            {otpLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Send Verification Code
                <Mail className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* OTP Input boxes */}
          <div className="flex items-center justify-center gap-2.5" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { otpRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                disabled={otpLoading}
                className={`w-12 h-14 md:w-14 md:h-16 rounded-lg text-center text-xl md:text-2xl font-bold transition-all duration-200 outline-none ${
                  digit
                    ? "bg-accent/5 border-accent text-accent"
                    : "bg-background border-border text-text-primary focus:border-accent focus:ring-1 focus:ring-accent"
                } border ${otpLoading ? "opacity-50" : ""}`}
              />
            ))}
          </div>

          {otpLoading && (
            <div className="flex items-center justify-center gap-2 text-accent text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </div>
          )}

          {/* Resend */}
          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-text-muted text-sm">Resend code in <span className="text-text-primary font-medium">{resendTimer}s</span></p>
            ) : (
              <button
                type="button"
                onClick={() => { setOtp(["", "", "", "", "", ""]); sendOtp(); }}
                className="text-accent hover:underline text-sm font-semibold transition-colors cursor-pointer"
              >
                Resend code
              </button>
            )}
          </div>

          {/* Change email */}
          <button
            type="button"
            onClick={() => { setOtpSent(false); setOtp(["", "", "", "", "", ""]); setError(""); }}
            className="block mx-auto text-text-muted hover:text-text-primary text-xs transition-colors cursor-pointer"
          >
            Change email address
          </button>
        </div>
      )}
    </div>,

    // Step 2 — Platform
    <div key="platform" className="space-y-6">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mx-auto text-accent">
        <Video className="w-6 h-6" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-text-primary tracking-tight">Where do you create?</h2>
        <p className="text-text-muted text-sm mt-2">Pick your primary platform</p>
      </div>
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        {PLATFORMS.map((p) => {
          const Icon = p.icon;
          const selected = platform === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlatform(p.id)}
              className={`relative flex items-center gap-3 px-4 py-3.5 rounded-lg border transition-all duration-200 text-left group cursor-pointer ${
                selected
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface hover:border-text-muted/40"
              }`}
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-md ${
                selected ? `bg-linear-to-br ${p.color} text-white` : "bg-background text-text-muted"
              } transition-all duration-200`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-sm font-semibold ${selected ? "text-text-primary" : "text-text-muted"} transition-colors`}>
                {p.label}
              </span>
              {selected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Check className="w-3 h-3 text-background" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>,

    // Step 3 — Followers
    <div key="followers" className="space-y-6">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mx-auto text-accent">
        <Users className="w-6 h-6" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-text-primary tracking-tight">How big is your audience?</h2>
        <p className="text-text-muted text-sm mt-2">Followers or subscribers — roughly</p>
      </div>
      <div className="space-y-2.5 max-w-sm mx-auto">
        {FOLLOWER_RANGES.map((f) => {
          const selected = followers === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFollowers(f.id)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                selected
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface hover:border-text-muted/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-base font-bold ${selected ? "text-accent" : "text-text-primary"} transition-colors`}>
                  {f.label}
                </span>
                <span className={`text-xs ${selected ? "text-accent/80" : "text-text-muted"} transition-colors`}>
                  {f.desc}
                </span>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 ${
                selected ? "border-accent bg-accent" : "border-border"
              }`}>
                {selected && <Check className="w-3 h-3 text-background" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>,

    // Step 4 — Password
    <div key="password" className="space-y-6">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mx-auto text-accent">
        <Lock className="w-6 h-6" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-text-primary tracking-tight">Set your password</h2>
        <p className="text-text-muted text-sm mt-2">Minimum 6 characters</p>
      </div>
      <div className="space-y-4 max-w-sm mx-auto">
        <div className="relative">
          <input
            ref={inputRef}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Password"
            className="w-full px-6 py-4 rounded-lg bg-background border border-border text-text-primary placeholder:text-text-muted/40 text-base focus:border-accent focus:ring-1 focus:ring-accent outline-hidden transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <input
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Confirm password"
          className="w-full px-6 py-4 rounded-lg bg-background border border-border text-text-primary placeholder:text-text-muted/40 text-base focus:border-accent focus:ring-1 focus:ring-accent outline-hidden transition-all duration-200"
        />
        {password && confirmPassword && password !== confirmPassword && (
          <p className="text-accent-red text-xs text-center animate-[fadeIn_0.2s_ease-out]">Passwords don&apos;t match</p>
        )}
      </div>
    </div>,
  ];

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col bg-background overflow-y-auto font-body">
      {/* Ambient glow orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-red/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-[40%] left-[50%] -translate-x-1/2 w-[300px] h-[300px] bg-white/2 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="fixed inset-0 opacity-[0.012] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Content wrapper — vertically centered, no scroll on standard viewports */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-6 min-h-0 w-full">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <img
              src="http://localhost:5000/api/assets/logo_dark_v3.png"
              alt="Stedtio"
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-lg mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">Step {step + 1} of {TOTAL_STEPS}</span>
            <span className="text-xs font-bold text-accent">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 w-full bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-lg">
          <div className="relative rounded-2xl border border-border bg-surface shadow-2xl shadow-black/80 px-6 py-8 md:px-10 md:py-8 overflow-hidden">
            {/* Top glow line */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
              <div className="absolute -top-px left-[15%] right-[15%] h-px bg-linear-to-r from-transparent via-accent/20 to-transparent" />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 px-4 py-3 rounded-lg bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm text-center animate-[fadeIn_0.2s_ease-out]">
                {error}
              </div>
            )}

            {/* Animated step content */}
            <div
              key={step}
              style={{ animation: `${direction === "next" ? "slideInRight" : "slideInLeft"} 0.3s ease-out` }}
            >
              {stepContent[step]}
            </div>

            {/* Navigation */}
            <div className={`flex items-center gap-3 mt-8 max-w-sm mx-auto w-full ${step === 1 && !otpVerified ? "justify-center" : ""}`}>
              {step > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center justify-center w-12 h-12 rounded-lg border border-border bg-background text-text-muted hover:text-text-primary hover:border-text-muted/40 transition-all duration-200 shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              {!(step === 1 && !otpVerified) && (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed() || loading}
                  className={`flex-1 py-3 rounded-lg font-bold font-display text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                    canProceed() && !loading
                      ? "bg-accent text-background hover:bg-accent/90"
                      : "bg-zinc-800/50 text-text-muted/50 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : step === TOTAL_STEPS - 1 ? (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Sign in link */}
            <div className="mt-6 pt-4 border-t border-border text-center">
              <p className="text-text-muted text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-accent hover:underline font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted/60 text-xs mt-4">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleUp {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
