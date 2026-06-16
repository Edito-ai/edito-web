"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  { id: "other", label: "Other", icon: Users, color: "from-violet-500 to-purple-600" },
];

const FOLLOWER_RANGES = [
  { id: "0-1K", label: "0 – 1K", desc: "Just starting out" },
  { id: "1K-10K", label: "1K – 10K", desc: "Growing" },
  { id: "10K-100K", label: "10K – 100K", desc: "Established" },
  { id: "100K-1M", label: "100K – 1M", desc: "Influencer" },
  { id: "1M+", label: "1M+", desc: "Star creator" },
];

const TOTAL_STEPS = 5;

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
      localStorage.setItem("edito_token", data.token);
      localStorage.setItem("edito_user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch {
      setError("Unable to connect to server");
      setLoading(false);
    }
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  const stepContent = [
    // Step 0 — Name
    <div key="name" className="space-y-8">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 mx-auto">
        <User className="w-7 h-7 text-purple-400" />
      </div>
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">What&apos;s your name?</h2>
        <p className="text-zinc-500 text-base mt-3">Let&apos;s start with the basics</p>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Your full name"
        className="glass-input w-full max-w-sm mx-auto block px-6 py-4 rounded-xl text-white placeholder-zinc-600 text-lg text-center"
        autoFocus
      />
    </div>,

    // Step 1 — Email + OTP
    <div key="email" className="space-y-8">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mx-auto">
        {otpVerified ? (
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
        ) : (
          <Mail className="w-7 h-7 text-indigo-400" />
        )}
      </div>
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          {otpVerified ? "Email verified!" : otpSent ? "Enter the code" : "What\u0027s your email?"}
        </h2>
        <p className="text-zinc-500 text-base mt-3">
          {otpVerified
            ? "Your email has been confirmed"
            : otpSent
            ? <>We sent a 6-digit code to <span className="text-zinc-300 font-medium">{email}</span></>
            : "We\u0027ll send you a verification code"}
        </p>
      </div>

      {otpVerified ? (
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center animate-[scaleUp_0.3s_ease-out]">
            <Check className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-emerald-400 font-semibold text-lg">Verified</span>
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
            className="glass-input w-full px-6 py-4 rounded-xl text-white placeholder-zinc-600 text-lg text-center"
          />
          <button
            type="button"
            onClick={sendOtp}
            disabled={otpLoading || !email}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              email && !otpLoading
                ? "bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20"
                : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
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
                className={`w-12 h-14 md:w-14 md:h-16 rounded-xl text-center text-xl md:text-2xl font-bold transition-all duration-200 outline-none ${
                  digit
                    ? "glass-input border-purple-500/50 text-white bg-purple-500/5"
                    : "glass-input text-white"
                } ${otpLoading ? "opacity-50" : ""}`}
              />
            ))}
          </div>

          {otpLoading && (
            <div className="flex items-center justify-center gap-2 text-purple-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </div>
          )}

          {/* Resend */}
          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-zinc-600 text-sm">Resend code in <span className="text-zinc-400 font-medium">{resendTimer}s</span></p>
            ) : (
              <button
                type="button"
                onClick={() => { setOtp(["", "", "", "", "", ""]); sendOtp(); }}
                className="text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors"
              >
                Resend code
              </button>
            )}
          </div>

          {/* Change email */}
          <button
            type="button"
            onClick={() => { setOtpSent(false); setOtp(["", "", "", "", "", ""]); setError(""); }}
            className="block mx-auto text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
          >
            Change email address
          </button>
        </div>
      )}
    </div>,

    // Step 2 — Platform
    <div key="platform" className="space-y-8">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 mx-auto">
        <Video className="w-7 h-7 text-pink-400" />
      </div>
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Where do you create?</h2>
        <p className="text-zinc-500 text-base mt-3">Pick your primary platform</p>
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
              className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left group ${
                selected
                  ? "border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/5"
                  : "border-zinc-800/60 bg-zinc-900/30 hover:border-zinc-700/60 hover:bg-zinc-800/20"
              }`}
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${
                selected ? `bg-linear-to-br ${p.color} text-white` : "bg-zinc-800/80 text-zinc-400"
              } transition-all duration-200`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-sm font-semibold ${selected ? "text-white" : "text-zinc-400"} transition-colors`}>
                {p.label}
              </span>
              {selected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>,

    // Step 3 — Followers
    <div key="followers" className="space-y-8">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mx-auto">
        <Users className="w-7 h-7 text-cyan-400" />
      </div>
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">How big is your audience?</h2>
        <p className="text-zinc-500 text-base mt-3">Followers or subscribers — roughly</p>
      </div>
      <div className="space-y-2.5 max-w-sm mx-auto">
        {FOLLOWER_RANGES.map((f) => {
          const selected = followers === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFollowers(f.id)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200 ${
                selected
                  ? "border-purple-500/50 bg-purple-500/10"
                  : "border-zinc-800/60 bg-zinc-900/30 hover:border-zinc-700/60 hover:bg-zinc-800/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-base font-bold ${selected ? "text-white" : "text-zinc-300"} transition-colors`}>
                  {f.label}
                </span>
                <span className={`text-xs ${selected ? "text-purple-400" : "text-zinc-600"} transition-colors`}>
                  {f.desc}
                </span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                selected ? "border-purple-500 bg-purple-500" : "border-zinc-700"
              }`}>
                {selected && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>,

    // Step 4 — Password
    <div key="password" className="space-y-8">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto">
        <Lock className="w-7 h-7 text-emerald-400" />
      </div>
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Set your password</h2>
        <p className="text-zinc-500 text-base mt-3">Minimum 6 characters</p>
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
            className="glass-input w-full px-6 py-4 pr-12 rounded-xl text-white placeholder-zinc-600 text-base"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
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
          className="glass-input w-full px-6 py-4 rounded-xl text-white placeholder-zinc-600 text-base"
        />
        {password && confirmPassword && password !== confirmPassword && (
          <p className="text-red-400 text-xs text-center animate-[fadeIn_0.2s_ease-out]">Passwords don&apos;t match</p>
        )}
      </div>
    </div>,
  ];

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col bg-background overflow-y-auto">
      {/* Ambient glow orbs */}
      <div className="fixed top-[-15%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/12 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-15%] left-[-10%] w-[550px] h-[550px] bg-purple-900/12 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed top-[40%] left-[50%] -translate-x-1/2 w-[300px] h-[300px] bg-violet-900/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="fixed inset-0 opacity-[0.012] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Content wrapper — vertically centered */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8 min-h-0">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Image
              src="/logo_dark.png"
              alt="edito.ai"
              width={160}
              height={40}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-lg mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500">Step {step + 1} of {TOTAL_STEPS}</span>
            <span className="text-xs font-semibold text-purple-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-lg">
          <div className="relative rounded-3xl border border-zinc-800/50 bg-zinc-950/60 backdrop-blur-xl shadow-2xl shadow-black/40 p-8 md:p-12 overflow-hidden">
            {/* Top glow line */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
              <div className="absolute -top-px left-[15%] right-[15%] h-px bg-linear-to-r from-transparent via-purple-500/30 to-transparent" />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-[fadeIn_0.2s_ease-out]">
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
            {!(step === 1 && !otpVerified) && (
              <div className="flex items-center gap-3 mt-10 max-w-sm mx-auto">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center justify-center w-12 h-12 rounded-xl border border-zinc-800/60 bg-zinc-900/40 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all duration-200"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed() || loading}
                  className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    canProceed() && !loading
                      ? "bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 hover:shadow-purple-500/30 hover:scale-[1.01] active:scale-[0.99]"
                      : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
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
              </div>
            )}

            {/* Sign in link */}
            <div className="mt-8 pt-6 border-t border-zinc-800/40 text-center">
              <p className="text-zinc-500 text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-700 text-xs mt-6">
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
