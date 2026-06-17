"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Video,
  PenTool,
  Image as ImageIcon,
  Sparkles,
  LogOut,
  Home,
  Wand2,
  Plus,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  RefreshCw,
  Loader2,
  ArrowRight,
} from "lucide-react";
import VideoUploadModal from "../../components/VideoUploadModal";





export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "video" | "writer" | "thumbnail">("overview");
  const [userName, setUserName] = useState("Creator");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Project list state
  interface ProjectItem { _id: string; name: string; status: string; originalFilename: string; createdAt: string; }
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("Stedtio_token") : null;
      const res = await fetch("http://localhost:5000/api/video/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setProjects(await res.json());
    } catch {}
    setLoadingProjects(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Auto-poll projects if any project is in progress (uploading, chunking, processing, rendering)
  useEffect(() => {
    const hasInProgress = projects.some((p) =>
      ["uploading", "chunking", "processing", "rendering"].includes(p.status)
    );
    if (!hasInProgress) return;

    const interval = setInterval(() => {
      fetchProjects();
    }, 3000);

    return () => clearInterval(interval);
  }, [projects]);

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
      {/* Upload Modal */}
      {showUploadModal && (
        <VideoUploadModal onClose={() => { setShowUploadModal(false); fetchProjects(); }} />
      )}

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
              Stedtio
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "video"
                  ? "bg-border text-text-primary"
                  : "text-text-muted hover:text-text-primary hover:bg-border/50"
              }`}
            >
              <Video className="w-4 h-4 text-[#db2777]" />
              Smart Video Editor
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
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-accent text-background font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all hover:brightness-110 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  New Video Project
                </button>
              </div>

              {/* Core Features Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Smart Video Editor Card */}
                <div className="relative group rounded-2xl border-2 border-accent bg-surface shadow-2xl p-6 flex flex-col justify-between overflow-hidden">
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
                    onClick={() => setShowUploadModal(true)}
                    className="w-full mt-8 py-2.5 rounded-lg bg-accent text-background font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110"
                  >
                    Upload & Start AI Edit
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
                      Draft eye-catching cover overlays. Select templates, adjust contrast, contrast badges, add creator face cutouts, and save directly to your workspace.
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

              {/* Recent Projects */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-primary">Recent Projects</h3>
                  <button onClick={fetchProjects} className="text-[10px] font-mono text-text-muted hover:text-accent transition-colors cursor-pointer flex items-center gap-1">
                    <RefreshCw className={`w-3 h-3 ${loadingProjects ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>

                {loadingProjects && projects.length === 0 && (
                  <div className="flex items-center gap-2 text-text-muted text-xs font-mono">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Loading projects…
                  </div>
                )}

                {!loadingProjects && projects.length === 0 && (
                  <div className="border border-dashed border-border rounded-xl p-8 text-center">
                    <Video className="w-8 h-8 text-text-muted mx-auto mb-3" />
                    <p className="text-sm text-text-muted">No projects yet</p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="mt-3 text-xs text-accent hover:underline cursor-pointer"
                    >
                      Upload your first video →
                    </button>
                  </div>
                )}

                {projects.length > 0 && (
                  <div className="space-y-2">
                    {projects.map((proj) => {
                      const statusColor: Record<string, string> = {
                        done: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                        review: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                        processing: "text-accent bg-accent/10 border-accent/20",
                        chunking: "text-orange-400 bg-orange-500/10 border-orange-500/20",
                        error: "text-red-400 bg-red-500/10 border-red-500/20",
                        rendering: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                      };
                      const sc = statusColor[proj.status] || "text-text-muted bg-border border-border";
                      return (
                        <Link
                          key={proj._id}
                          href={`/dashboard/editor/${proj._id}`}
                          className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-surface hover:border-accent/30 hover:bg-accent/3 transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                              <Video className="w-4 h-4 text-accent" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-text-primary truncate">{proj.name}</p>
                              <p className="text-[10px] font-mono text-text-muted">
                                {new Date(proj.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${sc}`}>
                              {proj.status}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}


          {/* TAB 2: SMART VIDEO EDITOR */}
          {activeTab === "video" && (
            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold font-display text-text-primary tracking-tight">
                    Smart Video Editor Projects
                  </h2>
                  <p className="text-xs text-text-muted mt-1">
                    Select a project to review and edit AI decisions, or upload a new video.
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2.5 bg-accent text-background font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all hover:brightness-110 cursor-pointer shadow-lg shadow-accent/10"
                >
                  <Plus className="w-4 h-4" />
                  New Video Project
                </button>
              </div>

              {loadingProjects && projects.length === 0 && (
                <div className="flex items-center gap-2 text-text-muted text-xs font-mono py-8">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  Loading your video projects…
                </div>
              )}

              {!loadingProjects && projects.length === 0 && (
                <div className="border border-dashed border-border rounded-2xl p-12 text-center bg-surface/50">
                  <Video className="w-10 h-10 text-text-muted mx-auto mb-4" />
                  <h3 className="text-sm font-bold text-text-primary">No video edits yet</h3>
                  <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                    Upload a raw video, and Stedtio AI will automatically split scenes, remove silent gaps, transcribe dialogue, and create caption clips for your review.
                  </p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="mt-4 px-4 py-2 bg-accent text-background font-bold text-xs rounded-lg hover:brightness-110 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Upload Video
                  </button>
                </div>
              )}

              {projects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Upload Card */}
                  <div
                    onClick={() => setShowUploadModal(true)}
                    className="group border border-dashed border-border hover:border-accent/40 bg-surface/40 hover:bg-accent/3 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all gap-3 select-none min-h-[160px]"
                  >
                    <div className="w-11 h-11 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">New Video Project</p>
                      <p className="text-[10px] text-text-muted mt-1">Start editing a new video</p>
                    </div>
                  </div>

                  {projects.map((proj) => {
                    const statusColor: Record<string, string> = {
                      done: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                      review: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                      processing: "text-accent bg-accent/10 border-accent/20",
                      chunking: "text-orange-400 bg-orange-500/10 border-orange-500/20",
                      error: "text-red-400 bg-red-500/10 border-red-500/20",
                      rendering: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                    };
                    const sc = statusColor[proj.status] || "text-text-muted bg-border border-border";
                    const isProcessing = ["chunking", "processing", "rendering"].includes(proj.status);
                    
                    return (
                      <div
                        key={proj._id}
                        className="bg-surface border border-border hover:border-accent/30 rounded-2xl p-5 flex flex-col justify-between transition-all group min-h-[160px]"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                              <Video className="w-4 h-4 text-accent" />
                            </div>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border leading-none uppercase ${sc}`}>
                              {proj.status}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-text-primary truncate" title={proj.name}>
                              {proj.name}
                            </h4>
                            <p className="text-[10px] font-mono text-text-muted mt-1">
                              Created {new Date(proj.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Processing or Actions */}
                        <div className="mt-4 pt-3 border-t border-border/50">
                          {isProcessing ? (
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-[9px] font-mono text-text-muted">
                                <span>AI Pipeline Working...</span>
                              </div>
                              <div className="h-1 bg-border rounded-full overflow-hidden">
                                <div className="h-full bg-accent rounded-full animate-[pulse_1.5s_infinite]" style={{ width: "60%" }} />
                              </div>
                            </div>
                          ) : (
                            <Link
                              href={`/dashboard/editor/${proj._id}`}
                              className="w-full py-2 rounded-lg bg-border hover:bg-accent hover:text-background text-text-primary text-[10px] font-bold transition-all flex items-center justify-center gap-1 group/btn"
                            >
                              Open Smart Editor
                              <ArrowRight className="w-3 h-3 text-text-muted group-hover/btn:text-background group-hover/btn:translate-x-0.5 transition-all" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                        onClick={() => {
                          navigator.clipboard.writeText(writerOutput);
                          alert("Draft copied to clipboard!");
                        }}
                        className="w-full py-3 bg-accent text-background font-extrabold text-xs rounded-xl hover:brightness-110 cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        Copy Script to Clipboard
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
                        Saving Cover Artwork...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Save Cover Artwork
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
                      <p className="text-accent font-bold">Successfully generated cover artwork!</p>
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
