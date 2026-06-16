"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Store token and redirect
      localStorage.setItem("edito_token", data.token);
      localStorage.setItem("edito_user", JSON.stringify(data.user));
      window.location.href = "/";
    } catch {
      setError("Unable to connect to server");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Ambient glow orbs */}
      <div className="absolute top-[-20%] left-[-15%] w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-indigo-900/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-900/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Image
              src="/logo_dark.png"
              alt="edito.ai"
              width={140}
              height={35}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl border border-zinc-800/60 bg-zinc-950/70 backdrop-blur-xl shadow-2xl shadow-black/50 p-8 md:p-10">
          {/* Glow border effect */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
            <div className="absolute -top-px left-[20%] right-[20%] h-px bg-linear-to-r from-transparent via-purple-500/40 to-transparent" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-zinc-500 text-sm">
              Sign in to your Edito.ai account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-[fadeIn_0.2s_ease-out]">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-zinc-400"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-zinc-600 text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-zinc-400"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="glass-input w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-zinc-600 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-purple-800 disabled:to-indigo-800 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-500/30 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-zinc-800/60 text-center">
            <p className="text-zinc-500 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Create one free
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      {/* Keyframes for error fade in */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
