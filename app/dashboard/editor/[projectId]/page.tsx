"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Play, Pause, CheckCircle, XCircle, Download,
  Loader2, Scissors, Sparkles, RefreshCw, AlertCircle,
  FileText, Cloud, Home, StopCircle, Upload, Video
} from "lucide-react";
import ClipDiscoveryScreen from "@/components/ClipDiscoveryScreen";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Caption {
  text: string;
  start: number;
  end: number;
  words?: { word: string; start: number; end: number }[];
}

interface FillerWord {
  word: string;
  time: number;
}

interface EditManifest {
  keep: [number, number][];
  keepGlobal: [number, number][];
  captions: Caption[];
  score: number;
  highlights: string[];
  fillerWords: FillerWord[];
}

interface Chunk {
  id?: string;
  _id?: string;
  index: number;
  startTime: number;
  endTime: number;
  duration: number;
  transcript: string;
  editManifest: EditManifest;
  userKeep: boolean;
  words?: { word: string; start: number; end: number }[];
  yoloLabels?: string[];
  assetId?: string;
  assetKey?: string;
}

interface Asset {
  _id: string;
  key: string;
  filename: string;
  mimeType: string;
  url: string;
  order: number;
  status: "pending" | "processing" | "done" | "error";
  errorMessage?: string;
}

interface Project {
  _id: string;
  name: string;
  status: string;
  progress: number;
  chunks: Chunk[];
  globalManifest: { totalDuration: number; keepRanges: [number, number][]; captions: Caption[] };
  finalKey: string;
  captionsKey: string;
  errorMessage?: string;
  originalKey?: string;
  finalCaptions?: Caption[];
  captionStyle?: "kinetic" | "karaoke" | "minimal";
  captionSize?: "small" | "medium" | "large" | "xlarge";
  captionFontSize?: number;
  captionsEnabled?: boolean;
  aiEnriched?: boolean;
  assets?: Asset[];
  clip_recommendations?: {
    label: "short_form" | "long_form" | "hook_moment";
    segment_id: string;
    start_time: number;
    end_time: number;
    confidence: number;
    display_reason: string;
    clip_url: string;
    thumbnail_url: string;
    status: string;
  }[];
}

interface SSEEvent {
  status?: string;
  progress?: number;
  message?: string;
  finalKey?: string;
  captionsKey?: string;
  finalCaptions?: Caption[];
  type?: string;
  chunk?: Chunk;
}

const API = "http://localhost:5000";

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("Stedtio_token") || "";
}

// ─── Pipeline Stages ──────────────────────────────────────────────────────────
const STAGES = [
  { key: "uploading", label: "Upload", icon: Cloud, color: "text-blue-400" },
  { key: "chunking", label: "Scene Detection", icon: Scissors, color: "text-orange-400" },
  { key: "processing", label: "AI Processing", icon: Sparkles, color: "text-purple-400" },
  { key: "review", label: "Ready for Review", icon: CheckCircle, color: "text-emerald-400" },
];

function stageIndex(status: string) {
  const map: Record<string, number> = { uploading: 0, chunking: 1, processing: 2, review: 3, done: 3, rendering: 3 };
  return map[status] ?? 0;
}

const NOTICES = [
  "We are working, just chill and watch Netflix 🍿",
  "Polishing frames, grab a coffee ☕",
  "Removing silent pauses, enjoy the peace 🤫",
  "Transcribing speech, testing our spelling 📝",
  "Splicing clips together, almost there 🎬",
  "Tuning audio levels, check your speakers 🔊"
];

function FunnyNotice() {
  const [notice, setNotice] = useState(NOTICES[0]);
  useEffect(() => {
    const interval = setInterval(() => {
      setNotice(prev => {
        const nextIdx = (NOTICES.indexOf(prev) + 1) % NOTICES.length;
        return NOTICES[nextIdx];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-[10px] text-accent/90 font-mono mt-3 bg-accent/5 border border-accent/20 rounded-xl px-4 py-2.5 select-none inline-block animate-pulse">
      {notice}
    </p>
  );
}

// ─── Processing View ──────────────────────────────────────────────────────────
function ProcessingView({ sse, projectName, onCancel, isCancelling }: { sse: SSEEvent | null; projectName: string; onCancel: () => void; isCancelling: boolean }) {
  const currentStage = stageIndex(sse?.status || "uploading");

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-10">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary font-display">{projectName}</h2>
        <p className="text-sm text-text-muted mt-2">AI pipeline is processing your video…</p>
        <FunnyNotice />
      </div>

      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-0">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const done = i < currentStage;
            const active = i === currentStage;
            return (
              <React.Fragment key={stage.key}>
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                    done ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                    active ? "bg-accent/20 border-accent text-accent animate-pulse" :
                    "bg-background/40 border-border text-text-muted"
                  }`}>
                    {active ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-[10px] font-mono text-center whitespace-nowrap ${active ? "text-accent font-bold" : done ? "text-emerald-400" : "text-text-muted"}`}>
                    {stage.label}
                  </span>
                </div>
                {i < STAGES.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-500 ${i < currentStage ? "bg-emerald-500" : "bg-border"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-lg space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-mono text-text-muted">{sse?.message || "Initializing…"}</span>
          <span className="text-xs font-mono text-accent font-bold">{sse?.progress || 0}%</span>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-accent to-purple-500 rounded-full transition-all duration-700"
            style={{ width: `${sse?.progress || 0}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-lg text-center">
        {[
          { label: "Silence Removal", desc: "Trimming quiet gaps", icon: "✂️" },
          { label: "Transcription", desc: "AI speech-to-text", icon: "🎤" },
          { label: "AI Decisions", desc: "Smart keep & cut logic", icon: "✨" },
        ].map(item => (
          <div key={item.label} className="bg-surface border border-border rounded-xl p-4">
            <div className="text-2xl mb-2">{item.icon}</div>
            <p className="text-xs font-bold text-text-primary">{item.label}</p>
            <p className="text-[10px] font-mono text-text-muted mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onCancel}
        disabled={isCancelling}
        className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs rounded-xl hover:bg-red-500/20 hover:border-red-500/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
      >
        {isCancelling ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling…</>
        ) : (
          <><StopCircle className="w-3.5 h-3.5" /> Stop Processing</>
        )}
      </button>
    </div>
  );
}

// ─── Error View ───────────────────────────────────────────────────────────────
function ErrorView({ message }: { message: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-red-400">Pipeline Failed</h2>
        <p className="text-sm text-text-muted mt-2 max-w-md font-mono">{message}</p>
      </div>
      <Link href="/dashboard" className="px-6 py-2.5 bg-border rounded-lg text-sm font-semibold text-text-primary hover:bg-border/80 transition-colors">
        Back to Dashboard
      </Link>
    </div>
  );
}

// ─── Render Done View ─────────────────────────────────────────────────────────
function RenderDoneView({ project, onReEdit }: { project: Project; onReEdit: () => Promise<void> }) {
  const [isReEditing, setIsReEditing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoPlay, setVideoPlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const captionStyle = project.captionStyle || "kinetic";
  const captionFontSize = project.captionFontSize || 24;
  const finalCaptions = project.finalCaptions || [];

  const activeCaption = finalCaptions.find(
    (cap) => currentTime >= cap.start && currentTime <= cap.end
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => setCurrentTime(video.currentTime);
    const onEnd = () => setVideoPlay(false);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnd);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnd);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (videoPlay) video.play().catch(() => setVideoPlay(false));
    else video.pause();
  }, [videoPlay]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8 overflow-y-auto w-full">
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-emerald-400" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary font-display">Your video is ready! 🎉</h2>
        <p className="text-sm text-text-muted mt-2">Saved successfully · {project.name}</p>
      </div>

      {project.finalKey && (
        <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden bg-black border border-border group">
          <video
            ref={videoRef}
            src={`${API}/api/assets/${project.finalKey}`}
            className="w-full h-full object-contain cursor-pointer"
            playsInline
            onClick={() => setVideoPlay((v) => !v)}
          />
          {activeCaption && (
            <div className="absolute bottom-12 left-6 right-6 z-20 flex justify-center text-center pointer-events-none">
              <div className="relative pointer-events-auto inline-block select-none">
                {captionStyle === "kinetic" && (
                  <span style={{ fontSize: `${captionFontSize}px`, lineHeight: "1.2" }}
                    className="font-black uppercase tracking-wide bg-accent text-background px-3.5 py-1.5 rounded-lg shadow-xl shadow-black/60 -rotate-1 inline-block max-w-[90%]">
                    {activeCaption.text}
                  </span>
                )}
                {captionStyle === "karaoke" && (
                  <div style={{ fontSize: `${captionFontSize}px`, lineHeight: "1.2" }}
                    className="font-bold bg-surface/90 text-text-primary px-4 py-2 rounded-xl border border-border shadow-xl flex flex-wrap justify-center gap-x-1.5 max-w-[90%] font-display">
                    {activeCaption.text.split(" ").map((word, wIdx) => {
                      const duration = activeCaption.end - activeCaption.start;
                      const rawProgress = duration > 0 ? (currentTime - activeCaption.start) / duration : 0;
                      const progress = Math.max(0, Math.min(1, rawProgress));
                      const words = activeCaption.text.split(" ");
                      const activeWordIndex = Math.min(Math.floor(progress * words.length), words.length - 1);
                      return (
                        <span key={wIdx} className={`transition-all duration-100 ${wIdx === activeWordIndex ? "text-accent scale-110 font-extrabold" : "opacity-80"}`}>
                          {word}
                        </span>
                      );
                    })}
                  </div>
                )}
                {captionStyle === "minimal" && (
                  <span style={{ fontSize: `${captionFontSize}px`, lineHeight: "1.2" }}
                    className="font-medium text-text-primary px-3 py-1 bg-black/40 backdrop-blur-sm rounded-md max-w-[85%] border border-border/30 inline-block">
                    {activeCaption.text}
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 cursor-pointer pointer-events-none">
            <button
              className="w-14 h-14 rounded-full bg-accent text-background flex items-center justify-center shadow-lg hover:scale-105 transition-transform pointer-events-auto cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setVideoPlay((v) => !v); }}
            >
              {videoPlay ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4 flex-wrap justify-center">
        {project.finalKey && (
          <a
            href={`${API}/api/assets/${project.finalKey}?download=true`}
            download="final.mp4"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-accent text-background font-bold text-sm rounded-xl hover:brightness-110 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Video
          </a>
        )}
        {project.captionsKey && (
          <a
            href={`${API}/api/assets/${project.captionsKey}?download=true`}
            download="captions.srt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-surface border border-border text-text-primary font-semibold text-sm rounded-xl hover:bg-border transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Download Subtitles
          </a>
        )}
        <button
          onClick={async () => {
            setIsReEditing(true);
            await onReEdit();
            setIsReEditing(false);
          }}
          disabled={isReEditing}
          className="flex items-center gap-2 px-6 py-3 bg-surface border border-border text-text-primary font-semibold text-sm rounded-xl hover:bg-border transition-all cursor-pointer disabled:opacity-50"
        >
          {isReEditing ? (
            <Loader2 className="w-4 h-4 animate-spin text-accent" />
          ) : (
            <Scissors className="w-4 h-4 text-accent" />
          )}
          Re-open Editor
        </button>
      </div>

      <Link href="/dashboard" className="text-xs text-text-muted hover:text-accent transition-colors font-mono">
        ← Back to dashboard
      </Link>
    </div>
  );
}

// ─── Timeline Review View (NLE-style) ────────────────────────────────────────
function TimelineReview({
  project,
  onApprove,
  isRendering,
  initialSelectedChunkId,
  initialStartTime,
  onEnableCaptions,
}: {
  project: Project;
  onApprove: (chunks: Chunk[], style: "kinetic" | "karaoke" | "minimal", size: "small" | "medium" | "large" | "xlarge", fontSize: number) => void;
  isRendering: boolean;
  initialSelectedChunkId?: string;
  initialStartTime?: number;
  onEnableCaptions: () => Promise<void>;
}) {
  // Backend sometimes sends wrong startTimes (all 0, or wrong multiples).
  // Sort by chunk.index, recompute sequential startTimes from durations, map back to original order.
  const normalizeChunkTimes = (raw: Chunk[]): Chunk[] => {
    if (raw.length <= 1) return raw;
    const sorted = [...raw].sort((a, b) => a.index - b.index);
    const isSequential = sorted.every(
      (c, i) => i === 0 || c.startTime >= sorted[i - 1].endTime - 0.01
    );
    if (isSequential) return raw;
    let elapsed = 0;
    const timeMap = new Map<number, { startTime: number; endTime: number }>();
    for (const c of sorted) {
      timeMap.set(c.index, { startTime: elapsed, endTime: elapsed + c.duration });
      elapsed += c.duration;
    }
    return raw.map(c => ({ ...c, ...timeMap.get(c.index) }));
  };

  const [chunks, setChunks] = useState<Chunk[]>(() => normalizeChunkTimes(project.chunks || []));
  const [prevProjectChunks, setPrevProjectChunks] = useState<Chunk[]>(project.chunks || []);

  if (project.chunks !== prevProjectChunks) {
    setPrevProjectChunks(project.chunks);
    setChunks((prev) => {
      const merged = project.chunks.map((pc, idx) => {
        const prevChunk = prev[idx];
        if (!prevChunk) return pc;
        return {
          ...prevChunk,
          yoloLabels: pc.yoloLabels || prevChunk.yoloLabels,
          editManifest: {
            ...prevChunk.editManifest,
            ...pc.editManifest,
            score: pc.editManifest?.score ?? prevChunk.editManifest?.score,
            keep: pc.editManifest?.keep || prevChunk.editManifest?.keep,
            keepGlobal: pc.editManifest?.keepGlobal || prevChunk.editManifest?.keepGlobal,
            captions: pc.editManifest?.captions || prevChunk.editManifest?.captions || [],
          },
          userKeep: pc.userKeep !== undefined ? pc.userKeep : prevChunk.userKeep,
        };
      });
      return normalizeChunkTimes(merged);
    });
  }

  const [selectedChunk, setSelectedChunk] = useState<number | null>(() => {
    if (initialSelectedChunkId) {
      const idx = (project.chunks || []).findIndex(c => c.id === initialSelectedChunkId || c._id === initialSelectedChunkId);
      if (idx !== -1) return idx;
    }
    // Default to first chunk so activeChunk is never null during playback.
    // Without this, handleTimeUpdate → auto-select → assetKey change → play interrupted.
    return (project.chunks || []).length > 0 ? 0 : null;
  });
  const THUMB_KEY = `edito-thumbs-${project._id}`;
  const TIME_KEY  = `edito-time-${project._id}`;

  const [videoPlay, setVideoPlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => {
    if (initialStartTime) return initialStartTime;
    try { return parseFloat(sessionStorage.getItem(TIME_KEY) || '0') || 0; } catch { return 0; }
  });
  const [skipCuts, setSkipCuts] = useState(true);
  const [captionStyle] = useState<"kinetic" | "karaoke" | "minimal">(project.captionStyle || "kinetic");
  const [captionSize] = useState<"small" | "medium" | "large" | "xlarge">(project.captionSize || "medium");
  const [captionFontSize, setCaptionFontSize] = useState<number>(project.captionFontSize || 24);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playWhenReadyRef = useRef(false);
  // Holds the asset-relative seek time that handleLoadedMetadata should use.
  // Set synchronously before a src-change so React stale state can't corrupt the seek.
  const pendingSeekRef = useRef<number | null>(null);
  // True when thumbnails are already loaded (either from sessionStorage or just generated)
  const thumbsReady = useRef(
    (() => { try { return !!sessionStorage.getItem(`edito-thumbs-${project._id}`); } catch { return false; } })()
  );
  const [videoLoading, setVideoLoading] = useState(true);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>(() => {
    try {
      const raw = sessionStorage.getItem(THUMB_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (err) { console.warn("Failed to restore thumbnails:", err); return {}; }
  });

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDiff, setAiDiff] = useState<string[]>([]);

  // Drag-drop reorder state
  const [draggedChunkIdx, setDraggedChunkIdx] = useState<number | null>(null);
  const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);
  const [showCutClips, setShowCutClips] = useState(true);

  const activeChunk = selectedChunk !== null && chunks[selectedChunk] ? chunks[selectedChunk] : null;
  const currentKeepRange = activeChunk?.editManifest?.keep?.[0] || [0, activeChunk?.duration || 0];
  const [trimStart, trimEnd] = currentKeepRange;

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const saveChunksToBackend = (updatedChunks: Chunk[]) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;
      try {
        const keepRanges: [number, number][] = [];
        const captions: Caption[] = [];
        let totalDuration = 0;
        for (const chunk of updatedChunks) {
          if (chunk.userKeep !== false) {
            if (chunk.editManifest?.keepGlobal) keepRanges.push(...chunk.editManifest.keepGlobal);
            if (chunk.editManifest?.captions) captions.push(...chunk.editManifest.captions);
          }
          totalDuration = Math.max(totalDuration, chunk.endTime);
        }
        await fetch(`${API}/api/video/${project._id}/manifest`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({ chunks: updatedChunks, globalManifest: { totalDuration, keepRanges, captions } }),
        });
      } catch (err) {
        console.error("Failed to auto-save manifest:", err);
      }
    }, 1000);
  };

  // Caption resize drag
  const dragStartRef = useRef<{ x: number; y: number; size: number } | null>(null);
  const handleResizeEndRef = useRef<(() => void) | null>(null);
  const isResizingRef = useRef(false);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const newSize = Math.max(12, Math.min(120, dragStartRef.current.size + deltaX * 0.25));
    setCaptionFontSize(Math.round(newSize));
  }, []);

  const handleResizeEnd = useCallback(() => {
    dragStartRef.current = null;
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleResizeMove);
    if (handleResizeEndRef.current) document.removeEventListener("mouseup", handleResizeEndRef.current);
  }, [handleResizeMove]);

  useEffect(() => { handleResizeEndRef.current = handleResizeEnd; }, [handleResizeEnd]);

  const handleResizeStart = (e: React.MouseEvent) => {
    if (isResizingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY, size: captionFontSize };
    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      if (handleResizeEndRef.current) document.removeEventListener("mouseup", handleResizeEndRef.current);
    };
  }, [handleResizeMove]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // Use chunks as source of truth; globalManifest.totalDuration can be stale
  const totalDuration = chunks.reduce((s, c) => Math.max(s, c.endTime), 0) || project.globalManifest?.totalDuration || 0;
  const keptCount = chunks.filter(c => c.userKeep !== false).length;

  const activeCaption = chunks
    .filter(c => c.userKeep !== false)
    .flatMap(c => {
      const keepRanges = c.editManifest?.keep || [];
      const captions = c.editManifest?.captions || [];
      if (keepRanges.length === 0) return captions;
      return captions.filter(cap => {
        const relStart = cap.start - c.startTime;
        const relEnd = cap.end - c.startTime;
        return keepRanges.some(([s, e]) => relStart <= e && relEnd >= s);
      });
    })
    .find(cap => currentTime >= cap.start && currentTime <= cap.end);

  const getAssetTime = (globalTime: number, chunk: Chunk): number => {
    const assetChunks = chunks.filter(c => c.assetId === chunk.assetId);
    if (assetChunks.length === 0) return 0;
    const assetStart = Math.min(...assetChunks.map(c => c.startTime));
    return globalTime - assetStart;
  };

  const getGlobalTime = (assetTime: number, chunk: Chunk): number => {
    const assetChunks = chunks.filter(c => c.assetId === chunk.assetId);
    if (assetChunks.length === 0) return assetTime;
    const assetStart = Math.min(...assetChunks.map(c => c.startTime));
    return assetStart + assetTime;
  };

  // Resolve the R2 key for any chunk, with fallback chain:
  // chunk.assetKey → project.assets[assetId].key → project.originalKey → first asset key
  const resolveAssetKey = (chunk: Chunk | null): string => {
    if (!chunk) return project.originalKey || project.assets?.[0]?.key || '';
    if (chunk.assetKey) return chunk.assetKey;
    if (chunk.assetId && project.assets) {
      const asset = project.assets.find(a => a._id === chunk.assetId);
      if (asset?.key) return asset.key;
    }
    return project.originalKey || project.assets?.[0]?.key || '';
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (!activeChunk) {
      // No chunk selected yet — use raw video time so the scrubber moves
      setCurrentTime(video.currentTime);
      return;
    }

    const assetTime = video.currentTime;

    // Skip spurious 0-time events that fire during seeks to non-zero positions
    const targetAssetTime = getAssetTime(currentTime, activeChunk);
    if (assetTime === 0 && targetAssetTime > 0.5) return;

    const time = getGlobalTime(assetTime, activeChunk);
    setCurrentTime(time);

    if (!skipCuts) return;

    const currentChunkIdx = chunks.findIndex(c => time >= c.startTime && time < c.endTime);
    if (currentChunkIdx >= 0) {
      const currentChunk = chunks[currentChunkIdx];
      if (currentChunk.userKeep === false) {
        const nextKeptChunk = chunks.slice(currentChunkIdx + 1).find(c => c.userKeep !== false);
        if (nextKeptChunk) {
          const nextRanges = nextKeptChunk.editManifest?.keep || [];
          const nextStartOffset = nextRanges.length > 0 ? nextRanges[0][0] : 0;
          const nextGlobalTime = nextKeptChunk.startTime + nextStartOffset;
          const nextAssetTime = getAssetTime(nextGlobalTime, nextKeptChunk);
          if (nextKeptChunk.assetId === currentChunk.assetId) {
            video.currentTime = nextAssetTime;
            setCurrentTime(nextGlobalTime);
          } else {
            // Different asset: set pendingSeekRef synchronously before React state updates
            // so handleLoadedMetadata gets the right seek time even with stale state
            pendingSeekRef.current = nextAssetTime;
            playWhenReadyRef.current = true;
            setCurrentTime(nextGlobalTime);
            setSelectedChunk(nextKeptChunk.index);
          }
        } else {
          video.pause();
          setVideoPlay(false);
        }
      } else {
        const keepRanges = currentChunk.editManifest?.keep || [];
        if (keepRanges.length > 0) {
          const relTime = time - currentChunk.startTime;
          // Use a small epsilon to absorb floating-point drift after split operations
          // (e.g. keep end stored as 3.763406999999 but relTime reads 3.763407000001)
          const KEEP_EPS = 0.05;
          const currentRange = keepRanges.find(([s, e]) => relTime >= s - KEEP_EPS && relTime <= e + KEEP_EPS);
          if (!currentRange) {
            const nextRange = keepRanges.find(([s]) => s > relTime);
            if (nextRange) {
              const nextGlobalTime = currentChunk.startTime + nextRange[0];
              video.currentTime = getAssetTime(nextGlobalTime, currentChunk);
              setCurrentTime(nextGlobalTime);
            } else {
              const nextKeptChunk = chunks.slice(currentChunkIdx + 1).find(c => c.userKeep !== false);
              if (nextKeptChunk) {
                const nextRanges = nextKeptChunk.editManifest?.keep || [];
                const nextStartOffset = nextRanges.length > 0 ? nextRanges[0][0] : 0;
                const nextGlobalTime = nextKeptChunk.startTime + nextStartOffset;
                const nextAssetTime = getAssetTime(nextGlobalTime, nextKeptChunk);
                if (nextKeptChunk.assetId === currentChunk.assetId) {
                  video.currentTime = nextAssetTime;
                  setCurrentTime(nextGlobalTime);
                } else {
                  pendingSeekRef.current = nextAssetTime;
                  playWhenReadyRef.current = true;
                  setCurrentTime(nextGlobalTime);
                  setSelectedChunk(nextKeptChunk.index);
                }
              } else {
                video.pause();
                setVideoPlay(false);
              }
            }
          }
        }
      }
    }
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (!activeChunk) return;
    // pendingSeekRef is set synchronously before src changes so React's stale
    // currentTime state can't cause the video to reset to 0 on asset switch.
    const targetTime = pendingSeekRef.current !== null
      ? pendingSeekRef.current
      : Math.max(0, getAssetTime(currentTime, activeChunk));
    pendingSeekRef.current = null;
    if (Math.abs(video.currentTime - targetTime) > 0.15) {
      video.currentTime = targetTime;
    }
  };

  const handleCanPlay = () => {
    if (playWhenReadyRef.current && videoRef.current) {
      playWhenReadyRef.current = false;
      videoRef.current.play().catch((err: Error) => {
        if (err.name !== 'AbortError') console.error("Playback failed:", err);
        setVideoPlay(false);
      });
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (videoPlay) {
      video.play().catch((err: Error) => {
        if (err.name === 'AbortError') {
          // Interrupted by src change or seek — resume when canplay fires
          playWhenReadyRef.current = true;
        } else {
          setVideoPlay(false);
        }
      });
    } else {
      playWhenReadyRef.current = false;
      video.pause();
    }
  }, [videoPlay, resolveAssetKey(activeChunk)]);

  useEffect(() => {
    const active = chunks.findIndex(c => currentTime >= c.startTime && currentTime < c.endTime);
    if (active >= 0 && active !== selectedChunk) {
      const timer = setTimeout(() => setSelectedChunk(active), 0);
      return () => clearTimeout(timer);
    }
  }, [currentTime, chunks, selectedChunk]);

  // Persist playhead position so it survives page refresh
  useEffect(() => {
    try { sessionStorage.setItem(TIME_KEY, String(currentTime)); } catch { /* quota */ }
  }, [currentTime, TIME_KEY]);

  // Persist thumbnails to sessionStorage so they survive page refresh
  useEffect(() => {
    if (Object.keys(thumbnails).length === 0) return;
    try { sessionStorage.setItem(THUMB_KEY, JSON.stringify(thumbnails)); } catch { /* quota */ }
  }, [thumbnails, THUMB_KEY]);

  // Generate video frame thumbnails for timeline clips
  useEffect(() => {
    if (!chunks.length) return;
    // Skip if we already have enough thumbnails (e.g. restored from sessionStorage)
    if (thumbsReady.current) return;
    thumbsReady.current = true;

    // Group chunks by resolved asset key (with full fallback chain)
    const assetGroups = new Map<string, Array<{ chunk: Chunk; idx: number }>>();
    chunks.forEach((chunk, idx) => {
      const key = resolveAssetKey(chunk);
      if (!key) return;
      if (!assetGroups.has(key)) assetGroups.set(key, []);
      assetGroups.get(key)!.push({ chunk, idx });
    });

    assetGroups.forEach((allItems, assetKey) => {
      // Cap per-asset to avoid 54-second waits on large projects;
      // prioritise kept clips and spread across the asset's duration
      const kept = allItems.filter(it => it.chunk.userKeep !== false);
      const MAX = 50;
      const stride = Math.max(1, Math.ceil(kept.length / MAX));
      const items = kept.filter((_, i) => i % stride === 0).slice(0, MAX);

      if (!items.length) return;

      const vid = document.createElement('video');
      vid.muted = true;
      vid.crossOrigin = 'anonymous';
      vid.preload = 'metadata';

      const processQueue = (queue: typeof items) => {
        if (!queue.length) { vid.src = ''; return; }
        const [{ chunk, idx }, ...rest] = queue;
        // Use getAssetTime so multi-asset projects seek to the correct position within each file
        const seekTime = Math.max(0.05, getAssetTime(chunk.startTime + 0.1, chunk));

        vid.addEventListener('seeked', () => {
          const canvas = document.createElement('canvas');
          canvas.width = 120; canvas.height = 68;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            try {
              ctx.drawImage(vid, 0, 0, 120, 68);
              const url = canvas.toDataURL('image/jpeg', 0.55);
              setThumbnails(prev => ({ ...prev, [idx]: url }));
            } catch { /* CORS-tainted canvas */ }
          }
          // Small delay between seeks so the browser can breathe
          setTimeout(() => processQueue(rest), 20);
        }, { once: true });

        vid.currentTime = seekTime;
      };

      vid.addEventListener('loadedmetadata', () => processQueue(items), { once: true });
      vid.src = `${API}/api/assets/${encodeURI(assetKey)}`;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chunks.length]);

  const toggleChunk = (idx: number) => {
    const updated = chunks.map((c, i) => i === idx ? { ...c, userKeep: !c.userKeep } : c);
    setChunks(updated);
    saveChunksToBackend(updated);
  };

  const editCaption = (chunkIdx: number, capIdx: number, text: string) => {
    const updated = chunks.map((c, i) => {
      if (i !== chunkIdx) return c;
      const captions = [...(c.editManifest?.captions || [])];
      captions[capIdx] = { ...captions[capIdx], text };
      return { ...c, editManifest: { ...c.editManifest, captions } };
    });
    setChunks(updated);
    saveChunksToBackend(updated);
  };

  const handleTrimChange = (startVal: number, endVal: number) => {
    if (selectedChunk === null) return;
    const updated = chunks.map((c, i) => {
      if (i !== selectedChunk) return c;
      const keep = [[startVal, endVal]] as [number, number][];
      const keepGlobal = keep.map(([s, e]) => [c.startTime + s, c.startTime + e]) as [number, number][];
      return { ...c, editManifest: { ...c.editManifest, keep, keepGlobal } };
    });
    setChunks(updated);
    saveChunksToBackend(updated);
  };

  const handleSplitChunk = () => {
    if (selectedChunk === null) return;
    const chunk = chunks[selectedChunk];
    const relTime = currentTime - chunk.startTime;
    const splitBoundary = Math.min(0.5, chunk.duration * 0.1);
    if (relTime <= splitBoundary || relTime >= chunk.duration - splitBoundary) {
      alert("Cannot split so close to the boundaries of the segment.");
      return;
    }

    const splitAt = chunk.startTime + relTime;
    const chunkA: Chunk = { ...chunk, index: selectedChunk, endTime: splitAt, duration: relTime, userKeep: chunk.userKeep };
    const chunkB: Chunk = { ...chunk, index: selectedChunk + 1, startTime: splitAt, endTime: chunk.endTime, duration: chunk.duration - relTime, userKeep: chunk.userKeep };

    const wordsA = (chunk.words || []).filter((w) => w.start < relTime);
    const wordsB = (chunk.words || []).filter((w) => w.start >= relTime).map((w) => ({ ...w, start: w.start - relTime, end: w.end - relTime }));
    chunkA.words = wordsA;
    chunkB.words = wordsB;
    chunkA.transcript = wordsA.map((w) => w.word).join(" ");
    chunkB.transcript = wordsB.map((w) => w.word).join(" ");

    const keepA: [number, number][] = [];
    const keepB: [number, number][] = [];
    const keep = chunk.editManifest?.keep || [[0, chunk.duration]];
    for (const [s, e] of keep) {
      if (e <= relTime) keepA.push([s, e]);
      else if (s >= relTime) keepB.push([s - relTime, e - relTime]);
      else { keepA.push([s, relTime]); keepB.push([0, e - relTime]); }
    }
    // Clamp boundaries to exact chunk durations to eliminate floating-point drift
    const durationA = relTime;
    const durationB = chunk.duration - relTime;
    if (keepA.length > 0) keepA[keepA.length - 1][1] = durationA;
    if (keepB.length > 0) { keepB[0][0] = 0; keepB[keepB.length - 1][1] = durationB; }

    const captionsA: Caption[] = [];
    const captionsB: Caption[] = [];
    for (const cap of chunk.editManifest?.captions || []) {
      const capStartRel = cap.start - chunk.startTime;
      const capEndRel = cap.end - chunk.startTime;
      if (capEndRel <= relTime) captionsA.push(cap);
      else if (capStartRel >= relTime) captionsB.push({ ...cap });
      else {
        captionsA.push({ ...cap, end: chunk.startTime + relTime });
        captionsB.push({ ...cap, start: chunk.startTime + relTime });
      }
    }

    chunkA.editManifest = {
      ...chunk.editManifest, keep: keepA,
      keepGlobal: keepA.map(([s, e]) => [chunkA.startTime + s, chunkA.startTime + e]),
      captions: captionsA.map(c => ({ ...c, start: Math.max(chunkA.startTime, c.start), end: Math.min(chunkA.endTime, c.end) })),
    };
    chunkB.editManifest = {
      ...chunk.editManifest, keep: keepB,
      keepGlobal: keepB.map(([s, e]) => [chunkB.startTime + s, chunkB.startTime + e]),
      captions: captionsB.map(c => ({ ...c, start: Math.max(chunkB.startTime, c.start), end: Math.min(chunkB.endTime, c.end) })),
    };

    const nextChunks = [...chunks];
    nextChunks.splice(selectedChunk, 1, chunkA, chunkB);
    const updated = nextChunks.map((c, i) => ({ ...c, index: i }));
    setChunks(updated);
    saveChunksToBackend(updated);
    setSelectedChunk(selectedChunk + 1);
  };

  const handleMoveChunk = (direction: "earlier" | "later") => {
    if (selectedChunk === null) return;
    const currentArrIdx = chunks.findIndex(c => c.index === selectedChunk);
    if (currentArrIdx === -1) return;

    // When cuts are hidden, skip over cut chunks to find the adjacent VISIBLE neighbour
    let targetArrIdx = -1;
    if (direction === "earlier") {
      for (let i = currentArrIdx - 1; i >= 0; i--) {
        if (showCutClips || chunks[i].userKeep !== false) { targetArrIdx = i; break; }
      }
    } else {
      for (let i = currentArrIdx + 1; i < chunks.length; i++) {
        if (showCutClips || chunks[i].userKeep !== false) { targetArrIdx = i; break; }
      }
    }
    if (targetArrIdx === -1) return;

    const nextChunks = [...chunks];
    [nextChunks[currentArrIdx], nextChunks[targetArrIdx]] = [nextChunks[targetArrIdx], nextChunks[currentArrIdx]];

    // Re-index AND recompute sequential startTimes so seekToChunk seeks to correct position
    let elapsed = 0;
    const updated = nextChunks.map((c, i) => {
      const newChunk = {
        ...c,
        index: i,
        startTime: elapsed,
        endTime: elapsed + c.duration,
        editManifest: c.editManifest
          ? { ...c.editManifest, keepGlobal: (c.editManifest.keep || [[0, c.duration]]).map(([s, e]: [number, number]): [number, number] => [elapsed + s, elapsed + e]) }
          : c.editManifest,
      };
      elapsed += c.duration;
      return newChunk;
    });

    setChunks(updated);
    saveChunksToBackend(updated);
    // After re-index, the moved chunk sits at targetArrIdx which becomes its new index
    setSelectedChunk(targetArrIdx);
  };

  const handleAiPromptSubmit = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiDiff([]);
    try {
      const res = await fetch(`${API}/api/video/${project._id}/prompt-edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ prompt: aiPrompt, chunks }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const diff: string[] = [];
      data.chunks.forEach((nc: Chunk) => {
        const oc = chunks.find(c => c.index === nc.index);
        if (oc) {
          if (oc.userKeep !== nc.userKeep) diff.push(`Clip ${nc.index + 1}: ${nc.userKeep ? "Restored" : "Cut"}`);
          if (JSON.stringify(oc.editManifest?.keep) !== JSON.stringify(nc.editManifest?.keep)) diff.push(`Clip ${nc.index + 1}: Trim adjusted`);
        }
      });
      if (diff.length === 0) diff.push("AI applied editing operations successfully.");
      const normalized = normalizeChunkTimes(data.chunks);
      setChunks(normalized);
      // Auto-hide cut clips so only kept clips remain visible after AI edit
      if (normalized.some((c: Chunk) => c.userKeep === false)) setShowCutClips(false);
      // Chunks changed — clear cached thumbnails so new clips get fresh frames
      thumbsReady.current = false;
      setThumbnails({});
      setAiDiff(diff);
      setAiPrompt("");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("AI prompt edit failed:", error);
      alert(`AI Edit Failed: ${error.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const seekToChunk = (chunk: Chunk) => {
    // Place the playhead 0.6s into the clip so "Split at Playhead" is immediately
    // enabled (the button is disabled when currentTime <= startTime + 0.5).
    const insetOffset = Math.min(0.6, chunk.duration * 0.1);
    const targetGlobal = chunk.startTime + insetOffset;
    const relativeT = getAssetTime(targetGlobal, chunk);

    if (videoRef.current && (chunk.assetId === activeChunk?.assetId || !chunk.assetId)) {
      const vid = videoRef.current;
      const dur = vid.duration;
      if (!isFinite(dur) || relativeT < dur - 0.3) {
        vid.currentTime = relativeT;
      }
    }
    setCurrentTime(targetGlobal);
    setSelectedChunk(chunk.index);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const keptDuration = chunks.filter(c => c.userKeep !== false).reduce((s, c) => {
    const keep = c.editManifest?.keep || [];
    return keep.length > 0 ? s + keep.reduce((sum, [sv, ev]) => sum + (ev - sv), 0) : s + c.duration;
  }, 0);

  const getEditedTime = (rawTime: number): number => {
    let elapsed = 0;
    for (const chunk of chunks) {
      if (rawTime < chunk.startTime) break;
      const keepRanges = chunk.editManifest?.keep || [];
      const isKept = chunk.userKeep !== false;
      if (rawTime >= chunk.startTime && rawTime < chunk.endTime) {
        if (!isKept) return elapsed;
        const relTime = rawTime - chunk.startTime;
        if (keepRanges.length === 0) return elapsed + relTime;
        let chunkElapsed = 0;
        for (const [s, e] of keepRanges) {
          if (relTime >= s && relTime <= e) { chunkElapsed += (relTime - s); break; }
          else if (relTime > e) chunkElapsed += (e - s);
          else if (relTime < s) break;
        }
        return elapsed + chunkElapsed;
      }
      if (isKept) {
        if (keepRanges.length === 0) elapsed += chunk.duration;
        else elapsed += keepRanges.reduce((sum, [s, e]) => sum + (e - s), 0);
      }
    }
    return elapsed;
  };

  const getRawTime = (editedTime: number): number => {
    let elapsed = 0;
    for (const chunk of chunks) {
      const isKept = chunk.userKeep !== false;
      if (!isKept) continue;
      const keepRanges = chunk.editManifest?.keep || [];
      const chunkKeptDur = keepRanges.length === 0 ? chunk.duration : keepRanges.reduce((sum, [s, e]) => sum + (e - s), 0);
      if (editedTime >= elapsed && editedTime <= elapsed + chunkKeptDur) {
        const targetInChunk = editedTime - elapsed;
        if (keepRanges.length === 0) return chunk.startTime + targetInChunk;
        let subElapsed = 0;
        for (const [s, e] of keepRanges) {
          const rangeDur = e - s;
          if (targetInChunk >= subElapsed && targetInChunk <= subElapsed + rangeDur) return chunk.startTime + s + (targetInChunk - subElapsed);
          subElapsed += rangeDur;
        }
        return chunk.startTime + chunk.duration;
      }
      elapsed += chunkKeptDur;
    }
    return chunks[chunks.length - 1]?.endTime || 0;
  };

  const timeSaved = Math.max(0, Math.round(totalDuration - keptDuration));

  const cutAllLowScore = () => {
    const updated = chunks.map(c => (c.editManifest?.score ?? 5) < 5 ? { ...c, userKeep: false } : c);
    setChunks(updated);
    saveChunksToBackend(updated);
  };

  const keepAll = () => {
    const updated = chunks.map(c => ({ ...c, userKeep: true }));
    setChunks(updated);
    saveChunksToBackend(updated);
  };

  const resetToAiSuggestions = () => {
    const updated = chunks.map(c => ({ ...c, userKeep: (c.editManifest?.score ?? 5) >= 5 }));
    setChunks(updated);
    saveChunksToBackend(updated);
  };

  // Sequence-based timeline: only display kept clips when cut clips are hidden
  const displayChunks = showCutClips ? chunks : chunks.filter(c => c.userKeep !== false);

  const sequenceDuration = displayChunks.reduce((s, c) => s + c.duration, 0);
  const TIMELINE_SCALE = sequenceDuration > 0 ? Math.max(3, Math.min(12, 900 / sequenceDuration)) : 5;
  const timelineContentWidth = Math.max(900, sequenceDuration * TIMELINE_SCALE);

  // Pixel left position of each display clip in the sequence layout
  const clipSeqPositions = displayChunks.reduce((acc, _, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + displayChunks[i - 1].duration);
    return acc;
  }, [] as number[]);

  // Where the playhead sits in sequence-space using displayChunks order
  const getSequencePos = (rawTime: number): number => {
    let pos = 0;
    for (const chunk of displayChunks) {
      if (rawTime < chunk.startTime) break;
      if (rawTime >= chunk.startTime && rawTime < chunk.endTime) return pos + (rawTime - chunk.startTime);
      pos += chunk.duration;
    }
    return pos;
  };
  const playheadSeqPx = getSequencePos(currentTime) * TIMELINE_SCALE;

  // Ruler tick generation
  const tickInterval = sequenceDuration <= 30 ? 5 : sequenceDuration <= 120 ? 10 : sequenceDuration <= 300 ? 30 : sequenceDuration <= 600 ? 60 : 120;
  const rulerTicks: number[] = [];
  for (let t = 0; t <= sequenceDuration; t += tickInterval) rulerTicks.push(t);

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ background: '#0d0d0d' }}>

      {/* AI savings banner */}
      {timeSaved > 0 && (
        <div className="w-full text-emerald-400 text-[10px] font-mono py-1.5 px-6 text-center shrink-0 border-b"
          style={{ background: 'rgba(16,185,129,0.07)', borderColor: 'rgba(16,185,129,0.15)' }}>
          ✂️ AI removed {timeSaved}s of dead air and filler — saving you hours of manual editing
        </div>
      )}

      {/* Top Toolbar */}
      <div className="h-11 border-b flex items-center justify-between px-4 gap-4 shrink-0"
        style={{ background: '#161616', borderColor: '#222' }}>
        <div className="flex items-center gap-3 text-[11px] font-mono" style={{ color: '#666' }}>
          <span style={{ color: '#999' }}>
            {keptCount}<span style={{ color: '#444' }}>/{chunks.length} clips</span>
          </span>
          <span style={{ color: '#333' }}>|</span>
          <span>
            {formatTime(totalDuration)} →{' '}
            <span style={{ color: '#4ade80' }}>{formatTime(keptDuration)}</span>
          </span>
          {timeSaved > 0 && <span style={{ color: '#166534' }}>−{timeSaved}s saved</span>}
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={cutAllLowScore}
            className="text-[10px] font-mono px-2.5 py-1 rounded cursor-pointer transition-all"
            style={{ border: '1px solid #2a2a2a', background: 'transparent', color: '#888' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = '#222'; (e.target as HTMLElement).style.color = '#ccc'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.color = '#888'; }}>
            Cut Low Score
          </button>
          <button onClick={keepAll}
            className="text-[10px] font-mono px-2.5 py-1 rounded cursor-pointer transition-all"
            style={{ border: '1px solid #2a2a2a', background: 'transparent', color: '#888' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = '#222'; (e.target as HTMLElement).style.color = '#ccc'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.color = '#888'; }}>
            Keep All
          </button>
          <button onClick={resetToAiSuggestions}
            className="text-[10px] font-mono px-2.5 py-1 rounded cursor-pointer transition-all"
            style={{ border: '1px solid #2a2a2a', background: 'transparent', color: '#888' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = '#222'; (e.target as HTMLElement).style.color = '#ccc'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.color = '#888'; }}>
            Reset AI
          </button>
          {!project.captionsEnabled && (
            <button onClick={onEnableCaptions}
              className="text-[10px] font-mono px-2.5 py-1 rounded cursor-pointer flex items-center gap-1 transition-all"
              style={{ border: '1px solid rgba(163,230,53,0.3)', background: 'rgba(163,230,53,0.05)', color: '#a3e635' }}>
              <FileText className="w-3 h-3" /> Add Captions
            </button>
          )}
          <div className="w-px h-5 mx-1" style={{ background: '#2a2a2a' }} />
          <button
            onClick={() => onApprove(chunks, captionStyle, captionSize, captionFontSize)}
            disabled={isRendering || keptCount === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 font-bold text-[11px] rounded-lg cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-accent)', color: '#000' }}>
            {isRendering
              ? <><RefreshCw className="w-3 h-3 animate-spin" /> Rendering…</>
              : <><CheckCircle className="w-3 h-3" /> Approve & Render</>}
          </button>
        </div>
      </div>

      {/* Main workspace: Video + Inspector */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* Video Player Column */}
        <div className="flex-3 flex flex-col min-h-0" style={{ borderRight: '1px solid #1e1e1e' }}>
          {/* Video area */}
          <div className="flex-1 relative min-h-0 overflow-hidden flex items-center justify-center" style={{ background: '#000' }}>
            {chunks.length > 0 ? (
              <video
                ref={videoRef}
                src={`${API}/api/assets/${encodeURI(resolveAssetKey(activeChunk))}`}
                className="w-full h-full object-contain"
                playsInline
                preload="auto"
                onWaiting={() => setVideoLoading(true)}
                onPlaying={() => setVideoLoading(false)}
                onLoadedData={() => setVideoLoading(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onCanPlay={handleCanPlay}
                onEnded={() => {
                  // If skipCuts is on, try to continue to the next kept clip before stopping.
                  // This handles the case where the last clip sits at the very end of the
                  // video file and handleTimeUpdate didn't fire in time to transition.
                  if (skipCuts && activeChunk) {
                    const currentChunkIdx = chunks.findIndex(c => c.index === activeChunk.index);
                    const nextKept = currentChunkIdx >= 0
                      ? chunks.slice(currentChunkIdx + 1).find(c => c.userKeep !== false)
                      : undefined;
                    if (nextKept) {
                      const nextRanges = nextKept.editManifest?.keep || [];
                      const nextStartOffset = nextRanges.length > 0 ? nextRanges[0][0] : 0;
                      const nextGlobalTime = nextKept.startTime + nextStartOffset;
                      const nextAssetTime = getAssetTime(nextGlobalTime, nextKept);
                      if (nextKept.assetId === activeChunk.assetId && videoRef.current) {
                        videoRef.current.currentTime = nextAssetTime;
                        setCurrentTime(nextGlobalTime);
                        videoRef.current.play().catch(() => setVideoPlay(false));
                      } else {
                        pendingSeekRef.current = nextAssetTime;
                        playWhenReadyRef.current = true;
                        setCurrentTime(nextGlobalTime);
                        setSelectedChunk(nextKept.index);
                      }
                      return;
                    }
                  }
                  // No more clips — stop and reset to first kept clip
                  setVideoPlay(false);
                  const firstKept = chunks.find(c => c.userKeep !== false);
                  const resetGlobal = firstKept?.startTime ?? 0;
                  setCurrentTime(resetGlobal);
                  if (videoRef.current) {
                    videoRef.current.currentTime = firstKept
                      ? Math.max(0, getAssetTime(resetGlobal, firstKept))
                      : 0;
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center select-none gap-3">
                <Video className="w-14 h-14 mb-1" style={{ color: 'rgba(163,230,53,0.3)' }} />
                <p className="text-sm font-bold" style={{ color: '#ccc' }}>Blank Editing Canvas</p>
                <p className="text-xs max-w-xs" style={{ color: '#555' }}>
                  Ask the AI Director to compile a first cut or select segments via prompts below.
                </p>
                <div className="mt-2 p-3 rounded-xl flex flex-col gap-1.5 text-[10px] font-mono"
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#a3e635' }}>
                  <span>Try: &quot;prepare a first cut from @1st_video&quot;</span>
                  <span>Try: &quot;combine all assets&quot;</span>
                </div>
              </div>
            )}

            {/* Video loading spinner */}
            {videoLoading && chunks.length > 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                style={{ background: 'rgba(0,0,0,0.4)' }}>
                <RefreshCw className="w-8 h-8 animate-spin" style={{ color: 'rgba(163,230,53,0.7)' }} />
              </div>
            )}

            {/* Caption Overlay */}
            {activeCaption && chunks.length > 0 && (
              <div className="absolute bottom-14 left-6 right-6 z-20 flex justify-center text-center pointer-events-none">
                <div className="relative pointer-events-auto inline-block select-none">
                  {captionStyle === "kinetic" && (
                    <span style={{ fontSize: `${captionFontSize}px`, lineHeight: "1.2" }}
                      className="font-black uppercase tracking-wide bg-accent text-background px-3.5 py-1.5 rounded-lg shadow-xl -rotate-1 inline-block max-w-[90%]">
                      {activeCaption.text}
                    </span>
                  )}
                  {captionStyle === "karaoke" && (
                    <div style={{ fontSize: `${captionFontSize}px`, lineHeight: "1.2" }}
                      className="font-bold bg-surface/90 text-text-primary px-4 py-2 rounded-xl border border-border shadow-xl flex flex-wrap justify-center gap-x-1.5 max-w-[90%]">
                      {activeCaption.text.split(" ").map((word, wIdx) => {
                        const dur = activeCaption.end - activeCaption.start;
                        const rawProgress = dur > 0 ? (currentTime - activeCaption.start) / dur : 0;
                        const progress = Math.max(0, Math.min(1, rawProgress));
                        const wds = activeCaption.text.split(" ");
                        const activeWordIndex = Math.min(Math.floor(progress * wds.length), wds.length - 1);
                        return (
                          <span key={wIdx} className={`transition-all duration-100 ${wIdx === activeWordIndex ? "text-accent scale-110 font-extrabold" : "opacity-80"}`}>
                            {word}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {captionStyle === "minimal" && (
                    <span style={{ fontSize: `${captionFontSize}px`, lineHeight: "1.2", color: '#eee', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                      className="font-medium px-3 py-1 rounded-md max-w-[85%] inline-block">
                      {activeCaption.text}
                    </span>
                  )}
                  <div onMouseDown={handleResizeStart}
                    className="absolute -bottom-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full cursor-se-resize z-30"
                    style={{ background: 'var(--color-accent)', border: '2px solid #000' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#000' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Chunk status badge */}
            {activeChunk && chunks.length > 0 && (
              <div className={`absolute top-3 left-3 text-[10px] font-mono px-2 py-1 rounded border`}
                style={activeChunk.userKeep !== false
                  ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#4ade80' }
                  : { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                Clip {selectedChunk! + 1} · {activeChunk.userKeep !== false ? "✓ KEEP" : "✗ CUT"}
              </div>
            )}

            {/* Play overlay */}
            {chunks.length > 0 && (
              <button
                onClick={() => setVideoPlay(v => !v)}
                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer group"
                style={{ background: 'rgba(0,0,0,0.2)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105"
                  style={{ background: 'rgba(163,230,53,0.9)' }}>
                  {videoPlay
                    ? <Pause className="w-7 h-7 fill-current" style={{ color: '#000' }} />
                    : <Play className="w-7 h-7 fill-current ml-1" style={{ color: '#000' }} />}
                </div>
              </button>
            )}
          </div>

          {/* Playback controls */}
          {chunks.length > 0 && (
            <div className="h-11 flex items-center gap-3 px-4 shrink-0"
              style={{ background: '#121212', borderTop: '1px solid #1e1e1e' }}>
              <button
                onClick={() => setVideoPlay(v => !v)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0"
                style={{ background: '#1e1e1e', color: '#aaa' }}
                onMouseEnter={e => { (e.target as HTMLElement).closest('button')!.style.background = 'var(--color-accent)'; (e.target as HTMLElement).closest('button')!.style.color = '#000'; }}
                onMouseLeave={e => { (e.target as HTMLElement).closest('button')!.style.background = '#1e1e1e'; (e.target as HTMLElement).closest('button')!.style.color = '#aaa'; }}>
                {videoPlay
                  ? <Pause className="w-3.5 h-3.5 fill-current pointer-events-none" />
                  : <Play className="w-3.5 h-3.5 fill-current ml-0.5 pointer-events-none" />}
              </button>

              <button
                onClick={() => setSkipCuts(prev => !prev)}
                className="px-2.5 py-1 rounded text-[10px] font-mono cursor-pointer shrink-0 transition-all"
                style={skipCuts
                  ? { border: '1px solid rgba(163,230,53,0.4)', background: 'rgba(163,230,53,0.1)', color: '#a3e635' }
                  : { border: '1px solid #2a2a2a', background: 'transparent', color: '#555' }}>
                {skipCuts ? "Preview: ON" : "Preview: OFF"}
              </button>

              <span className="text-[11px] font-mono shrink-0" style={{ color: '#666' }}>
                <span style={{ color: '#ccc' }}>{formatTime(skipCuts ? getEditedTime(currentTime) : currentTime)}</span>
                {" / "}
                {formatTime(skipCuts ? keptDuration : totalDuration)}
              </span>

              <input
                type="range"
                min={0}
                max={skipCuts ? keptDuration : totalDuration}
                step={0.1}
                value={skipCuts ? getEditedTime(currentTime) : currentTime}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  const rawT = skipCuts ? getRawTime(v) : v;
                  setCurrentTime(rawT);
                  if (!videoRef.current) return;
                  // Find target chunk and seek to asset-relative time (not global time)
                  const targetChunk = chunks.find(c => rawT >= c.startTime && rawT < c.endTime)
                    ?? (rawT <= 0 ? chunks[0] : chunks[chunks.length - 1]);
                  if (targetChunk) {
                    const assetT = Math.max(0, getAssetTime(rawT, targetChunk));
                    videoRef.current.currentTime = assetT;
                    // If this chunk is from a different asset, switch selection so the src updates
                    const targetIdx = chunks.indexOf(targetChunk);
                    if (targetIdx !== selectedChunk) setSelectedChunk(targetIdx);
                  } else {
                    videoRef.current.currentTime = rawT;
                  }
                }}
                className="flex-1 h-1 cursor-pointer"
                style={{ accentColor: 'var(--color-accent)' }}
              />
            </div>
          )}
        </div>

        {/* Inspector Panel */}
        <div className="w-72 flex flex-col min-h-0 shrink-0 overflow-hidden" style={{ background: '#0f0f0f', borderLeft: '1px solid #1a1a1a' }}>
          {activeChunk ? (
            <>
              {/* Segment header */}
              <div className="p-4 shrink-0" style={{ borderBottom: '1px solid #1e1e1e' }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#eee' }}>Clip {selectedChunk! + 1}</p>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: '#555' }}>
                      {activeChunk.startTime.toFixed(1)}s – {activeChunk.endTime.toFixed(1)}s · {activeChunk.duration.toFixed(1)}s
                    </p>
                  </div>
                  <button
                    onClick={() => toggleChunk(selectedChunk!)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all"
                    style={activeChunk.userKeep !== false
                      ? { border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#f87171' }
                      : { border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.1)', color: '#4ade80' }}>
                    {activeChunk.userKeep !== false
                      ? <><XCircle className="w-3.5 h-3.5" /> Cut</>
                      : <><CheckCircle className="w-3.5 h-3.5" /> Keep</>}
                  </button>
                </div>

                {/* Score bar */}
                {activeChunk.editManifest?.score !== undefined && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-mono" style={{ color: '#444' }}>
                      <span>AI SCORE</span>
                      <span style={{ color: activeChunk.editManifest.score >= 7 ? '#4ade80' : activeChunk.editManifest.score >= 4 ? '#facc15' : '#f87171' }}>
                        {activeChunk.editManifest.score.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e1e1e' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${(activeChunk.editManifest.score / 10) * 100}%`,
                          background: activeChunk.editManifest.score >= 7 ? '#22c55e' : activeChunk.editManifest.score >= 4 ? '#eab308' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Transcript */}
              {activeChunk.transcript && (
                <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <p className="text-[9px] font-mono font-bold uppercase tracking-wider mb-2" style={{ color: '#444' }}>Transcript</p>
                  <p className="text-[11px] leading-relaxed font-mono select-text" style={{ color: '#777' }}>
                    &quot;{activeChunk.transcript}&quot;
                  </p>
                </div>
              )}

              {/* Caption editor */}
              <div className="flex-1 overflow-y-auto min-h-0 p-4">
                <p className="text-[9px] font-mono font-bold uppercase tracking-wider mb-2" style={{ color: '#444' }}>Captions</p>
                {(activeChunk.editManifest?.captions?.length ?? 0) > 0 ? (
                  <div className="space-y-2">
                    {activeChunk.editManifest.captions.map((cap, ci) => (
                      <div key={ci} className="space-y-1">
                        <p className="text-[9px] font-mono" style={{ color: '#444' }}>{cap.start.toFixed(1)}s – {cap.end.toFixed(1)}s</p>
                        <textarea
                          value={cap.text}
                          onChange={(e) => editCaption(activeChunk.index, ci, e.target.value)}
                          rows={2}
                          className="w-full rounded-lg px-2.5 py-1.5 text-[11px] resize-none focus:outline-none font-mono"
                          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ccc' }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] italic" style={{ color: '#444' }}>No captions for this clip.</p>
                )}
              </div>

              {/* Trim & split controls */}
              <div className="px-4 py-3 shrink-0" style={{ borderTop: '1px solid #1e1e1e', background: '#0c0c0c' }}>
                <p className="text-[9px] font-mono font-bold uppercase tracking-wider mb-2" style={{ color: '#444' }}>Trim</p>
                <div className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <span className="text-[8px] font-mono uppercase block mb-0.5" style={{ color: '#444' }}>Start (s)</span>
                    <input type="number" min={0} max={trimEnd} step={0.1} value={trimStart}
                      onChange={(e) => { const val = parseFloat(e.target.value); if (isNaN(val)) return; handleTrimChange(Math.max(0, Math.min(val, trimEnd)), trimEnd); }}
                      className="w-full rounded px-2 py-1 text-[11px] focus:outline-none font-mono"
                      style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ccc' }} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[8px] font-mono uppercase block mb-0.5" style={{ color: '#444' }}>End (s)</span>
                    <input type="number" min={trimStart} max={activeChunk.duration} step={0.1} value={trimEnd}
                      onChange={(e) => { const val = parseFloat(e.target.value); if (isNaN(val)) return; handleTrimChange(trimStart, Math.max(trimStart, Math.min(val, activeChunk.duration))); }}
                      className="w-full rounded px-2 py-1 text-[11px] focus:outline-none font-mono"
                      style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ccc' }} />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleSplitChunk}
                    disabled={currentTime <= activeChunk.startTime + 0.5 || currentTime >= activeChunk.endTime - 0.5}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-[9px] font-bold cursor-pointer disabled:opacity-40 transition-all"
                    style={{ border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#aaa' }}>
                    <Scissors className="w-3 h-3" /> Split at Playhead
                  </button>
                  <button onClick={() => handleMoveChunk("earlier")} disabled={selectedChunk === 0}
                    className="px-2.5 py-1.5 rounded text-[9px] font-bold disabled:opacity-40 cursor-pointer transition-all"
                    style={{ border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#aaa' }}>←</button>
                  <button onClick={() => handleMoveChunk("later")} disabled={selectedChunk === chunks.length - 1}
                    className="px-2.5 py-1.5 rounded text-[9px] font-bold disabled:opacity-40 cursor-pointer transition-all"
                    style={{ border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#aaa' }}>→</button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-6 select-none">
              <div>
                <Scissors className="w-8 h-8 mx-auto mb-3" style={{ color: '#333' }} />
                <p className="text-[11px]" style={{ color: '#444' }}>Click a clip in the timeline<br />to inspect and edit it</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NLE Timeline */}
      <div className="shrink-0 flex flex-col" style={{ height: '188px', background: '#080808', borderTop: '1px solid #1a1a1a' }}>

        {/* Timeline header bar */}
        <div className="h-8 flex items-center px-4 gap-4 shrink-0 justify-between" style={{ background: '#111', borderBottom: '1px solid #1a1a1a' }}>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono uppercase tracking-widest font-bold" style={{ color: '#555' }}>Timeline</span>
            {chunks.length > 0 && (
              <span className="text-[9px] font-mono" style={{ color: '#333' }}>
                {displayChunks.length} clips · drag to reorder
              </span>
            )}
          </div>
          {chunks.some(c => c.userKeep === false) && (
            <button
              onClick={() => setShowCutClips(v => !v)}
              className="flex items-center gap-1.5 text-[9px] font-mono px-2.5 py-1 rounded-md cursor-pointer transition-all"
              style={showCutClips
                ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }
                : { background: 'rgba(163,230,53,0.08)', border: '1px solid rgba(163,230,53,0.2)', color: '#a3e635' }}>
              <XCircle className="w-3 h-3" />
              {showCutClips ? 'Hide Cuts' : 'Show Cuts'}
            </button>
          )}
        </div>

        {chunks.length > 0 ? (
          <div className="flex flex-1 min-h-0">
            {/* Track label gutter */}
            <div className="w-14 shrink-0 flex flex-col" style={{ borderRight: '1px solid #1a1a1a' }}>
              {/* ruler spacer */}
              <div className="h-5 shrink-0" style={{ borderBottom: '1px solid #1a1a1a' }} />
              {/* track label */}
              <div className="flex-1 flex items-center justify-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#333' }} />
                <span className="text-[9px] font-mono" style={{ color: '#444' }}>V1</span>
              </div>
            </div>

            {/* Scrollable track content */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden relative" ref={timelineRef}>
              <div className="relative h-full" style={{ width: `${timelineContentWidth}px`, minWidth: '100%' }}>

                {/* Time ruler */}
                <div className="absolute top-0 left-0 right-0 h-5" style={{ background: '#0c0c0c', borderBottom: '1px solid #1a1a1a' }}>
                  {rulerTicks.map(t => (
                    <div key={t} className="absolute flex flex-col items-start" style={{ left: `${t * TIMELINE_SCALE}px`, top: 0 }}>
                      <span className="text-[8px] font-mono pl-1" style={{ color: '#444', lineHeight: '1' }}>{formatTime(t)}</span>
                      <div style={{ width: '1px', height: '4px', background: '#2a2a2a', marginTop: '1px' }} />
                    </div>
                  ))}
                  {/* Minor ticks */}
                  {sequenceDuration <= 300 && (() => {
                    const minor: number[] = [];
                    const minorInterval = tickInterval / 5;
                    for (let t = minorInterval; t < sequenceDuration; t += minorInterval) {
                      const rem = t % tickInterval;
                      if (rem > 0.001 && rem < tickInterval - 0.001) minor.push(t);
                    }
                    return minor.map(t => (
                      <div key={t} className="absolute bottom-0" style={{ left: `${t * TIMELINE_SCALE}px`, width: '1px', height: '2px', background: '#1e1e1e' }} />
                    ));
                  })()}
                </div>

                {/* Clips layer */}
                <div className="absolute left-0 right-0 px-0 py-1.5" style={{ top: '20px', bottom: 0 }}>
                  {displayChunks.map((chunk, displayIdx) => {
                    // Use original chunk index for all state lookups (thumbnails, selectedChunk, drag)
                    const origIdx = chunks.indexOf(chunk);
                    const score = chunk.editManifest?.score ?? 5;
                    const isKept = chunk.userKeep !== false;
                    const isSelected = selectedChunk === origIdx;
                    const isDragging = draggedChunkIdx === origIdx;
                    const isDropTarget = dropTargetIdx === origIdx && draggedChunkIdx !== null && draggedChunkIdx !== origIdx;

                    const clipLeft = clipSeqPositions[displayIdx] * TIMELINE_SCALE;
                    const clipWidth = Math.max(24, chunk.duration * TIMELINE_SCALE);

                    let clipBg: string;
                    let clipBorder: string;
                    let clipText: string;
                    if (!isKept) {
                      clipBg = 'rgba(20,6,6,0.95)';
                      clipBorder = 'rgba(239,68,68,0.2)';
                      clipText = '#5a1515';
                    } else if (isSelected) {
                      clipBg = 'rgba(163,230,53,0.1)';
                      clipBorder = '#a3e635';
                      clipText = '#a3e635';
                    } else if (score >= 7) {
                      clipBg = 'rgba(16,185,129,0.08)';
                      clipBorder = 'rgba(16,185,129,0.3)';
                      clipText = '#34d399';
                    } else {
                      clipBg = 'rgba(234,179,8,0.06)';
                      clipBorder = 'rgba(234,179,8,0.25)';
                      clipText = '#d97706';
                    }

                    return (
                      <div
                        key={`clip-${origIdx}-${chunk._id || chunk.id || origIdx}`}
                        draggable
                        onDragStart={(e) => {
                          setDraggedChunkIdx(origIdx);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDropTargetIdx(origIdx);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedChunkIdx !== null && draggedChunkIdx !== origIdx) {
                            const nextChunks = [...chunks];
                            const [dragged] = nextChunks.splice(draggedChunkIdx, 1);
                            nextChunks.splice(origIdx, 0, dragged);
                            const updated = nextChunks.map((c, idx) => ({ ...c, index: idx }));
                            setChunks(updated);
                            saveChunksToBackend(updated);
                            const target = updated[origIdx];
                            if (target && videoRef.current) {
                              videoRef.current.currentTime = getAssetTime(target.startTime, target);
                              setCurrentTime(target.startTime);
                            }
                            setSelectedChunk(origIdx);
                          }
                          setDraggedChunkIdx(null);
                          setDropTargetIdx(null);
                        }}
                        onDragEnd={() => { setDraggedChunkIdx(null); setDropTargetIdx(null); }}
                        onClick={() => seekToChunk(chunk)}
                        title={`${isKept ? `Clip ${displayIdx + 1}` : 'CUT'} · ${chunk.duration.toFixed(1)}s · Score ${score.toFixed(1)}`}
                        className="absolute top-0 bottom-0 rounded cursor-pointer select-none overflow-hidden"
                        style={{
                          left: `${clipLeft}px`,
                          width: `${clipWidth}px`,
                          background: clipBg,
                          border: `1px solid ${clipBorder}`,
                          opacity: isDragging ? 0.25 : 1,
                          outline: isDropTarget ? '2px solid var(--color-accent)' : 'none',
                          outlineOffset: '2px',
                          transition: 'opacity 0.15s ease',
                        }}>

                        {/* Video frame thumbnail strip */}
                        {thumbnails[origIdx] && isKept && (
                          <div className="absolute inset-0" style={{
                            backgroundImage: `url(${thumbnails[origIdx]})`,
                            backgroundRepeat: 'repeat-x',
                            backgroundSize: 'auto 100%',
                            backgroundPosition: 'left center',
                            animation: 'fadeIn 0.4s ease',
                          }} />
                        )}

                        {/* Color grade overlay */}
                        <div className="absolute inset-0" style={{
                          background: isKept
                            ? (thumbnails[origIdx] ? clipBg.replace(/[\d.]+\)$/, '0.2)') : clipBg)
                            : 'rgba(20,6,6,0.7)',
                        }} />

                        {/* Top accent bar */}
                        <div className="absolute top-0 left-0 right-0" style={{ height: '2px', background: clipBorder }} />

                        {/* Cut clip diagonal hatching */}
                        {!isKept && (
                          <div className="absolute inset-0" style={{
                            backgroundImage: 'repeating-linear-gradient(135deg, rgba(239,68,68,0.08) 0, rgba(239,68,68,0.08) 1px, transparent 0, transparent 8px)',
                          }} />
                        )}

                        {/* Label */}
                        <div className="absolute inset-0 flex flex-col justify-end p-1 pointer-events-none">
                          {clipWidth > 26 && (
                            <span className="text-[7px] font-mono font-bold leading-none drop-shadow-md" style={{ color: isKept ? clipText : 'rgba(239,68,68,0.4)' }}>
                              {isKept ? `S${displayIdx + 1}` : '✕'}
                            </span>
                          )}
                          {clipWidth > 50 && isKept && (
                            <span className="text-[6px] font-mono leading-none mt-0.5 drop-shadow-md" style={{ color: isSelected ? 'rgba(163,230,53,0.6)' : 'rgba(255,255,255,0.25)' }}>
                              {chunk.duration.toFixed(0)}s
                            </span>
                          )}
                        </div>

                        {/* Selected ring glow */}
                        {isSelected && (
                          <div className="absolute inset-0 rounded pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1.5px #a3e635' }} />
                        )}
                      </div>
                    );
                  })}

                  {/* Playhead */}
                  <div
                    className="absolute top-0 bottom-0 z-20 pointer-events-none"
                    style={{ left: `${playheadSeqPx}px` }}>
                    {/* Triangle handle */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2"
                      style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '7px solid #ef4444' }} />
                    {/* Line */}
                    <div className="absolute top-1.5 bottom-0 left-1/2 -translate-x-1/2" style={{ width: '1.5px', background: '#ef4444', opacity: 0.9 }} />
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[10px] font-mono italic" style={{ color: '#333' }}>
            Timeline is empty. Use the prompt below to add clips.
          </div>
        )}
      </div>

      {/* AI Prompt Bar */}
      <div className="shrink-0 px-4 py-3" style={{ background: '#0d0d0d', borderTop: '1px solid #1a1a1a' }}>
        <div className="flex gap-2">
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAiPromptSubmit(); } }}
            placeholder="Ask AI to edit this video… e.g. 'Cut first 5 seconds', 'Keep only React parts'"
            rows={1}
            className="flex-1 rounded-xl px-4 py-2 text-xs resize-none focus:outline-none font-mono"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ccc' }}
          />
          <button
            onClick={handleAiPromptSubmit}
            disabled={aiLoading || !aiPrompt.trim()}
            className="px-5 py-2 font-bold text-xs rounded-xl disabled:opacity-40 cursor-pointer transition-all flex items-center gap-1.5"
            style={{ background: 'var(--color-accent)', color: '#000' }}>
            {aiLoading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <><Sparkles className="w-3.5 h-3.5" /> Apply AI</>}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <div className="flex gap-1.5">
            {["Remove dead air", "Cut filler words", "Keep high score only"].map(chip => (
              <button key={chip} onClick={() => setAiPrompt(chip)}
                className="text-[9px] font-mono px-2 py-0.5 rounded cursor-pointer transition-all"
                style={{ border: '1px solid #222', background: '#161616', color: '#555' }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = '#888'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = '#555'; }}>
                {chip}
              </button>
            ))}
          </div>
          {aiDiff.length > 0 && (
            <div className="flex-1 rounded-lg px-3 py-1 flex items-center justify-between gap-4 text-[10px] font-mono"
              style={{ background: 'rgba(163,230,53,0.05)', border: '1px solid rgba(163,230,53,0.15)' }}>
              <span className="truncate" style={{ color: '#a3e635' }}>✓ {aiDiff.join(", ").substring(0, 90)}{aiDiff.join(", ").length > 90 ? '…' : ''}</span>
              <button onClick={() => setAiDiff([])} className="shrink-0 cursor-pointer" style={{ color: '#444' }}>✕</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Left Sidebar ─────────────────────────────────────────────────────────────
function LeftSidebar({ project, onUploadSuccess }: { project: Project | null; onUploadSuccess: (p: Project) => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleUpload = async (files: FileList) => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);
    setError("");
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("files", files[i]);
    try {
      const token = localStorage.getItem("Stedtio_token");
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API}/api/video/${project?._id}/upload-assets`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
        xhr.onload = () => {
          if (xhr.status === 200) { onUploadSuccess(JSON.parse(xhr.responseText).project); resolve(); }
          else reject(new Error(JSON.parse(xhr.responseText).error || "Upload failed"));
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex || !project?.assets) return;
    const updatedAssets = [...project.assets];
    const [draggedAsset] = updatedAssets.splice(draggedIndex, 1);
    updatedAssets.splice(targetIndex, 0, draggedAsset);
    const updates = updatedAssets.map((asset, i) => ({ assetId: asset._id || asset.key, order: i }));
    const optimisticProject = { ...project, assets: updatedAssets.map((a, i) => ({ ...a, order: i })) } as Project;
    onUploadSuccess(optimisticProject);
    try {
      const token = localStorage.getItem("Stedtio_token");
      const res = await fetch(`${API}/api/video/${project._id}/assets/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ updates }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok) onUploadSuccess({ ...project, assets: data.assets } as Project);
      }
    } catch (err) {
      console.error("Reorder failed:", err);
      onUploadSuccess(project);
    } finally {
      setDraggedIndex(null);
    }
  };

  return (
    <div className="flex flex-col h-full p-3 gap-3 select-none shrink-0 w-full" style={{ background: '#0f0f0f' }}>
      {/* Upload Zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center"
        style={{ borderColor: '#222', background: '#141414' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(163,230,53,0.4)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#222'; }}>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="video/*,image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => { if (e.target.files) handleUpload(e.target.files); }}
        />
        <Upload className="w-5 h-5 animate-bounce" style={{ color: '#555' }} />
        <span className="text-xs font-semibold" style={{ color: '#aaa' }}>Upload Assets</span>
        <span className="text-[9px]" style={{ color: '#444' }}>Images or Videos</span>
      </div>

      {uploading && (
        <div className="space-y-1 rounded-lg p-2" style={{ background: '#1a1a1a', border: '1px solid #222' }}>
          <div className="flex justify-between text-[10px] font-mono">
            <span style={{ color: '#666' }}>Uploading...</span>
            <span style={{ color: '#a3e635' }}>{progress}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: '#2a2a2a' }}>
            <div className="h-full transition-all duration-300 rounded-full" style={{ width: `${progress}%`, background: 'var(--color-accent)' }} />
          </div>
        </div>
      )}

      {error && (
        <p className="text-[10px] rounded-lg p-2 font-mono" style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          ⚠ {error}
        </p>
      )}

      {/* Assets list */}
      <div className="flex-1 flex flex-col min-h-0">
        <span className="text-[9px] font-mono uppercase tracking-wider mb-2" style={{ color: '#444' }}>Uploaded Assets</span>
        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 content-start pr-1">
          {project?.assets?.map((asset, i) => {
            const isImage = asset.mimeType?.startsWith("image/");
            const isDragging = draggedIndex === i;
            const isPending = asset.status === "pending";
            const isProcessing = asset.status === "processing";
            const isError = asset.status === "error";
            return (
              <div
                key={i}
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, i)}
                className="group relative aspect-square rounded-lg overflow-hidden flex flex-col justify-end cursor-grab active:cursor-grabbing transition-all"
                style={{ background: '#1a1a1a', border: `1px solid ${isDragging ? 'var(--color-accent)' : '#2a2a2a'}`, opacity: isDragging ? 0.4 : 1 }}>
                {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.url} alt={asset.filename} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <Video className={`w-6 h-6 ${isProcessing ? "animate-pulse" : isError ? "animate-bounce" : ""}`}
                      style={{ color: isError ? '#f87171' : '#a3e635' }} />
                    {isProcessing && <span className="text-[7px] font-mono font-bold animate-pulse" style={{ color: '#a3e635' }}>analyzing…</span>}
                    {isPending && <span className="text-[7px] font-mono" style={{ color: '#555' }}>queued…</span>}
                    {isError && <span className="text-[7px] font-mono" style={{ color: '#f87171' }} title={asset.errorMessage}>error</span>}
                  </div>
                )}
                <div className="relative z-10 p-1.5 text-[8px] truncate w-full"
                  style={{ background: 'rgba(0,0,0,0.8)', color: '#aaa', borderTop: '1px solid rgba(255,255,255,0.05)' }}
                  title={asset.filename}>
                  {asset.filename}
                </div>
              </div>
            );
          })}
          {(!project?.assets || project.assets.length === 0) && (
            <div className="col-span-2 py-8 text-center text-[10px] italic" style={{ color: '#333' }}>
              No files uploaded yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EditorPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [sse, setSse] = useState<SSEEvent | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [preselectedChunkId, setPreselectedChunkId] = useState<string | undefined>(undefined);
  const [preselectedStartTime, setPreselectedStartTime] = useState<number | undefined>(undefined);
  const sseRef = useRef<EventSource | null>(null);
  const connectSSERef = useRef<() => void>(() => {});
  const editorMountedRef = useRef(true);
  useEffect(() => {
    editorMountedRef.current = true;
    return () => { editorMountedRef.current = false; };
  }, []);

  const loadProject = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/video/${projectId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setProject(await res.json());
    } catch (err) {
      console.error("Failed to load project:", err);
    }
  }, [projectId]);

  useEffect(() => {
    const timer = setTimeout(() => loadProject(), 0);
    return () => clearTimeout(timer);
  }, [loadProject]);

  const connectSSE = useCallback(() => {
    if (!projectId) return;
    if (sseRef.current) { sseRef.current.close(); sseRef.current = null; }
    const token = getToken();
    const es = new EventSource(`${API}/api/video/${projectId}/status?token=${token}`);
    sseRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.stage === "clips_ready") { loadProject(); setSse(data); es.close(); return; }
        if (data.type === "chunk_enriched" && data.chunk) {
          setProject((prev) => {
            if (!prev) return prev;
            const newChunks = prev.chunks.map((c) => {
              if (c.index === data.chunk.index) {
                return { ...c, yoloLabels: data.chunk.yoloLabels, userKeep: data.chunk.userKeep, editManifest: { ...c.editManifest, ...data.chunk.editManifest } };
              }
              return c;
            });
            return { ...prev, chunks: newChunks };
          });
          return;
        }
        if (data.type === "enrichment_complete") { setProject((prev) => prev ? { ...prev, aiEnriched: true } : prev); return; }
        if (data.type === "asset_status_change") { loadProject(); return; }
        const sseEvent = data as SSEEvent;
        setSse(sseEvent);
        if (sseEvent.status === "review" || sseEvent.status === "done" || sseEvent.status === "error") loadProject();
        if (sseEvent.status === "cancelled") { loadProject(); es.close(); }
        if (sseEvent.status === "done" || sseEvent.status === "error") { setIsRendering(false); es.close(); }
      } catch {}
    };

    es.onerror = () => { es.close(); if (editorMountedRef.current) setTimeout(() => connectSSERef.current(), 3000); };
  }, [projectId, loadProject]);

  useEffect(() => { connectSSERef.current = connectSSE; }, [connectSSE]);
  useEffect(() => { connectSSE(); return () => sseRef.current?.close(); }, [connectSSE]);

  const reconnectSSE = useCallback(() => {
    setSse(null);
    setIsRendering(false);
    setIsCancelling(false);
    connectSSE();
  }, [connectSSE]);

  const handleApprove = async (
    editedChunks: Chunk[],
    captionStyle: "kinetic" | "karaoke" | "minimal",
    captionSize: "small" | "medium" | "large" | "xlarge",
    captionFontSize: number
  ) => {
    setIsRendering(true);
    try {
      const captions = editedChunks.filter(c => c.userKeep !== false).flatMap(c => c.editManifest?.captions || []);
      await fetch(`${API}/api/video/${projectId}/manifest`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          chunks: editedChunks, captionStyle, captionSize, captionFontSize,
          globalManifest: {
            ...project?.globalManifest, captions,
            keepRanges: editedChunks.filter(c => c.userKeep !== false).flatMap(c => c.editManifest?.keepGlobal || []),
          },
        }),
      });
      await fetch(`${API}/api/video/${projectId}/render`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch (err) {
      console.error("Render trigger failed:", err);
      setIsRendering(false);
    }
  };

  const currentStatus = sse?.status || project?.status || "uploading";
  const isProcessing = !["review", "done", "error", "cancelled"].includes(currentStatus);
  const isDone = currentStatus === "done";
  const isError = currentStatus === "error";
  const isCancelled = currentStatus === "cancelled";

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await fetch(`${API}/api/video/${projectId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  const handleEnableCaptions = async () => {
    try {
      const res = await fetch(`${API}/api/projects/${projectId}/captions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ enabled: true }),
      });
      if (res.ok) await loadProject();
      else alert("Failed to enable captions. Please try again.");
    } catch (err) {
      console.error("Failed to enable captions:", err);
      alert("Failed to enable captions. Please try again.");
    }
  };

  return (
    <div className="flex h-screen text-text-primary overflow-hidden font-body flex-col" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-5 shrink-0 z-30"
        style={{ background: '#111', borderBottom: '1px solid #1e1e1e' }}>
        <div className="flex items-center gap-4">
          <Link href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-mono transition-colors"
            style={{ color: '#555' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#a3e635')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <div className="w-px h-4" style={{ background: '#222' }} />
          <div>
            <h1 className="text-sm font-bold truncate max-w-70" style={{ color: '#ddd' }}>
              {project?.name || "Loading…"}
            </h1>
            <p className="text-[10px] font-mono" style={{ color: '#444' }}>
              {projectId.substring(0, 12)}…
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono`}
            style={isDone
              ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#4ade80' }
              : isError
              ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }
              : isProcessing
              ? { background: 'rgba(163,230,53,0.08)', border: '1px solid rgba(163,230,53,0.2)', color: '#a3e635' }
              : { background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
            {(isProcessing && !isRendering) && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
            {isDone && <CheckCircle className="w-2.5 h-2.5" />}
            {isRendering && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
            {isError && <AlertCircle className="w-2.5 h-2.5" />}
            {isRendering ? "Rendering" : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
          </div>
          <Link href="/" className="transition-colors" style={{ color: '#444' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#888')}
            onMouseLeave={e => (e.currentTarget.style.color = '#444')}>
            <Home className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-56 flex flex-col min-h-0 shrink-0" style={{ borderRight: '1px solid #1a1a1a' }}>
          <LeftSidebar
            project={project}
            onUploadSuccess={(updatedProject) => { setProject(updatedProject); reconnectSSE(); }}
          />
        </div>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative" style={{ background: '#0d0d0d' }}>
          {isError && <ErrorView message={project?.errorMessage || sse?.message || "Unknown error"} />}
          {isCancelled && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}>
                <StopCircle className="w-8 h-8" style={{ color: '#fbbf24' }} />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold" style={{ color: '#fbbf24' }}>Processing Cancelled</h2>
                <p className="text-sm mt-2" style={{ color: '#666' }}>Pipeline was stopped. You can upload again.</p>
              </div>
              <Link href="/dashboard"
                className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all"
                style={{ background: 'var(--color-accent)', color: '#000' }}>
                Back to Dashboard
              </Link>
            </div>
          )}
          {isDone && !isRendering && project && (
            <RenderDoneView
              project={project}
              onReEdit={async () => {
                try {
                  const token = localStorage.getItem("Stedtio_token");
                  const res = await fetch(`${API}/api/video/${project._id}/manifest`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ status: "review" }),
                  });
                  if (res.ok) await loadProject();
                } catch (err) {
                  console.error("Failed to re-edit project:", err);
                }
              }}
            />
          )}
          {isRendering && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <RefreshCw className="w-12 h-12 animate-spin mx-auto" style={{ color: 'var(--color-accent)' }} />
                <p className="text-lg font-bold font-display" style={{ color: '#ddd' }}>Rendering your video…</p>
                <p className="text-sm font-mono" style={{ color: '#666' }}>{sse?.message || "Combining segments..."}</p>
                <div className="w-64 h-1.5 rounded-full overflow-hidden mx-auto" style={{ background: '#1e1e1e' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${sse?.progress || 10}%`, background: 'var(--color-accent)' }} />
                </div>
                <FunnyNotice />
              </div>
            </div>
          )}
          {isProcessing && !isRendering && (
            <ProcessingView sse={sse} projectName={project?.name || "Your Video"} onCancel={handleCancel} isCancelling={isCancelling} />
          )}
          {currentStatus === "review" && !isRendering && (!project || ((!project.chunks || project.chunks.length === 0) && (!project.assets || project.assets.length === 0))) && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
                style={{ background: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.2)' }}>
                <Video className="w-8 h-8" style={{ color: 'rgba(163,230,53,0.7)' }} />
              </div>
              <h2 className="text-lg font-bold font-display" style={{ color: '#ddd' }}>No assets uploaded yet</h2>
              <p className="text-xs max-w-sm" style={{ color: '#555' }}>
                Upload video or image assets in the left sidebar to start AI editing.
              </p>
            </div>
          )}
          {currentStatus === "review" && project && !isRendering && ((project.chunks && project.chunks.length > 0) || (project.assets && project.assets.length > 0)) && (
            (project.clip_recommendations && project.clip_recommendations.length > 0 && !showTimeline) ? (
              <ClipDiscoveryScreen
                recommendations={project.clip_recommendations}
                onEditInTimeline={(segmentId, startTime) => {
                  setPreselectedChunkId(segmentId);
                  setPreselectedStartTime(startTime);
                  setShowTimeline(true);
                }}
              />
            ) : (
              <TimelineReview
                project={project}
                onApprove={handleApprove}
                isRendering={isRendering}
                initialSelectedChunkId={preselectedChunkId}
                initialStartTime={preselectedStartTime}
                onEnableCaptions={handleEnableCaptions}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
