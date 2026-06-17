"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Video,
  PenTool,
  Image as ImageIcon,
  Sparkles,
  Play,
  Pause,
  Scissors,
  Layers,
  LogOut,
  Home,
  Wand2,
  Plus,
  ExternalLink,
  Cloud,
  Menu,
  X,
  ChevronRight,
  RefreshCw
} from "lucide-react";


// Subtitle interface matching the project workspace video
interface Subtitle {
  text: string;
  start: number; // in seconds
  end: number;   // in seconds
}

const initialSubtitles: Subtitle[] = [];


export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "video" | "writer" | "thumbnail">("overview");
  const [userName, setUserName] = useState("Creator");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load user from local storage
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("Stedtio_user") : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name) {
          // Defer state update to next tick to prevent synchronous render warn
          setTimeout(() => {
            setUserName(parsed.name);
          }, 0);
        }
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("Stedtio_token");
    localStorage.removeItem("Stedtio_user");
    // Clear the auth cookie so server-side middleware also sees the logout
    document.cookie = "Stedtio_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  // ----------------------------------------------------
  // VIDEO EDITOR STATE
  // ----------------------------------------------------
  const [videoPlay, setVideoPlay] = useState(false);
  const [videoDuration, setVideoDuration] = useState(30);
  const [currentTime, setCurrentTime] = useState(0);
  const [subtitles, setSubtitles] = useState<Subtitle[]>(initialSubtitles);
  const [captionStyle, setCaptionStyle] = useState<"kinetic" | "karaoke" | "minimal">("kinetic");
  const [autoCutActive, setAutoCutActive] = useState(false);
  const [brollActive, setBrollActive] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const autoCutRef = useRef(autoCutActive);

  // Keep auto-cut ref in sync to avoid rebuilding event listener closures
  useEffect(() => {
    autoCutRef.current = autoCutActive;
  }, [autoCutActive]);

  // Sync state with HTML5 video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      let time = video.currentTime;
      // Skip silences inline during DOM time updates to bypass React state cycles
      if (autoCutRef.current && time >= 7.5 && time < 9) {
        video.currentTime = 9;
        time = 9;
      }
      setCurrentTime(time);
    };

    const onDurationChange = () => {
      setVideoDuration(video.duration || 30);
    };

    const onEnded = () => {
      setVideoPlay(false);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("ended", onEnded);
    };
  }, [activeTab]);

  // Handle Play/Pause trigger
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (videoPlay) {
      video.play().catch(() => setVideoPlay(false));
    } else {
      video.pause();
    }
  }, [videoPlay]);

  // DERIVED SUBTITLE STATE (No effect needed!)
  const activeSub = subtitles.find(
    (sub) => currentTime >= sub.start && currentTime <= sub.end
  );
  const currentSubtitle = activeSub ? activeSub.text : "";
  let activeWordIndex = 0;
  if (activeSub) {
    const duration = activeSub.end - activeSub.start;
    const progress = (currentTime - activeSub.start) / duration;
    const words = activeSub.text.split(" ");
    activeWordIndex = Math.min(
      Math.floor(progress * words.length),
      words.length - 1
    );
    if (activeWordIndex < 0) activeWordIndex = 0;
  }

  const togglePlay = () => {
    setVideoPlay(!videoPlay);
  };

  const handleTimelineSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
    setCurrentTime(val);
  };

  const handleExportR2 = () => {
    setIsExporting(true);
    setExportUrl("");
    setTimeout(() => {
      setIsExporting(false);
      setExportUrl("https://stedito.r2.cloudflarestorage.com/project_render_" + Math.floor(Math.random() * 9000 + 1000) + ".mp4");
    }, 2000);
  };

  // ----------------------------------------------------
  // AI CONTENT WRITER STATE
  // ----------------------------------------------------
  const [writerPrompt, setWriterPrompt] = useState("");
  const [writerPlatform, setWriterPlatform] = useState<"script" | "hook" | "linkedin">("script");
  const [writerTone, setWriterTone] = useState("viral");
  const [writerOutput, setWriterOutput] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const writingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const sampleScripts: Record<string, string> = {
    script: `[Hook - 0:00]\nStart with a bold statement that grabs attention instantly.\n\n[Body - 0:10]\nDeliver your core value in short, punchy sentences. Cut the fluff.\n\n[CTA - 0:22]\nTell your audience exactly what to do next. Make it impossible to ignore.`,
    hook: `🔥 Hook 1: "Most creators are doing this wrong — here's what actually works."\n⚡ Hook 2: "Stop guessing what content to make. Start with this framework."\n🚀 Hook 3: "I grew from 0 to 100K by ignoring this one piece of common advice."`,
    linkedin: `The content game has changed completely. 🚀\n\nCreators who adapt to short-form first are winning.\nThose who don't are getting left behind.\n\nHere's what the top 1% do differently:\n✅ They start with the hook\n✅ They cut every word that doesn't earn its place\n✅ They post consistently even when reach is low\n\nWhat's your biggest challenge with content right now?`
  };

  const handleStartWriting = () => {
    if (writingTimerRef.current) clearInterval(writingTimerRef.current);
    setIsWriting(true);
    setWriterOutput("");

    const targetText = sampleScripts[writerPlatform] || sampleScripts.script;
    let index = 0;

    writingTimerRef.current = setInterval(() => {
      if (index < targetText.length) {
        setWriterOutput((prev) => prev + targetText.charAt(index));
        index++;
      } else {
        if (writingTimerRef.current) clearInterval(writingTimerRef.current);
        setIsWriting(false);
      }
    }, 8);
  };

  const applyScriptToTimeline = () => {
    if (!writerOutput) return;

    // Convert generated paragraphs into simple subtitle blocks
    const lines = writerOutput
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.startsWith("["))
      .map((line) => line.replace(/^\d+.\s*|•\s*|⚡\s*|🔥\s*|🚀\s*/, "").trim());

    if (lines.length > 0) {
      const durationPerLine = 30 / lines.length;
      const newSubs = lines.map((text, idx) => ({
        text: text.substring(0, 75), // limit subtitle length
        start: idx * durationPerLine,
        end: (idx + 1) * durationPerLine
      }));
      setSubtitles(newSubs);
      setActiveTab("video");
      alert("Script parsed and loaded directly to the Video Editor Subtitle track!");
    }
  };

  // Clean up timers
  useEffect(() => {
    return () => {
      if (writingTimerRef.current) clearInterval(writingTimerRef.current);
    };
  }, []);

  // ----------------------------------------------------
  // THUMBNAIL GENERATOR STATE
  // ----------------------------------------------------
  const [thumbText, setThumbText] = useState("AI WILL RUIN EDITORS!");
  const [thumbTemplate, setThumbTemplate] = useState<"cyber" | "sunset" | "minimal" | "hype">("cyber");
  const [brightness, setBrightness] = useState(105);
  const [contrast, setContrast] = useState(115);
  const [blurAmount, setBlurAmount] = useState(0);
  const [showFaceCutout, setShowFaceCutout] = useState(true);
  const [badgeText, setBadgeText] = useState("MUST WATCH");
  const [isSavingThumb, setIsSavingThumb] = useState(false);
  const [thumbSavedUrl, setThumbSavedUrl] = useState("");

  const handleSaveThumbR2 = () => {
    setIsSavingThumb(true);
    setThumbSavedUrl("");
    setTimeout(() => {
      setIsSavingThumb(false);
      setThumbSavedUrl("https://stedito.r2.cloudflarestorage.com/thumbnail_" + Math.floor(Math.random() * 9000 + 1000) + ".png");
    }, 1800);
  };

  // Helper styles for the thumbnail generator
  const getThumbnailStyle = () => {
    const baseFilter = `brightness(${brightness}%) contrast(${contrast}%) blur(${blurAmount}px)`;
    switch (thumbTemplate) {
      case "cyber":
        return {
          bg: "linear-gradient(135deg, #09090b 20%, #4c1d95 60%, #db2777 100%)",
          filter: baseFilter,
          border: "border-purple-500/50",
          textColor: "var(--color-accent)"
        };
      case "sunset":
        return {
          bg: "linear-gradient(135deg, #180808 20%, #7c2d12 60%, #b45309 100%)",
          filter: baseFilter,
          border: "border-orange-500/50",
          textColor: "#ffffff"
        };
      case "minimal":
        return {
          bg: "linear-gradient(135deg, #0a0a0b 0%, #1e1e24 100%)",
          filter: baseFilter,
          border: "border-border",
          textColor: "var(--color-text-primary)"
        };
      case "hype":
        return {
          bg: "linear-gradient(135deg, #022c22 0%, #065f46 50%, #111827 100%)",
          filter: baseFilter,
          border: "border-emerald-500/50",
          textColor: "var(--color-accent)"
        };
    }
  };

  const thumbStyle = getThumbnailStyle();

  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden font-body relative">
      {/* Glow effects in the background */}
      <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* MOBILE SIDEBAR TOGGLE */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 rounded-lg bg-surface border border-border text-text-muted hover:text-text-primary transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed md:relative top-0 bottom-0 left-0 w-64 bg-surface border-r border-border flex flex-col justify-between z-40 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 select-none">
            <span className="text-xl font-bold font-display tracking-tight text-text-primary flex items-center gap-1.5">
              Stedtio<span className="text-accent font-black">.ai</span>
            </span>
            <span className="text-[9px] font-mono border border-accent/20 bg-accent/5 text-accent px-1.5 py-0.5 rounded uppercase tracking-wider">
              Studio
            </span>
          </Link>

          {/* Nav Links */}
          <div className="space-y-1">
            <span className="block text-[10px] font-mono text-text-muted tracking-wider uppercase mb-3 px-2">
              Workspace
            </span>

            <button
              onClick={() => {
                setActiveTab("overview");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "overview"
                  ? "bg-border text-text-primary"
                  : "text-text-muted hover:text-text-primary hover:bg-border/50"
              }`}
            >
              <Home className="w-4 h-4" />
              Overview
            </button>

            <button
              onClick={() => {
                setActiveTab("video");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "video"
                  ? "bg-border text-text-primary"
                  : "text-text-muted hover:text-text-primary hover:bg-border/50"
              }`}
            >
              <span className="flex items-center gap-3">
                <Video className="w-4 h-4 text-[#db2777]" />
                Smart Video Editor
              </span>
              <span className="text-[9px] font-mono bg-accent/15 border border-accent/30 text-accent px-1 py-0.5 rounded leading-none">
                USP
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("writer");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "writer"
                  ? "bg-border text-text-primary"
                  : "text-text-muted hover:text-text-primary hover:bg-border/50"
              }`}
            >
              <PenTool className="w-4 h-4 text-purple-400" />
              AI Content Writer
            </button>

            <button
              onClick={() => {
                setActiveTab("thumbnail");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "thumbnail"
                  ? "bg-border text-text-primary"
                  : "text-text-muted hover:text-text-primary hover:bg-border/50"
              }`}
            >
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              AI Thumbnail Generator
            </button>
          </div>
        </div>

        {/* Profile Card & Log Out */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-accent text-background flex items-center justify-center font-bold text-sm select-none">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold truncate text-text-primary">{userName}</h4>
              <p className="text-[10px] font-mono text-accent">Stedtio Partner</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-text-muted hover:text-accent-red hover:bg-accent-red/5 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        {/* Top Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/70 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Empty space for mobile toggle */}
            <div className="w-8 md:hidden" />
            <div>
              <h1 className="text-sm font-bold text-text-primary tracking-tight uppercase font-mono">
                {activeTab === "overview" && "Workspace Dashboard"}
                {activeTab === "video" && "Video Timeline Studio"}
                {activeTab === "writer" && "AI Writing Studio"}
                {activeTab === "thumbnail" && "AI Thumbnail Canvas"}
              </h1>
            </div>
          </div>

          {/* R2 Connection Indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-surface border border-border rounded-full px-3 py-1 font-mono text-[10px] text-text-muted">
              <Cloud className="w-3 h-3 text-accent" />
              R2 Bucket: <span className="text-text-primary">stedito</span>
            </div>
            <Link
              href="/"
              className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </Link>
          </div>
        </header>

        {/* WORKSPACE CONTENT BODY */}
        <div className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
              {/* Greetings */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold font-display text-text-primary tracking-tight">
                    Welcome back, {userName} ⚡
                  </h2>
                  <p className="text-sm text-text-muted mt-1">
                    Here is what is happening in your creative suite. Let&apos;s make something viral.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("video")}
                  className="px-4 py-2 bg-accent text-background font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all hover:brightness-110 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  New Video Project
                </button>
              </div>

              {/* Core Features Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Smart Video Editor Card (USP - Highlighted) */}
                <div className="relative group rounded-2xl border-2 border-accent bg-surface shadow-2xl p-6 flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 bg-accent text-background font-bold text-[9px] font-mono px-3 py-1 rounded-bl-xl uppercase tracking-wider z-10">
                    FLAGSHIP USP
                  </div>
                  {/* Glowing decoration */}
                  <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent/5 rounded-full blur-xl group-hover:bg-accent/10 transition-all duration-300" />

                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mb-6">
                      <Video className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary font-display">Smart Video Editor</h3>
                    <p className="text-xs text-text-muted mt-2 leading-relaxed">
                      Trim empty silences automatically, transcribe speech into styled visual captions, overlay media timelines, and sync B-rolls in seconds.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab("video")}
                    className="w-full mt-8 py-2.5 rounded-lg bg-accent text-background font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Open Timeline Editor
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 2. AI Content Writer */}
                <div className="relative group rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between overflow-hidden">
                  <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all duration-300" />

                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                      <PenTool className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary font-display">AI Content Writer</h3>
                    <p className="text-xs text-text-muted mt-2 leading-relaxed">
                      Generate viral video scripts, TikTok hooks, and structured social captions tailored to any platform and tone. Export directly into subtitle tracks.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab("writer")}
                    className="w-full mt-8 py-2.5 rounded-lg bg-border hover:bg-border/80 text-text-primary font-semibold text-xs border border-border hover:border-border transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Open Writer Studio
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 3. AI Thumbnail Generator */}
                <div className="relative group rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between overflow-hidden">
                  <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all duration-300" />

                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary font-display">AI Thumbnail Builder</h3>
                    <p className="text-xs text-text-muted mt-2 leading-relaxed">
                      Draft eye-catching cover overlays. Select templates, adjust contrast, contrast badges, add creator face cutouts, and export directly to R2.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab("thumbnail")}
                    className="w-full mt-8 py-2.5 rounded-lg bg-border hover:bg-border/80 text-text-primary font-semibold text-xs border border-border hover:border-border transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Open Thumbnail Canvas
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                </div>
              </div>
            </div>
          )}


          {/* TAB 2: SMART VIDEO EDITOR (USP) */}
          {activeTab === "video" && (
            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              {/* Layout: Main Row (Preview Canvas & Control Panels) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Column: Canvas Monitor */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <div className="relative aspect-video rounded-2xl bg-black border border-border overflow-hidden flex items-center justify-center group shadow-2xl">
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />
                    
                    {/* HTML5 Video Element */}
                    <video
                      ref={videoRef}
                      src="http://localhost:5000/api/assets/Modern_SaaS_product_demo_video.mp4"
                      className="w-full h-full object-cover"
                      playsInline
                    />

                    {/* Subtitle Overlay in Screen */}
                    {currentSubtitle && (
                      <div className="absolute bottom-12 left-6 right-6 z-20 flex justify-center text-center pointer-events-none">
                        {captionStyle === "kinetic" && (
                          <span className="text-sm md:text-lg font-black uppercase tracking-wide bg-accent text-background px-3.5 py-1.5 rounded-lg shadow-xl shadow-black/60 -rotate-1 inline-block max-w-[90%]">
                            {currentSubtitle}
                          </span>
                        )}
                        {captionStyle === "karaoke" && (
                          <div className="text-sm md:text-lg font-bold bg-surface/90 text-text-primary px-4 py-2 rounded-xl border border-border shadow-xl flex flex-wrap justify-center gap-x-1.5 max-w-[90%] font-display">
                            {currentSubtitle.split(" ").map((word, wIdx) => (
                              <span
                                key={wIdx}
                                className={`transition-all duration-100 ${
                                  wIdx === activeWordIndex
                                    ? "text-accent scale-110 font-extrabold"
                                    : "opacity-80"
                                }`}
                              >
                                {word}
                              </span>
                            ))}
                          </div>
                        )}
                        {captionStyle === "minimal" && (
                          <span className="text-xs md:text-sm font-medium text-text-primary px-3 py-1 bg-black/40 backdrop-blur-sm rounded-md max-w-[85%] border border-border/30">
                            {currentSubtitle}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Playhead Ambient Wave Overlay if B-roll active */}
                    {brollActive && currentTime >= 8 && currentTime <= 18 && (
                      <div className="absolute inset-0 bg-accent/10 z-15 flex items-center justify-center border-4 border-accent animate-[pulse_2s_infinite] pointer-events-none">
                        <div className="bg-background/80 backdrop-blur px-3 py-1.5 rounded border border-accent/40 text-[10px] font-mono text-accent">
                          ✦ OVERLAPPING AI B-ROLL TRACK ACTIVE
                        </div>
                      </div>
                    )}

                    {/* Quick play overlay on hover */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
                      <button
                        onClick={togglePlay}
                        className="w-14 h-14 rounded-full bg-accent text-background flex items-center justify-center shadow-lg shadow-accent/20 cursor-pointer pointer-events-auto transform hover:scale-105 transition-transform"
                      >
                        {videoPlay ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center justify-between bg-surface border border-border rounded-xl px-5 py-3.5 shadow-lg">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="w-9 h-9 rounded-lg bg-border border border-[#2A2A30] hover:bg-accent hover:text-background transition-all flex items-center justify-center cursor-pointer text-text-primary"
                      >
                        {videoPlay ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>

                      <div className="text-[11px] font-mono text-text-muted">
                        <span className="text-text-primary">
                          00:00:{String(Math.floor(currentTime)).padStart(2, "0")}
                        </span>
                        {" / "}
                        <span>
                          00:00:{String(Math.floor(videoDuration)).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex gap-1 bg-background p-1 rounded-lg border border-border">
                        <button
                          onClick={() => {
                            if (videoRef.current) videoRef.current.playbackRate = 1.0;
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-mono text-text-muted hover:text-text-primary"
                        >
                          1.0x
                        </button>
                        <button
                          onClick={() => {
                            if (videoRef.current) videoRef.current.playbackRate = 1.5;
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-mono text-text-muted hover:text-text-primary"
                        >
                          1.5x
                        </button>
                        <button
                          onClick={() => {
                            if (videoRef.current) videoRef.current.playbackRate = 2.0;
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-mono text-text-muted hover:text-text-primary"
                        >
                          2.0x
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: AI Tool Settings */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* AI Quick Actions */}
                  <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
                    <h3 className="text-xs font-mono font-bold tracking-widest text-text-muted uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                      AI Studio Tools
                    </h3>

                    {/* Silence Auto-Cut */}
                    <button
                      onClick={() => {
                        setAutoCutActive(!autoCutActive);
                        if (!autoCutActive) {
                          alert("AI silence detector scan complete: 3 empty gaps (totaling 1.5s) will be automatically skipped during playback!");
                        }
                      }}
                      className={`w-full py-3 px-4 rounded-xl text-left border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                        autoCutActive
                          ? "bg-accent/10 border-accent text-accent"
                          : "bg-background/40 border-border text-text-primary hover:bg-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${autoCutActive ? "bg-accent/20" : "bg-border"}`}>
                          <Scissors className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold leading-none">Auto-Cut Silences</h4>
                          <p className="text-[10px] opacity-70 mt-1">Automatically trims dead gaps</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono border px-1.5 py-0.5 rounded border-border">
                        {autoCutActive ? "Active" : "Scan"}
                      </span>
                    </button>

                    {/* AI B-Roll Integration */}
                    <button
                      onClick={() => {
                        setBrollActive(!brollActive);
                        if (!brollActive) {
                          alert("AI searched matching visuals. Inserted B-roll clips from 0:08 to 0:18.");
                        }
                      }}
                      className={`w-full py-3 px-4 rounded-xl text-left border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                        brollActive
                          ? "bg-[#db2777]/10 border-[#db2777]/55 text-[#db2777]"
                          : "bg-background/40 border-border text-text-primary hover:bg-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${brollActive ? "bg-[#db2777]/20" : "bg-border"}`}>
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold leading-none">Add AI B-Roll</h4>
                          <p className="text-[10px] opacity-70 mt-1">Searches relevant footage overlay</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono border px-1.5 py-0.5 rounded border-border">
                        {brollActive ? "Linked" : "Inject"}
                      </span>
                    </button>
                  </div>

                  {/* Caption Templates */}
                  <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
                    <h3 className="text-xs font-mono font-bold tracking-widest text-text-muted uppercase">
                      Caption Templates
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setCaptionStyle("kinetic")}
                        className={`p-2.5 rounded-xl border text-[10px] font-bold text-center transition-all cursor-pointer ${
                          captionStyle === "kinetic"
                            ? "bg-accent/15 border-accent text-accent"
                            : "bg-background/40 border-border text-text-muted hover:text-text-primary"
                        }`}
                      >
                        ⚡ Kinetic
                      </button>
                      <button
                        onClick={() => setCaptionStyle("karaoke")}
                        className={`p-2.5 rounded-xl border text-[10px] font-bold text-center transition-all cursor-pointer ${
                          captionStyle === "karaoke"
                            ? "bg-accent/15 border-accent text-accent"
                            : "bg-background/40 border-border text-text-muted hover:text-text-primary"
                        }`}
                      >
                        🎤 Karaoke
                      </button>
                      <button
                        onClick={() => setCaptionStyle("minimal")}
                        className={`p-2.5 rounded-xl border text-[10px] font-bold text-center transition-all cursor-pointer ${
                          captionStyle === "minimal"
                            ? "bg-accent/15 border-accent text-accent"
                            : "bg-background/40 border-border text-text-muted hover:text-text-primary"
                        }`}
                      >
                        ▫️ Minimal
                      </button>
                    </div>
                  </div>

                  {/* Export & Save to R2 */}
                  <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
                    <button
                      onClick={handleExportR2}
                      disabled={isExporting}
                      className="w-full py-3.5 rounded-xl bg-accent text-background font-extrabold text-xs transition-all hover:brightness-110 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Rendering & Uploading to R2...
                        </>
                      ) : (
                        <>
                          <Cloud className="w-4 h-4" />
                          Export & Save to R2 Bucket
                        </>
                      )}
                    </button>

                    {exportUrl && (
                      <div className="bg-background border border-accent/20 rounded-xl p-3 text-[11px] font-mono select-all animate-[fadeIn_0.2s_ease-out]">
                        <p className="text-accent font-bold">Successfully Exported!</p>
                        <a
                          href={exportUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-text-muted hover:text-text-primary flex items-center justify-between gap-2 mt-1 truncate"
                        >
                          <span className="truncate">{exportUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Multi-track Timeline */}
              <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center text-xs font-mono text-text-muted">
                  <span>TIMELINE MULTI-TRACK</span>
                  <span>Playhead: {(currentTime).toFixed(1)}s</span>
                </div>

                <div className="relative bg-background border border-border rounded-xl p-3.5 font-mono text-[9px] select-none overflow-hidden">
                  
                  {/* Timeline Seek Input Slider Overlay */}
                  <input
                    type="range"
                    min="0"
                    max={videoDuration}
                    step="0.05"
                    value={currentTime}
                    onChange={handleTimelineSeek}
                    className="absolute inset-x-4 top-0 h-full w-[calc(100%-32px)] opacity-0 z-30 cursor-ew-resize"
                  />

                  {/* Playhead Red Needle Vertical Bar */}
                  <div
                    className="absolute top-2 bottom-2 w-[2px] bg-accent z-20 pointer-events-none transition-all duration-75"
                    style={{ left: `${(currentTime / videoDuration) * 92 + 5}%` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-accent translate-x-[-3px] translate-y-[-2px]" />
                  </div>

                  {/* Track 1: Subtitle Text Blocks */}
                  <div className="flex items-center gap-3 relative z-10 mb-2">
                    <span className="w-10 text-text-muted uppercase text-[8px] font-bold">Subs</span>
                    <div className="flex-1 h-6 bg-background border border-border rounded flex items-center p-0.5 gap-0.5 relative">
                      {subtitles.map((sub, idx) => {
                        const widthPct = ((sub.end - sub.start) / videoDuration) * 100;
                        const isActive = currentTime >= sub.start && currentTime <= sub.end;
                        return (
                          <div
                            key={idx}
                            className={`h-full rounded text-[8px] flex items-center justify-center text-center truncate px-1 transition-all ${
                              isActive
                                ? "bg-accent/25 text-accent font-black border border-accent/40 scale-y-102"
                                : "bg-border text-text-muted"
                            }`}
                            style={{ width: `${widthPct}%` }}
                            title={sub.text}
                          >
                            Block {idx + 1}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Track 2: Video Segments */}
                  <div className="flex items-center gap-3 relative z-10 mb-2">
                    <span className="w-10 text-text-muted uppercase text-[8px] font-bold">Video</span>
                    <div className="flex-1 h-6 bg-background border border-border rounded flex items-center p-0.5 gap-1 relative">
                      {autoCutActive ? (
                        <>
                          <div className="h-full bg-indigo-950 border border-indigo-900/40 rounded flex items-center px-2 text-indigo-400 font-bold" style={{ width: "25%" }}>
                            Part_1.mp4
                          </div>
                          <div className="h-full bg-accent-red/20 border border-accent-red/30 rounded flex items-center justify-center text-accent-red" style={{ width: "5%" }} title="Silence trimmed by Auto-Cut">
                            ✂️
                          </div>
                          <div className="h-full bg-indigo-950 border border-indigo-900/40 rounded flex items-center px-2 text-indigo-400 font-bold" style={{ width: "70%" }}>
                            Part_2.mp4
                          </div>
                        </>
                      ) : (
                        <div className="h-full bg-indigo-950 border border-indigo-900/40 rounded flex-1 flex items-center px-2 text-indigo-400 font-bold justify-between">
                          <span>A-Roll_Interview.mp4</span>
                          <span className="opacity-40 text-[8px]">00:30</span>
                        </div>
                      )}

                      {/* B-roll Track overlay if active */}
                      {brollActive && (
                        <div className="absolute left-[26%] right-[40%] top-0.5 bottom-0.5 bg-[#db2777]/80 text-[#F2F2F0] border border-[#db2777] rounded flex items-center justify-center font-bold text-[8px]">
                          ✦ AI_B-roll_Scene_08.mp4
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Track 3: Audio Waveform */}
                  <div className="flex items-center gap-3 relative z-10">
                    <span className="w-10 text-text-muted uppercase text-[8px] font-bold">Audio</span>
                    <div className="flex-1 h-6 bg-background border border-border rounded flex items-center p-0.5 relative">
                      <div className="absolute inset-y-0.5 left-0.5 right-0.5 rounded flex items-center bg-background/80 border border-border/30">
                        <div className="w-full flex items-end gap-px px-2 h-[75%] opacity-30">
                          {Array.from({ length: 70 }).map((_, i) => (
                            <div
                              key={i}
                              className="bg-accent w-[2px] rounded-t"
                              style={{
                                height: `${
                                  autoCutActive && i >= 17 && i <= 21
                                    ? 2
                                    : Math.round(Math.abs(Math.sin(i * 0.9)) * 12 + 2)
                                }px`
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI CONTENT WRITER */}
          {activeTab === "writer" && (
            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Controls */}
                <div className="lg:col-span-5 rounded-2xl border border-border bg-surface p-6 space-y-6 flex flex-col justify-between">
                  <div className="space-y-5">
                    {/* Prompt Box */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono tracking-widest text-text-muted uppercase">
                        AI Writer Prompt
                      </label>
                      <textarea
                        value={writerPrompt}
                        onChange={(e) => setWriterPrompt(e.target.value)}
                        rows={3}
                        className="w-full text-xs bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:border-accent outline-none resize-none placeholder:text-text-muted/50"
                        placeholder="What do you want to write about?"
                      />
                    </div>

                    {/* Platform Selection */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono tracking-widest text-text-muted uppercase">
                        Select Platform Format
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setWriterPlatform("script")}
                          className={`py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            writerPlatform === "script"
                              ? "bg-purple-600/20 border-purple-500/50 text-purple-300"
                              : "bg-background/40 border-border text-text-muted hover:text-text-primary"
                          }`}
                        >
                          🎬 Video Script
                        </button>
                        <button
                          onClick={() => setWriterPlatform("hook")}
                          className={`py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            writerPlatform === "hook"
                              ? "bg-purple-600/20 border-purple-500/50 text-purple-300"
                              : "bg-background/40 border-border text-text-muted hover:text-text-primary"
                          }`}
                        >
                          🪝 Viral Hooks
                        </button>
                        <button
                          onClick={() => setWriterPlatform("linkedin")}
                          className={`py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            writerPlatform === "linkedin"
                              ? "bg-purple-600/20 border-purple-500/50 text-purple-300"
                              : "bg-background/40 border-border text-text-muted hover:text-text-primary"
                          }`}
                        >
                          💼 LinkedIn
                        </button>
                      </div>
                    </div>

                    {/* Tone Selection */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono tracking-widest text-text-muted uppercase">
                        Select Tone of Voice
                      </label>
                      <select
                        value={writerTone}
                        onChange={(e) => setWriterTone(e.target.value)}
                        className="w-full text-xs bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:border-accent outline-none cursor-pointer"
                      >
                        <option value="viral">Viral & High-Energy (Hype)</option>
                        <option value="intellectual">Cinematic & Explainer (Insightful)</option>
                        <option value="humorous">Sarcastic & Witty (Retention Boost)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleStartWriting}
                    disabled={isWriting}
                    className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
                  >
                    <Wand2 className="w-4 h-4" />
                    {isWriting ? "Drafting with Stedtio AI..." : "Generate AI Script"}
                  </button>
                </div>

                {/* Editor Panel */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="flex-1 min-h-[350px] bg-background border border-border rounded-2xl p-6 font-mono text-xs overflow-y-auto max-h-[420px] relative shadow-inner">
                    <span className="absolute top-4 right-4 text-[9px] font-mono text-text-muted uppercase border border-border px-2 py-0.5 rounded">
                      Output Editor
                    </span>
                    {writerOutput ? (
                      <p className="whitespace-pre-line text-text-primary leading-relaxed">
                        {writerOutput}
                        {isWriting && <span className="inline-block w-1.5 h-4 bg-purple-400 ml-1 animate-pulse" />}
                      </p>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-text-muted italic gap-2 text-center p-8 select-none">
                        <Sparkles className="w-8 h-8 text-border animate-bounce" />
                        <p>Fill in parameters on the left and click Generate.</p>
                      </div>
                    )}
                  </div>

                  {/* Actions on Generated Script */}
                  {writerOutput && !isWriting && (
                    <div className="flex gap-4 animate-[fadeIn_0.2s_ease-out]">
                      <button
                        onClick={applyScriptToTimeline}
                        className="flex-1 py-3 bg-accent text-background font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:brightness-110"
                      >
                        <Layers className="w-4 h-4" />
                        Load Subtitles to Video Timeline
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(writerOutput);
                          alert("Draft copied to clipboard!");
                        }}
                        className="px-5 py-3 bg-surface border border-border text-text-primary font-bold text-xs rounded-xl hover:bg-border cursor-pointer transition-all"
                      >
                        Copy Clipboard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: THUMBNAIL GENERATOR */}
          {activeTab === "thumbnail" && (
            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Control Panel */}
                <div className="lg:col-span-5 rounded-2xl border border-border bg-surface p-6 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Header Text Overlay */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono tracking-widest text-text-muted uppercase">
                        Overlay Text (Hype hook)
                      </label>
                      <input
                        type="text"
                        value={thumbText}
                        onChange={(e) => setThumbText(e.target.value)}
                        className="w-full text-xs bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:border-accent outline-none"
                      />
                    </div>

                    {/* Badge Overlay */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono tracking-widest text-text-muted uppercase">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={badgeText}
                        onChange={(e) => setBadgeText(e.target.value)}
                        className="w-full text-xs bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:border-accent outline-none"
                      />
                    </div>

                    {/* Template Selection */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono tracking-widest text-text-muted uppercase">
                        Visual Background Style
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setThumbTemplate("cyber")}
                          className={`py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            thumbTemplate === "cyber"
                              ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                              : "bg-background/40 border-border text-text-muted hover:text-text-primary"
                          }`}
                        >
                          🔮 Neon Cyber
                        </button>
                        <button
                          onClick={() => setThumbTemplate("sunset")}
                          className={`py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            thumbTemplate === "sunset"
                              ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                              : "bg-background/40 border-border text-text-muted hover:text-text-primary"
                          }`}
                        >
                          🌅 Sunset Glow
                        </button>
                        <button
                          onClick={() => setThumbTemplate("minimal")}
                          className={`py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            thumbTemplate === "minimal"
                              ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                              : "bg-background/40 border-border text-text-muted hover:text-text-primary"
                          }`}
                        >
                          🔳 Dark Minimal
                        </button>
                        <button
                          onClick={() => setThumbTemplate("hype")}
                          className={`py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            thumbTemplate === "hype"
                              ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                              : "bg-background/40 border-border text-text-muted hover:text-text-primary"
                          }`}
                        >
                          🔥 Green Hype
                        </button>
                      </div>
                    </div>

                    {/* Face Cutout Option */}
                    <div className="flex items-center justify-between border-y border-border py-3 my-2 text-xs">
                      <span className="text-text-muted">Include expressive creator cutout</span>
                      <input
                        type="checkbox"
                        checked={showFaceCutout}
                        onChange={(e) => setShowFaceCutout(e.target.checked)}
                        className="w-4 h-4 accent-accent rounded cursor-pointer"
                      />
                    </div>

                    {/* Filters Sliders */}
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-text-muted">
                          <span>BRIGHTNESS</span>
                          <span>{brightness}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={brightness}
                          onChange={(e) => setBrightness(parseInt(e.target.value))}
                          className="w-full accent-accent h-1 bg-background rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-text-muted">
                          <span>CONTRAST</span>
                          <span>{contrast}%</span>
                        </div>
                        <input
                          type="range"
                          min="80"
                          max="160"
                          value={contrast}
                          onChange={(e) => setContrast(parseInt(e.target.value))}
                          className="w-full accent-accent h-1 bg-background rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-text-muted">
                          <span>BLUR BACKGROUND</span>
                          <span>{blurAmount}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={blurAmount}
                          onChange={(e) => setBlurAmount(parseInt(e.target.value))}
                          className="w-full accent-accent h-1 bg-background rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveThumbR2}
                    disabled={isSavingThumb}
                    className="w-full py-3.5 rounded-xl bg-accent text-background font-extrabold text-xs transition-all hover:brightness-110 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    {isSavingThumb ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Uploading Thumbnail to R2...
                      </>
                    ) : (
                      <>
                        <Cloud className="w-4 h-4" />
                        Export Thumbnail to R2
                      </>
                    )}
                  </button>
                </div>

                {/* Canvas Preview */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  {/* Outer Frame with aspect ratio */}
                  <div className="relative aspect-video rounded-2xl bg-[#09090b] border border-border overflow-hidden flex flex-col justify-between p-8 shadow-2xl">
                    
                    {/* Simulated Background Canvas */}
                    <div
                      className="absolute inset-0 z-0 transition-all duration-300"
                      style={{
                        background: thumbStyle.bg,
                        filter: thumbStyle.filter
                      }}
                    />

                    {/* Top Layer grid overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none z-5" />

                    {/* Canvas Inner elements - Badge (Top Left) */}
                    <div className="relative z-10">
                      {badgeText && (
                        <span className="bg-accent text-background font-black text-[10px] md:text-xs tracking-wider uppercase px-2.5 py-1 rounded shadow-lg border border-accent/20 select-none">
                          {badgeText}
                        </span>
                      )}
                    </div>

                    {/* Canvas Header Text (Mid Section) */}
                    <div className="relative z-10 my-auto max-w-[80%]">
                      <h2
                        className="text-2xl md:text-[38px] font-black font-display tracking-tight leading-[1.05] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] select-none uppercase -rotate-2 transform"
                        style={{ color: thumbStyle.textColor }}
                      >
                        {thumbText || "YOUR AI TEXT"}
                      </h2>
                    </div>

                    {/* Face Cutout illustration (Bottom Right) */}
                    {showFaceCutout && (
                      <div className="absolute bottom-0 right-4 w-[28%] aspect-4/5 bg-linear-to-t from-black via-zinc-800/20 to-transparent border-t border-x border-border rounded-t-3xl flex items-center justify-center z-10 overflow-hidden shadow-2xl">
                        {/* Glow Behind Creator */}
                        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-accent/10 blur-xl pointer-events-none" />
                        <div className="relative flex flex-col items-center select-none text-text-primary">
                          <span className="text-[32px] md:text-[44px] animate-bounce">😱</span>
                          <span className="text-[8px] font-mono opacity-50 tracking-wider">CREATOR</span>
                        </div>
                      </div>
                    )}

                    {/* Live Preview Border Overlay */}
                    <div className="absolute inset-0 border-4 border-dashed border-border/60 rounded-2xl pointer-events-none z-20" />
                    <span className="absolute bottom-2 left-3 text-[9px] font-mono text-[#F2F2F0]/40 z-20">
                      LIVE RENDER MOCKUP (16:9)
                    </span>
                  </div>

                  {/* Save Result Notification */}
                  {thumbSavedUrl && (
                    <div className="bg-surface border border-accent/20 rounded-xl p-4 text-[11px] font-mono select-all animate-[fadeIn_0.2s_ease-out] flex flex-col gap-1.5">
                      <p className="text-accent font-bold">Successfully Exported Cover Artwork to Cloudflare R2!</p>
                      <div className="flex items-center justify-between bg-background px-3 py-2 rounded border border-border">
                        <span className="truncate text-text-muted">{thumbSavedUrl}</span>
                        <a
                          href={thumbSavedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline flex items-center gap-1 shrink-0 ml-4 cursor-pointer"
                        >
                          View Link
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Global CSS keyframes for fade in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
