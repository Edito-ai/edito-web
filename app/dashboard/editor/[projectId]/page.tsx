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

      {/* Pipeline Stages */}
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

      {/* Progress Bar */}
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

      {/* Cancel Button */}
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

  // Find active caption based on final video currentTime
  const activeCaption = finalCaptions.find(
    (cap) => currentTime >= cap.start && currentTime <= cap.end
  );

  // Sync video element listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => {
      setCurrentTime(video.currentTime);
    };
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
    if (videoPlay) {
      video.play().catch(() => setVideoPlay(false));
    } else {
      video.pause();
    }
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

      {/* Preview with Subtitle Overlay */}
      {project.finalKey && (
        <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden bg-black border border-border group">
          <video
            ref={videoRef}
            src={`${API}/api/assets/${project.finalKey}`}
            className="w-full h-full object-contain cursor-pointer"
            playsInline
            onClick={() => setVideoPlay((v) => !v)}
          />

          {/* Subtitle Overlay in final Screen */}
          {activeCaption && (
            <div className="absolute bottom-12 left-6 right-6 z-20 flex justify-center text-center pointer-events-none">
              <div className="relative pointer-events-auto inline-block select-none">
                {captionStyle === "kinetic" && (
                  <span
                    style={{ fontSize: `${captionFontSize}px`, lineHeight: "1.2" }}
                    className="font-black uppercase tracking-wide bg-accent text-background px-3.5 py-1.5 rounded-lg shadow-xl shadow-black/60 -rotate-1 inline-block max-w-[90%]"
                  >
                    {activeCaption.text}
                  </span>
                )}
                {captionStyle === "karaoke" && (
                  <div
                    style={{ fontSize: `${captionFontSize}px`, lineHeight: "1.2" }}
                    className="font-bold bg-surface/90 text-text-primary px-4 py-2 rounded-xl border border-border shadow-xl flex flex-wrap justify-center gap-x-1.5 max-w-[90%] font-display"
                  >
                    {activeCaption.text.split(" ").map((word, wIdx) => {
                      const duration = activeCaption.end - activeCaption.start;
                      const progress = (currentTime - activeCaption.start) / duration;
                      const words = activeCaption.text.split(" ");
                      const activeWordIndex = Math.min(
                        Math.floor(progress * words.length),
                        words.length - 1
                      );
                      const isWordActive = wIdx === activeWordIndex;
                      return (
                        <span
                          key={wIdx}
                          className={`transition-all duration-100 ${
                            isWordActive
                              ? "text-accent scale-110 font-extrabold"
                              : "opacity-80"
                          }`}
                        >
                          {word}
                        </span>
                      );
                    })}
                  </div>
                )}
                {captionStyle === "minimal" && (
                  <span
                    style={{ fontSize: `${captionFontSize}px`, lineHeight: "1.2" }}
                    className="font-medium text-text-primary px-3 py-1 bg-black/40 backdrop-blur-sm rounded-md max-w-[85%] border border-border/30 inline-block"
                  >
                    {activeCaption.text}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Play/Pause overlay button */}
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 cursor-pointer pointer-events-none"
          >
            <button
              className="w-14 h-14 rounded-full bg-accent text-background flex items-center justify-center shadow-lg hover:scale-105 transition-transform pointer-events-auto cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setVideoPlay((v) => !v); }}
            >
              {videoPlay ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Download buttons */}
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



// ─── Timeline Review View ─────────────────────────────────────────────────────
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
  const [chunks, setChunks] = useState<Chunk[]>(project.chunks || []);
  const [prevProjectChunks, setPrevProjectChunks] = useState<Chunk[]>(project.chunks || []);

  if (project.chunks !== prevProjectChunks) {
    setPrevProjectChunks(project.chunks);
    setChunks((prev) => {
      return project.chunks.map((pc, idx) => {
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
    });
  }

  const [selectedChunk, setSelectedChunk] = useState<number | null>(() => {
    if (initialSelectedChunkId) {
      const idx = (project.chunks || []).findIndex(c => c.id === initialSelectedChunkId || c._id === initialSelectedChunkId);
      if (idx !== -1) return idx;
    }
    return null;
  });
  const [videoPlay, setVideoPlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialStartTime || 0);
  const [skipCuts, setSkipCuts] = useState(false); // Play all chunks by default, toggle to skip cut segments
  const [captionStyle] = useState<"kinetic" | "karaoke" | "minimal">(project.captionStyle || "kinetic");
  const [captionSize] = useState<"small" | "medium" | "large" | "xlarge">(project.captionSize || "medium");
  const [captionFontSize, setCaptionFontSize] = useState<number>(project.captionFontSize || 24);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDiff, setAiDiff] = useState<string[]>([]);

  const activeChunk = selectedChunk !== null && chunks[selectedChunk] ? chunks[selectedChunk] : null;
  const currentKeepRange = activeChunk?.editManifest?.keep?.[0] || [0, activeChunk?.duration || 0];
  const [trimStart, trimEnd] = currentKeepRange;

  // Debounced auto-save to DB
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveChunksToBackend = (updatedChunks: Chunk[]) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const keepRanges: [number, number][] = [];
        const captions: Caption[] = [];
        let totalDuration = 0;
        for (const chunk of updatedChunks) {
          if (chunk.userKeep !== false) {
            if (chunk.editManifest?.keepGlobal) {
              keepRanges.push(...chunk.editManifest.keepGlobal);
            }
            if (chunk.editManifest?.captions) {
              captions.push(...chunk.editManifest.captions);
            }
          }
          totalDuration = Math.max(totalDuration, chunk.endTime);
        }

        await fetch(`${API}/api/video/${project._id}/manifest`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            chunks: updatedChunks,
            globalManifest: {
              totalDuration,
              keepRanges,
              captions,
            },
          }),
        });
      } catch (err) {
        console.error("Failed to auto-save manifest:", err);
      }
    }, 1000);
  };

  // Drag resizing handlers
  const dragStartRef = useRef<{ x: number; y: number; size: number } | null>(null);
  const handleResizeEndRef = useRef<(() => void) | null>(null);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const newSize = Math.max(12, Math.min(120, dragStartRef.current.size + deltaX * 0.25));
    setCaptionFontSize(Math.round(newSize));
  }, []);

  const handleResizeEnd = useCallback(() => {
    dragStartRef.current = null;
    document.removeEventListener("mousemove", handleResizeMove);
    if (handleResizeEndRef.current) {
      document.removeEventListener("mouseup", handleResizeEndRef.current);
    }
  }, [handleResizeMove]);

  useEffect(() => {
    handleResizeEndRef.current = handleResizeEnd;
  }, [handleResizeEnd]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      size: captionFontSize,
    };
    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      if (handleResizeEndRef.current) {
        document.removeEventListener("mouseup", handleResizeEndRef.current);
      }
    };
  }, [handleResizeMove]);

  const totalDuration = project.globalManifest?.totalDuration || chunks.reduce((s, c) => Math.max(s, c.endTime), 0);
  const keptCount = chunks.filter(c => c.userKeep !== false).length;

  // Find active caption based on currentTime, filtering out trimmed ranges
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

  // Handle video element timeupdate event (including playhead-skipping)
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (!activeChunk) return;

    // Check if the video's src matches the activeChunk's src
    const expectedPath = `/api/assets/${activeChunk.assetKey || project.originalKey || ""}`;
    const decodedSrc = decodeURIComponent(video.src);
    const decodedExpected = decodeURIComponent(expectedPath);
    if (!decodedSrc.includes(decodedExpected)) {
      return; // Ignore timeupdates during transition
    }

    const assetTime = video.currentTime;
    
    // Ignore initial 0 timeupdate if we are seeking to a non-zero time in the chunk
    const targetAssetTime = getAssetTime(currentTime, activeChunk);
    if (assetTime === 0 && targetAssetTime > 0.5) {
      return;
    }

    const time = getGlobalTime(assetTime, activeChunk);
    setCurrentTime(time);

    if (!skipCuts) return; // Play all chunks contiguously if not in skipCuts preview mode

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
          const currentRange = keepRanges.find(([s, e]) => relTime >= s && relTime <= e);
          if (!currentRange) {
            const nextRange = keepRanges.find(([s]) => s > relTime);
            if (nextRange) {
              const nextGlobalTime = currentChunk.startTime + nextRange[0];
              const nextAssetTime = getAssetTime(nextGlobalTime, currentChunk);
              video.currentTime = nextAssetTime;
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
    const targetAssetTime = getAssetTime(currentTime, activeChunk);
    // Seek to target asset time when metadata is loaded
    video.currentTime = targetAssetTime;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (videoPlay) video.play().catch(() => setVideoPlay(false));
    else video.pause();
  }, [videoPlay, activeChunk?.assetKey]);

  // Highlight which chunk is currently playing
  useEffect(() => {
    const active = chunks.findIndex(c => currentTime >= c.startTime && currentTime < c.endTime);
    if (active >= 0 && active !== selectedChunk) {
      const timer = setTimeout(() => {
        setSelectedChunk(active);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentTime, chunks, selectedChunk]);

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
      return {
        ...c,
        editManifest: {
          ...c.editManifest,
          keep,
          keepGlobal
        }
      };
    });
    setChunks(updated);
    saveChunksToBackend(updated);
  };

  const handleSplitChunk = () => {
    if (selectedChunk === null) return;
    const chunk = chunks[selectedChunk];
    const relTime = currentTime - chunk.startTime;
    if (relTime <= 0.5 || relTime >= chunk.duration - 0.5) {
      alert("Cannot split so close to the boundaries of the segment.");
      return;
    }

    const chunkA: Chunk = {
      ...chunk,
      index: selectedChunk,
      endTime: chunk.startTime + relTime,
      duration: relTime,
      userKeep: chunk.userKeep
    };

    const chunkB: Chunk = {
      ...chunk,
      index: selectedChunk + 1,
      startTime: chunk.startTime + relTime,
      duration: chunk.duration - relTime,
      userKeep: chunk.userKeep
    };

    const wordsA = (chunk.words || []).filter((w: { word: string; start: number; end: number }) => w.start < relTime);
    const wordsB = (chunk.words || []).filter((w: { word: string; start: number; end: number }) => w.start >= relTime).map((w: { word: string; start: number; end: number }) => ({
      ...w,
      start: w.start - relTime,
      end: w.end - relTime
    }));

    chunkA.words = wordsA;
    chunkB.words = wordsB;
    chunkA.transcript = wordsA.map((w: { word: string }) => w.word).join(" ");
    chunkB.transcript = wordsB.map((w: { word: string }) => w.word).join(" ");

    const keepA: [number, number][] = [];
    const keepB: [number, number][] = [];
    const keep = chunk.editManifest?.keep || [[0, chunk.duration]];
    for (const [s, e] of keep) {
      if (e <= relTime) {
        keepA.push([s, e]);
      } else if (s >= relTime) {
        keepB.push([s - relTime, e - relTime]);
      } else {
        keepA.push([s, relTime]);
        keepB.push([0, e - relTime]);
      }
    }

    const captionsA: Caption[] = [];
    const captionsB: Caption[] = [];
    const captions = chunk.editManifest?.captions || [];
    for (const cap of captions) {
      const capStartRel = cap.start - chunk.startTime;
      const capEndRel = cap.end - chunk.startTime;
      if (capEndRel <= relTime) {
        captionsA.push(cap);
      } else if (capStartRel >= relTime) {
        captionsB.push({
          ...cap,
          start: cap.start,
          end: cap.end
        });
      } else {
        captionsA.push({ ...cap, end: chunk.startTime + relTime });
        captionsB.push({ ...cap, start: chunk.startTime + relTime });
      }
    }

    chunkA.editManifest = {
      ...chunk.editManifest,
      keep: keepA,
      keepGlobal: keepA.map(([s, e]) => [chunkA.startTime + s, chunkA.startTime + e]),
      captions: captionsA.map(c => ({
        ...c,
        start: Math.max(chunkA.startTime, c.start),
        end: Math.min(chunkA.endTime, c.end),
      })),
    };

    chunkB.editManifest = {
      ...chunk.editManifest,
      keep: keepB,
      keepGlobal: keepB.map(([s, e]) => [chunkB.startTime + s, chunkB.startTime + e]),
      captions: captionsB.map(c => ({
        ...c,
        start: Math.max(chunkB.startTime, c.start),
        end: Math.min(chunkB.endTime, c.end),
      })),
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
    const targetIdx = direction === "earlier" ? selectedChunk - 1 : selectedChunk + 1;
    if (targetIdx < 0 || targetIdx >= chunks.length) return;

    const nextChunks = [...chunks];
    const temp = nextChunks[selectedChunk];
    nextChunks[selectedChunk] = nextChunks[targetIdx];
    nextChunks[targetIdx] = temp;

    const updated = nextChunks.map((c, i) => ({ ...c, index: i }));
    setChunks(updated);
    saveChunksToBackend(updated);
    setSelectedChunk(targetIdx);
  };

  const handleAiPromptSubmit = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiDiff([]);
    try {
      const res = await fetch(`${API}/api/video/${project._id}/prompt-edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ prompt: aiPrompt, chunks }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      
      // Calculate diff to show what changed
      const diff: string[] = [];
      data.chunks.forEach((nc: Chunk) => {
        const oc = chunks.find(c => c.index === nc.index);
        if (oc) {
          if (oc.userKeep !== nc.userKeep) {
            diff.push(`Chunk ${nc.index + 1}: ${nc.userKeep ? "Restored" : "Cut"}`);
          }
          const okKeep = oc.editManifest?.keep || [];
          const nkKeep = nc.editManifest?.keep || [];
          if (JSON.stringify(okKeep) !== JSON.stringify(nkKeep)) {
            diff.push(`Chunk ${nc.index + 1}: Trim adjusted`);
          }
        }
      });
      if (diff.length === 0) {
        diff.push("AI applied editing operations successfully.");
      }
      setAiDiff(diff);
      setChunks(data.chunks);
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
    const relativeT = getAssetTime(chunk.startTime, chunk);
    if (videoRef.current && (chunk.assetId === activeChunk?.assetId || !chunk.assetId)) {
      videoRef.current.currentTime = relativeT;
    }
    setCurrentTime(chunk.startTime);
    setSelectedChunk(chunk.index);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const keptDuration = chunks
    .filter(c => c.userKeep !== false)
    .reduce((s, c) => {
      const keep = c.editManifest?.keep || [];
      if (keep.length > 0) {
        return s + keep.reduce((sum, [startVal, endVal]) => sum + (endVal - startVal), 0);
      }
      return s + c.duration;
    }, 0);

  const getEditedTime = (rawTime: number): number => {
    let elapsed = 0;
    for (const chunk of chunks) {
      if (rawTime < chunk.startTime) {
        break;
      }
      const keepRanges = chunk.editManifest?.keep || [];
      const isKept = chunk.userKeep !== false;
      
      if (rawTime >= chunk.startTime && rawTime < chunk.endTime) {
        if (!isKept) {
          return elapsed;
        }
        const relTime = rawTime - chunk.startTime;
        if (keepRanges.length === 0) {
          return elapsed + relTime;
        }
        let chunkElapsed = 0;
        for (const [s, e] of keepRanges) {
          if (relTime >= s && relTime <= e) {
            chunkElapsed += (relTime - s);
            break;
          } else if (relTime > e) {
            chunkElapsed += (e - s);
          } else if (relTime < s) {
            break;
          }
        }
        return elapsed + chunkElapsed;
      }

      if (isKept) {
        if (keepRanges.length === 0) {
          elapsed += chunk.duration;
        } else {
          elapsed += keepRanges.reduce((sum, [s, e]) => sum + (e - s), 0);
        }
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
      const chunkKeptDur = keepRanges.length === 0 
        ? chunk.duration 
        : keepRanges.reduce((sum, [s, e]) => sum + (e - s), 0);

      if (editedTime >= elapsed && editedTime <= elapsed + chunkKeptDur) {
        const targetInChunk = editedTime - elapsed;
        if (keepRanges.length === 0) {
          return chunk.startTime + targetInChunk;
        }
        let subElapsed = 0;
        for (const [s, e] of keepRanges) {
          const rangeDur = e - s;
          if (targetInChunk >= subElapsed && targetInChunk <= subElapsed + rangeDur) {
            return chunk.startTime + s + (targetInChunk - subElapsed);
          }
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
    const updated = chunks.map(c => {
      const score = c.editManifest?.score ?? 5;
      if (score < 5) {
        return { ...c, userKeep: false };
      }
      return c;
    });
    setChunks(updated);
    saveChunksToBackend(updated);
  };

  const keepAll = () => {
    const updated = chunks.map(c => ({ ...c, userKeep: true }));
    setChunks(updated);
    saveChunksToBackend(updated);
  };

  const resetToAiSuggestions = () => {
    const updated = chunks.map(c => {
      const score = c.editManifest?.score ?? 5;
      return { ...c, userKeep: score >= 5 };
    });
    setChunks(updated);
    saveChunksToBackend(updated);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">


      {timeSaved > 0 && (
        <div className="w-full bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-[11px] font-mono py-2 px-6 text-center shrink-0">
          ✂️ AI removed {timeSaved}s of dead air and filler — saving you hours of manual editing
        </div>
      )}

      {/* Top action bar / Render controls */}
      <div className="w-full border-b border-border bg-surface/30 px-6 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
          <span>{keptCount}/{chunks.length} segments kept</span>
          <span>Duration: {formatTime(totalDuration)} → {formatTime(keptDuration)}</span>
          <span>Saved: {timeSaved}s</span>
        </div>
        
        <div className="flex gap-2 items-center">
          <button
            onClick={cutAllLowScore}
            className="text-[10px] font-mono border border-border bg-transparent hover:bg-border/30 px-2.5 py-1.5 rounded transition-all text-text-muted hover:text-text-primary cursor-pointer"
          >
            Cut Low Score
          </button>
          <button
            onClick={keepAll}
            className="text-[10px] font-mono border border-border bg-transparent hover:bg-border/30 px-2.5 py-1.5 rounded transition-all text-text-muted hover:text-text-primary cursor-pointer"
          >
            Keep All
          </button>
          <button
            onClick={resetToAiSuggestions}
            className="text-[10px] font-mono border border-border bg-transparent hover:bg-border/30 px-2.5 py-1.5 rounded transition-all text-text-muted hover:text-text-primary cursor-pointer"
          >
            Reset AI
          </button>
          {!project.captionsEnabled && (
            <button
              onClick={onEnableCaptions}
              className="text-[10px] font-mono border border-accent/30 bg-accent/5 hover:bg-accent/15 px-2.5 py-1.5 rounded transition-all text-accent cursor-pointer flex items-center gap-1 shrink-0 animate-[pulse_2s_infinite]"
              style={{ animationDuration: "3s" }}
            >
              <FileText className="w-3 h-3" />
              Add Captions
            </button>
          )}
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={() => onApprove(chunks, captionStyle, captionSize, captionFontSize)}
            disabled={isRendering || keptCount === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-accent text-background font-extrabold text-[11px] rounded-lg hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all animate-[pulse_2s_infinite]"
            style={{ animationDuration: "3s" }}
          >
            {isRendering ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Rendering…</>
            ) : (
              <><CheckCircle className="w-3.5 h-3.5" /> Approve & Render</>
            )}
          </button>
        </div>
      </div>

      {/* Main layout: upper row (player + chunk editor list) + lower row (timeline + prompt) */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Upper section: Player & Subtitles Editor */}
        <div className="flex-1 flex gap-4 p-4 min-h-0 overflow-hidden">
          {/* Player Container (65% width) */}
          <div style={{ flex: 2 }} className="flex flex-col gap-3 min-h-0 overflow-y-auto">
            <div className="relative flex-1 min-h-[250px] rounded-xl bg-black border border-border overflow-hidden group">
              {chunks.length > 0 ? (
                <video
                  ref={videoRef}
                  src={`${API}/api/assets/${encodeURI(activeChunk?.assetKey || project.originalKey || "")}`}
                  className="w-full h-full object-contain"
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setVideoPlay(false)}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-950/40 select-none">
                  <Video className="w-12 h-12 text-accent/40 animate-[pulse_3s_infinite] mb-3" />
                  <p className="text-sm font-bold text-text-primary font-display">Blank Editing Canvas</p>
                  <p className="text-xs text-text-muted mt-2 max-w-sm">
                    Your timeline is empty. Ask the AI Director to compile a first cut or select specific segments using prompts:
                  </p>
                  <div className="mt-4 p-3 bg-surface/50 border border-border rounded-xl flex flex-col gap-1.5 text-[10px] font-mono text-accent">
                    <span>Try: &quot;prepare a first cut from @1st_video&quot;</span>
                    <span>Try: &quot;combine all assets&quot;</span>
                    <span>Try: &quot;after @1st_video, place @2nd_video&quot;</span>
                  </div>
                </div>
              )}

              {/* Subtitle Overlay in Screen */}
              {activeCaption && chunks.length > 0 && (
                <div className="absolute bottom-12 left-6 right-6 z-20 flex justify-center text-center pointer-events-none">
                  <div className="relative pointer-events-auto inline-block group/resize select-none">
                    {captionStyle === "kinetic" && (
                      <span
                        style={{ fontSize: `${captionFontSize}px`, lineHeight: "1.2" }}
                        className="font-black uppercase tracking-wide bg-accent text-background px-3.5 py-1.5 rounded-lg shadow-xl shadow-black/60 -rotate-1 inline-block max-w-[90%]"
                      >
                        {activeCaption.text}
                      </span>
                    )}
                    {captionStyle === "karaoke" && (
                      <div
                        style={{ fontSize: `${captionFontSize}px`, lineHeight: "1.2" }}
                        className="font-bold bg-surface/90 text-text-primary px-4 py-2 rounded-xl border border-border shadow-xl flex flex-wrap justify-center gap-x-1.5 max-w-[90%] font-display"
                      >
                        {activeCaption.text.split(" ").map((word, wIdx) => {
                          const duration = activeCaption.end - activeCaption.start;
                          const progress = (currentTime - activeCaption.start) / duration;
                          const words = activeCaption.text.split(" ");
                          const activeWordIndex = Math.min(
                            Math.floor(progress * words.length),
                            words.length - 1
                          );
                          const isWordActive = wIdx === activeWordIndex;
                          return (
                            <span
                              key={wIdx}
                              className={`transition-all duration-100 ${
                                isWordActive
                                  ? "text-accent scale-110 font-extrabold"
                                  : "opacity-80"
                              }`}
                            >
                              {word}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {captionStyle === "minimal" && (
                      <span
                        style={{ fontSize: `${captionFontSize}px`, lineHeight: "1.2" }}
                        className="font-medium text-text-primary px-3 py-1 bg-black/40 backdrop-blur-sm rounded-md max-w-[85%] border border-border/30 inline-block"
                      >
                        {activeCaption.text}
                      </span>
                    )}

                    {/* Resize Handle */}
                    <div
                      onMouseDown={handleResizeStart}
                      className="absolute -bottom-2 -right-2 w-5 h-5 flex items-center justify-center bg-accent border-2 border-background rounded-full shadow-lg cursor-se-resize pointer-events-auto z-30 transition-all hover:scale-110 active:scale-95"
                      title="Drag to resize text"
                    >
                      <div className="w-1.5 h-1.5 bg-background rounded-full" />
                    </div>
                  </div>
                </div>
              )}

              {/* Overlay keep/cut indicator */}
              {activeChunk && chunks.length > 0 && (
                <div className={`absolute top-3 left-3 text-[10px] font-mono px-2 py-1 rounded-lg border ${
                  activeChunk.userKeep !== false
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : "bg-red-500/20 border-red-500/40 text-red-400"
                }`}>
                  Chunk {selectedChunk! + 1} · {activeChunk.userKeep !== false ? "✓ KEEP" : "✗ CUT"}
                </div>
              )}

              {/* Play overlay */}
              {chunks.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <button
                    onClick={() => setVideoPlay(v => !v)}
                    className="w-14 h-14 rounded-full bg-accent text-background flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform"
                  >
                    {videoPlay ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Playback controls */}
            {chunks.length > 0 && (
              <div className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-2.5 shrink-0">
                <button
                  onClick={() => setVideoPlay(v => !v)}
                  className="w-8 h-8 rounded-lg bg-border flex items-center justify-center hover:bg-accent hover:text-background transition-all cursor-pointer text-text-primary shrink-0"
                >
                  {videoPlay ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                </button>
                
                <button
                  onClick={() => setSkipCuts(prev => !prev)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono transition-all cursor-pointer ${
                    skipCuts
                      ? "bg-accent/15 border-accent/30 text-accent hover:bg-accent/25"
                      : "bg-surface border-border text-text-muted hover:bg-border/45"
                  }`}
                  title="Toggle playhead skipping over cut segments"
                >
                  {skipCuts ? "Preview Cuts: ON" : "Preview Cuts: OFF"}
                </button>

                <span className="text-[11px] font-mono text-text-muted shrink-0">
                  <span className="text-text-primary">
                    {formatTime(skipCuts ? getEditedTime(currentTime) : currentTime)}
                  </span>
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
                    if (videoRef.current) videoRef.current.currentTime = rawT;
                    setCurrentTime(rawT);
                  }}
                  className="flex-1 h-1 accent-current cursor-pointer"
                  style={{ accentColor: "var(--color-accent)" }}
                />
              </div>
            )}
          </div>

          {/* Subtitles & Chunk Editor (35% width) */}
          <div className="flex-1 flex flex-col gap-3 min-h-0 bg-surface/10 border border-border rounded-xl p-3 overflow-hidden">
            {/* Selected chunk details / Caption Editor */}
            {activeChunk ? (
              <div className="flex flex-col h-full gap-3 min-h-0">
                <div className="flex items-start justify-between gap-4 shrink-0">
                  <div>
                    <p className="text-xs font-bold text-text-primary">Segment {selectedChunk! + 1}</p>
                    <p className="text-[10px] font-mono text-text-muted mt-0.5">
                      {activeChunk.startTime.toFixed(1)}s – {activeChunk.endTime.toFixed(1)}s
                      · Score: {activeChunk.editManifest?.score?.toFixed(1) ?? "N/A"}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleChunk(selectedChunk!)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      activeChunk.userKeep !== false
                        ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    }`}
                  >
                    {activeChunk.userKeep !== false ? (
                      <><XCircle className="w-3.5 h-3.5" /> Cut</>
                    ) : (
                      <><CheckCircle className="w-3.5 h-3.5" /> Keep</>
                    )}
                  </button>
                </div>

                {activeChunk.transcript && (
                  <p className="text-[11px] text-text-muted font-mono leading-relaxed bg-background/50 p-2 rounded-lg border border-border shrink-0 select-text">
                    &quot;{activeChunk.transcript}&quot;
                  </p>
                )}

                {/* manual caption editing */}
                <div className="flex-1 overflow-y-auto space-y-3 border-t border-border pt-2 min-h-0 pr-1">
                  <span className="text-[9px] font-mono font-bold text-text-muted uppercase block">Edit Segment Subtitles</span>
                  {(activeChunk.editManifest?.captions?.length ?? 0) > 0 ? (
                    activeChunk.editManifest.captions.map((cap, ci) => (
                      <div key={ci} className="space-y-1">
                        <p className="text-[9px] font-mono text-text-muted">
                          {cap.start.toFixed(1)}s – {cap.end.toFixed(1)}s
                        </p>
                        <textarea
                          value={cap.text}
                          onChange={(e) => editCaption(activeChunk.index, ci, e.target.value)}
                          rows={2}
                          className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-[11px] text-text-primary resize-none focus:outline-none focus:border-accent/50 font-mono"
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-text-muted italic">No captions generated for this segment.</p>
                  )}
                </div>

                {/* Manual Trimming & split controls */}
                <div className="border-t border-border pt-3 space-y-2 shrink-0">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <span className="text-[8px] font-mono font-bold text-text-muted uppercase block">Trim Start (sec)</span>
                      <input
                        type="number"
                        min={0}
                        max={trimEnd}
                        step={0.1}
                        value={trimStart}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          handleTrimChange(Math.max(0, Math.min(val, trimEnd)), trimEnd);
                        }}
                        className="w-full bg-background border border-border rounded-lg px-2 py-1 text-[11px] text-text-primary focus:outline-none focus:border-accent/50 font-mono"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[8px] font-mono font-bold text-text-muted uppercase block">Trim End (sec)</span>
                      <input
                        type="number"
                        min={trimStart}
                        max={activeChunk.duration}
                        step={0.1}
                        value={trimEnd}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || activeChunk.duration;
                          handleTrimChange(trimStart, Math.max(trimStart, Math.min(val, activeChunk.duration)));
                        }}
                        className="w-full bg-background border border-border rounded-lg px-2 py-1 text-[11px] text-text-primary focus:outline-none focus:border-accent/50 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={handleSplitChunk}
                      disabled={currentTime <= activeChunk.startTime + 0.5 || currentTime >= activeChunk.endTime - 0.5}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg text-[9px] font-bold border border-border hover:bg-border/40 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-all text-text-primary"
                    >
                      ✂️ Split Clip
                    </button>
                    <button
                      onClick={() => handleMoveChunk("earlier")}
                      disabled={selectedChunk === 0}
                      className="px-2 py-1 rounded-lg border border-border hover:bg-border/40 disabled:opacity-40 text-[9px] font-bold text-text-primary"
                    >
                      ← Move
                    </button>
                    <button
                      onClick={() => handleMoveChunk("later")}
                      disabled={selectedChunk === chunks.length - 1}
                      className="px-2 py-1 rounded-lg border border-border hover:bg-border/40 disabled:opacity-40 text-[9px] font-bold text-text-primary"
                    >
                      Move →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-text-muted text-[11px] italic p-4 select-none">
                Select a timeline segment below to view transcript and edit subtitles.
              </div>
            )}
          </div>
        </div>

        {/* Lower section: Horizontal Chunks Timeline + AI Prompt (frames & prompt) */}
        <div className="shrink-0 border-t border-border bg-surface/50 p-4 space-y-4">

          {/* Horizontal scrollable timeline track (labeled frames) */}
          <div className="relative border border-border bg-background rounded-xl p-3">
            <span className="absolute top-1 left-2 text-[8px] font-mono text-text-muted/65 uppercase tracking-wider">frames / segments</span>
            <div
              ref={timelineRef}
              className="overflow-x-auto min-w-0 pt-2"
            >
              {chunks.length > 0 ? (
                <>
                  <div className="flex gap-1 items-end h-10 min-w-max">
                    {chunks.map((chunk, i) => {
                      const widthPct = (chunk.duration / totalDuration) * 100;
                      const score = chunk.editManifest?.score ?? 5;
                      const scoreH = Math.max(20, Math.round((score / 10) * 36));
                      return (
                        <div
                          key={i}
                          onClick={() => { seekToChunk(chunk); }}
                          className={`cursor-pointer rounded-t shrink-0 transition-all duration-200 border-b-2 ${
                            !chunk.userKeep
                              ? "bg-zinc-800/40 border-t border-x border-zinc-700/20 hover:bg-zinc-800/60 opacity-40 border-b-red-500"
                              : selectedChunk === i
                              ? "bg-accent border-t border-x border-accent border-b-emerald-500"
                              : score >= 7
                              ? "bg-emerald-500/40 border-t border-x border-emerald-500/30 hover:bg-emerald-500/60 border-b-emerald-500"
                              : "bg-purple-500/30 border-t border-x border-purple-500/20 hover:bg-purple-500/50 border-b-emerald-500"
                          }`}
                          style={{ width: `${Math.max(widthPct * 3.5, 25)}px`, height: `${scoreH}px` }}
                          title={`Chunk ${i + 1} · Score ${score.toFixed(1)} · ${chunk.duration.toFixed(1)}s`}
                        />
                      );
                    })}
                  </div>
                  {/* Time ruler */}
                  <div className="flex gap-1 mt-1 min-w-max">
                    {chunks.map((chunk, i) => {
                      const widthPct = (chunk.duration / totalDuration) * 100;
                      return (
                        <div
                          key={i}
                          className="text-[8px] font-mono text-text-muted text-center shrink-0 overflow-hidden"
                          style={{ width: `${Math.max(widthPct * 3.5, 25)}px` }}
                        >
                          {formatTime(chunk.startTime)}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="py-4 text-center text-text-muted text-[10px] font-mono italic">
                  Timeline is empty. Use the prompt input below to select clips from your uploaded assets.
                </div>
              )}
            </div>
          </div>

          {/* AI Prompt Input Bar (labeled prompt) */}
          <div className="space-y-2 border-t border-border/40 pt-3">
            <div className="flex gap-2">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask AI to edit this video... e.g. 'Cut first 5 seconds', 'Keep only React parts'"
                rows={1}
                className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-xs text-text-primary resize-none focus:outline-none focus:border-accent/50 font-body placeholder:text-text-muted/50"
              />
              <button
                onClick={handleAiPromptSubmit}
                disabled={aiLoading || !aiPrompt.trim()}
                className="px-5 py-2 bg-accent text-background font-bold text-xs rounded-xl hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                {aiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Apply AI Edit</span>
                )}
              </button>
            </div>

            {/* Suggestions Chips & Diffs */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Remove dead air",
                  "Cut filler words",
                  "Keep high score only"
                ].map(chip => (
                  <button
                    key={chip}
                    onClick={() => setAiPrompt(chip)}
                    className="text-[9px] font-mono bg-background hover:bg-border/40 border border-border text-text-muted px-2 py-0.5 rounded transition-all cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
              
              {aiDiff.length > 0 && (
                <div className="flex-1 bg-accent/5 border border-accent/20 rounded-lg px-3 py-1 flex items-center justify-between gap-4 text-[10px] font-mono">
                  <span className="text-accent truncate">AI Edit Applied: {aiDiff.join(", ").substring(0, 100)}...</span>
                  <button 
                    onClick={() => setAiDiff([])}
                    className="text-text-muted hover:text-text-primary cursor-pointer shrink-0"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function LeftSidebar({
  project,
  onUploadSuccess,
}: {
  project: Project | null;
  onUploadSuccess: (p: Project) => void;
}) {
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
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const token = localStorage.getItem("Stedtio_token");
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API}/api/video/${project?._id}/upload-assets`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            onUploadSuccess(data.project);
            resolve();
          } else {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || "Upload failed"));
          }
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex || !project?.assets) return;
    
    const updatedAssets = [...project.assets];
    const [draggedAsset] = updatedAssets.splice(draggedIndex, 1);
    updatedAssets.splice(targetIndex, 0, draggedAsset);
    
    const updates = updatedAssets.map((asset, i) => ({
      assetId: asset._id || asset.key,
      order: i
    }));
    
    const optimisticProject = {
      ...project,
      assets: updatedAssets.map((a, i) => ({ ...a, order: i }))
    } as Project;
    onUploadSuccess(optimisticProject);
    
    try {
      const token = localStorage.getItem("Stedtio_token");
      const res = await fetch(`${API}/api/video/${project._id}/assets/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ updates })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          onUploadSuccess({
            ...project,
            assets: data.assets
          } as Project);
        }
      }
    } catch (err) {
      console.error("Reorder failed:", err);
      onUploadSuccess(project);
    } finally {
      setDraggedIndex(null);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4 bg-surface/50 border-r border-border select-none shrink-0 w-full">
      {/* Upload Zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed border-border hover:border-accent/50 bg-background/40 hover:bg-accent/3 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="video/*,image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => { if (e.target.files) handleUpload(e.target.files); }}
        />
        <Upload className="w-5 h-5 text-text-muted animate-bounce" />
        <span className="text-xs font-semibold text-text-primary">Upload Assets</span>
        <span className="text-[9px] text-text-muted">Images or Videos</span>
      </div>

      {/* Progress */}
      {uploading && (
        <div className="space-y-1 bg-background border border-border p-2 rounded-lg">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-text-muted">Uploading...</span>
            <span className="text-accent">{progress}%</span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2 font-mono">
          ⚠ {error}
        </p>
      )}

      {/* Previews List */}
      <div className="flex-1 flex flex-col min-h-0">
        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">Uploaded Assets</span>
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
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, i)}
                className={`group relative aspect-square bg-background border rounded-lg overflow-hidden flex flex-col justify-end cursor-grab active:cursor-grabbing transition-all ${
                  isDragging ? "opacity-30 border-accent" : "border-border hover:border-accent/40"
                }`}
              >
                {isImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={asset.url} alt={asset.filename} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted gap-1 bg-zinc-950/20">
                    <Video className={`w-6 h-6 ${isProcessing ? "text-accent animate-pulse" : isError ? "text-red-400 animate-bounce" : "text-accent"}`} />
                    {isProcessing && <span className="text-[7px] text-accent font-mono font-bold animate-pulse">analyzing...</span>}
                    {isPending && <span className="text-[7px] text-text-muted font-mono">queued...</span>}
                    {isError && <span className="text-[7px] text-red-400 font-mono" title={asset.errorMessage}>error</span>}
                  </div>
                )}
                {/* Filename overlay */}
                <div className="relative z-10 bg-black/75 p-1.5 text-[8px] text-text-primary truncate border-t border-border/30 w-full" title={asset.filename}>
                  {asset.filename}
                </div>
              </div>
            );
          })}
          {(!project?.assets || project.assets.length === 0) && (
            <div className="col-span-2 py-8 text-center text-text-muted text-[10px] italic">
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

  // Load project
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
    const timer = setTimeout(() => {
      loadProject();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadProject]);

  // SSE connection — extracted so we can reconnect after uploads
  const connectSSE = useCallback(() => {
    if (!projectId) return;
    // Close any existing connection
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }

    const token = getToken();
    const es = new EventSource(`${API}/api/video/${projectId}/status?token=${token}`);
    sseRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        
        if (data.stage === "clips_ready") {
          loadProject();
          setSse(data);
          es.close();
          return;
        }
        
        if (data.type === "chunk_enriched" && data.chunk) {
          setProject((prev) => {
            if (!prev) return prev;
            const newChunks = prev.chunks.map((c) => {
              if (c.index === data.chunk.index) {
                return {
                  ...c,
                  yoloLabels: data.chunk.yoloLabels,
                  userKeep: data.chunk.userKeep,
                  editManifest: {
                    ...c.editManifest,
                    ...data.chunk.editManifest,
                  },
                };
              }
              return c;
            });
            return { ...prev, chunks: newChunks };
          });
          return;
        }

        if (data.type === "enrichment_complete") {
          setProject((prev) => {
            if (!prev) return prev;
            return { ...prev, aiEnriched: true };
          });
          return;
        }

        if (data.type === "asset_status_change") {
          loadProject();
          return;
        }

        const sseEvent = data as SSEEvent;
        setSse(sseEvent);
        
        if (sseEvent.status === "review" || sseEvent.status === "done" || sseEvent.status === "error") {
          loadProject();
        }
        if (sseEvent.status === "cancelled") {
          loadProject();
          es.close();
        }
        if (sseEvent.status === "done" || sseEvent.status === "error") {
          setIsRendering(false);
          es.close();
        }
      } catch {}
    };

    es.onerror = () => {
      es.close();
      setTimeout(() => connectSSERef.current(), 3000);
    };
  }, [projectId, loadProject]);

  // Keep ref in sync so onerror retry always calls the latest version
  useEffect(() => {
    connectSSERef.current = connectSSE;
  }, [connectSSE]);

  useEffect(() => {
    connectSSE();
    return () => sseRef.current?.close();
  }, [connectSSE]);

  // Reconnect SSE and clear stale state (used after uploads trigger new processing)
  const reconnectSSE = useCallback(() => {
    setSse(null); // Clear stale SSE status so project.status takes over
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
      // Save edited manifest
      const captions = editedChunks
        .filter(c => c.userKeep !== false)
        .flatMap(c => c.editManifest?.captions || []);

      await fetch(`${API}/api/video/${projectId}/manifest`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          chunks: editedChunks,
          captionStyle,
          captionSize,
          captionFontSize,
          globalManifest: {
            ...project?.globalManifest,
            captions,
            keepRanges: editedChunks
              .filter(c => c.userKeep !== false)
              .flatMap(c => c.editManifest?.keepGlobal || []),
          },
        }),
      });

      // Trigger render
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ enabled: true }),
      });
      if (res.ok) {
        await loadProject();
      }
    } catch (err) {
      console.error("Failed to enable captions:", err);
    }
  };

  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden font-body flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-surface/70 backdrop-blur-md shrink-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-text-muted hover:text-accent transition-colors text-xs font-mono">
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <div className="w-px h-4 bg-border" />
          <div>
            <h1 className="text-sm font-bold text-text-primary truncate max-w-[300px]">
              {project?.name || "Loading…"}
            </h1>
            <p className="text-[10px] font-mono text-text-muted">
              {projectId.substring(0, 12)}…
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono ${
            isDone ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
            isError ? "bg-red-500/10 border-red-500/30 text-red-400" :
            isProcessing ? "bg-accent/10 border-accent/30 text-accent" :
            "bg-purple-500/10 border-purple-500/30 text-purple-400"
          }`}>
            {(isProcessing && !isRendering) && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
            {isDone && <CheckCircle className="w-2.5 h-2.5" />}
            {isRendering && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
            {isError && <AlertCircle className="w-2.5 h-2.5" />}
            {isRendering ? "Rendering" : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
          </div>

          <Link href="/" className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors">
            <Home className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-72 bg-surface border-r border-border flex flex-col min-h-0 shrink-0">
          <LeftSidebar
            project={project}
            onUploadSuccess={(updatedProject) => {
              setProject(updatedProject);
              // Reset stale SSE and reconnect so frontend tracks the new processing status
              reconnectSSE();
            }}
          />
        </div>

        {/* Right Main Panel */}
        <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden relative">
          {isError && <ErrorView message={project?.errorMessage || sse?.message || "Unknown error"} />}
          {isCancelled && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <StopCircle className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-yellow-400">Processing Cancelled</h2>
                <p className="text-sm text-text-muted mt-2">Pipeline was stopped. You can upload again.</p>
              </div>
              <Link href="/dashboard" className="px-6 py-2.5 bg-accent text-background rounded-lg text-sm font-bold hover:brightness-110 transition-all">
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
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: "review" }),
                  });
                  if (res.ok) {
                    loadProject();
                  }
                } catch (err) {
                  console.error("Failed to re-edit project:", err);
                }
              }}
            />
          )}
          {isRendering && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <RefreshCw className="w-12 h-12 animate-spin text-accent mx-auto" />
                <p className="text-lg font-bold text-text-primary font-display">Rendering your video…</p>
                <p className="text-sm text-text-muted font-mono">{sse?.message || "Combining segments..."}</p>
                <div className="w-64 h-1.5 bg-border rounded-full overflow-hidden mx-auto">
                  <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${sse?.progress || 10}%` }} />
                </div>
                <FunnyNotice />
              </div>
            </div>
          )}
          {isProcessing && !isRendering && (
            <ProcessingView sse={sse} projectName={project?.name || "Your Video"} onCancel={handleCancel} isCancelling={isCancelling} />
          )}
          {currentStatus === "review" && !isRendering && (!project || ((!project.chunks || project.chunks.length === 0) && (!project.assets || project.assets.length === 0))) && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4 bg-background">
              <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mb-2">
                <Video className="w-8 h-8 animate-[pulse_2s_infinite]" />
              </div>
              <h2 className="text-lg font-bold text-text-primary font-display">No assets uploaded yet</h2>
              <p className="text-xs text-text-muted max-w-sm">
                Upload video or image assets in the left sidebar to start AI editing. Stedtio will automatically analyze and let you edit them using prompts.
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
