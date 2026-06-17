"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Play, Pause, CheckCircle, XCircle, Download,
  Loader2, Scissors, Sparkles, RefreshCw, ToggleLeft,
  ToggleRight, Star, AlertCircle, ChevronDown, ChevronUp,
  FileText, Cloud, Home, StopCircle
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Caption {
  text: string;
  start: number;
  end: number;
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
  index: number;
  startTime: number;
  endTime: number;
  duration: number;
  transcript: string;
  editManifest: EditManifest;
  userKeep: boolean;
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
}

interface SSEEvent {
  status: string;
  progress: number;
  message: string;
  finalKey?: string;
  captionsKey?: string;
  finalCaptions?: Caption[];
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

function getFontSizeClass(style: "kinetic" | "karaoke" | "minimal", size: "small" | "medium" | "large" | "xlarge") {
  const mapping = {
    kinetic: {
      small: "text-xs md:text-sm",
      medium: "text-sm md:text-lg",
      large: "text-lg md:text-2xl",
      xlarge: "text-2xl md:text-4xl"
    },
    karaoke: {
      small: "text-xs md:text-sm",
      medium: "text-sm md:text-lg",
      large: "text-lg md:text-2xl",
      xlarge: "text-2xl md:text-4xl"
    },
    minimal: {
      small: "text-[10px] md:text-xs",
      medium: "text-xs md:text-sm",
      large: "text-sm md:text-base",
      xlarge: "text-base md:text-lg"
    }
  };
  return mapping[style][size];
}

// ─── Processing View ──────────────────────────────────────────────────────────
function ProcessingView({ sse, projectName, onCancel, isCancelling }: { sse: SSEEvent | null; projectName: string; onCancel: () => void; isCancelling: boolean }) {
  const currentStage = stageIndex(sse?.status || "uploading");

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-10">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary font-display">{projectName}</h2>
        <p className="text-sm text-text-muted mt-2">AI pipeline is processing your video…</p>
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
function RenderDoneView({ project }: { project: Project }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [videoPlay, setVideoPlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const captionStyle = project.captionStyle || "kinetic";
  const captionSize = project.captionSize || "medium";
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
      <div className="flex gap-4">
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
      </div>

      <Link href="/dashboard" className="text-xs text-text-muted hover:text-accent transition-colors font-mono">
        ← Back to dashboard
      </Link>
    </div>
  );
}

// ─── Chunk Block ──────────────────────────────────────────────────────────────
function ChunkBlock({
  chunk,
  isActive,
  totalDuration,
  onToggle,
  onCaptionEdit,
  onSelect,
}: {
  chunk: Chunk;
  isActive: boolean;
  totalDuration: number;
  onToggle: () => void;
  onCaptionEdit: (chunkIdx: number, capIdx: number, text: string) => void;
  onSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const widthPct = (chunk.duration / totalDuration) * 100;
  const score = chunk.editManifest?.score ?? 5;
  const scoreColor = score >= 8 ? "text-emerald-400" : score >= 6 ? "text-yellow-400" : "text-red-400";

  return (
    <div
      className={`relative shrink-0 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
        !chunk.userKeep
          ? "border-red-500/40 bg-red-500/5 opacity-60"
          : isActive
          ? "border-accent bg-accent/10"
          : "border-border bg-surface hover:border-accent/40"
      }`}
      style={{ minWidth: `${Math.max(widthPct * 2, 120)}px`, maxWidth: "320px" }}
      onClick={onSelect}
    >
      {/* Score badge */}
      <div className={`absolute top-2 right-2 text-[10px] font-mono font-bold ${scoreColor}`}>
        {score.toFixed(1)}
      </div>

      {/* Highlight star */}
      {(chunk.editManifest?.highlights?.length ?? 0) > 0 && chunk.userKeep && (
        <div className="absolute top-2 left-2">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        </div>
      )}

      <div className="p-3 pt-4">
        {/* Chunk label */}
        <p className="text-[10px] font-mono text-text-muted">Chunk {chunk.index + 1}</p>
        <p className="text-[10px] font-mono text-text-muted/60">
          {chunk.startTime.toFixed(1)}s – {chunk.endTime.toFixed(1)}s
        </p>

        {/* Transcript snippet */}
        {chunk.transcript && (
          <p className="text-[11px] text-text-muted mt-2 leading-tight line-clamp-2">
            &quot;{chunk.transcript.substring(0, 80)}{chunk.transcript.length > 80 ? "…" : ""}&quot;
          </p>
        )}

        {/* Filler word markers */}
        {(chunk.editManifest?.fillerWords?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {chunk.editManifest.fillerWords.slice(0, 4).map((fw, i) => (
              <span key={i} className="text-[9px] font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-1 rounded">
                {fw.word}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer ${
              chunk.userKeep
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400"
            }`}
          >
            {chunk.userKeep ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
            {chunk.userKeep ? "Keep" : "Cut"}
          </button>

          {(chunk.editManifest?.captions?.length ?? 0) > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(x => !x); }}
              className="flex items-center gap-1 text-[10px] font-mono text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {chunk.editManifest.captions.length} captions
            </button>
          )}
        </div>

        {/* Captions editor (expanded) */}
        {expanded && (
          <div className="mt-3 space-y-2 border-t border-border pt-3">
            {chunk.editManifest.captions.map((cap, ci) => (
              <div key={ci}>
                <p className="text-[9px] font-mono text-text-muted mb-1">
                  {cap.start.toFixed(1)}s – {cap.end.toFixed(1)}s
                </p>
                <textarea
                  value={cap.text}
                  onChange={(e) => onCaptionEdit(chunk.index, ci, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  rows={2}
                  className="w-full bg-background/60 border border-border rounded-lg px-2 py-1.5 text-[11px] text-text-primary resize-none focus:outline-none focus:border-accent/50 font-mono"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Timeline Review View ─────────────────────────────────────────────────────
function TimelineReview({
  project,
  onApprove,
  isRendering,
}: {
  project: Project;
  onApprove: (chunks: Chunk[], style: "kinetic" | "karaoke" | "minimal", size: "small" | "medium" | "large" | "xlarge", fontSize: number) => void;
  isRendering: boolean;
}) {
  const [chunks, setChunks] = useState<Chunk[]>(project.chunks || []);

  const [selectedChunk, setSelectedChunk] = useState<number | null>(null);
  const [videoPlay, setVideoPlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [captionStyle, setCaptionStyle] = useState<"kinetic" | "karaoke" | "minimal">(project.captionStyle || "kinetic");
  const [captionSize, setCaptionSize] = useState<"small" | "medium" | "large" | "xlarge">(project.captionSize || "medium");
  const [captionFontSize, setCaptionFontSize] = useState<number>(project.captionFontSize || 24);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

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

  handleResizeEndRef.current = handleResizeEnd;

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

  // Find active caption based on currentTime
  const activeCaption = chunks
    .filter(c => c.userKeep !== false)
    .flatMap(c => c.editManifest?.captions || [])
    .find(cap => currentTime >= cap.start && currentTime <= cap.end);

  const chunksRef = useRef(chunks);
  useEffect(() => {
    chunksRef.current = chunks;
  }, [chunks]);

  // Sync video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      // Find if current time is inside a cut chunk
      const activeChunks = chunksRef.current;
      const currentChunkIdx = activeChunks.findIndex(c => time >= c.startTime && time < c.endTime);

      if (currentChunkIdx >= 0) {
        const currentChunk = activeChunks[currentChunkIdx];
        if (currentChunk.userKeep === false) {
          // Find the next kept chunk
          const nextKeptChunk = activeChunks.slice(currentChunkIdx + 1).find(c => c.userKeep !== false);
          if (nextKeptChunk) {
            video.currentTime = nextKeptChunk.startTime;
            setCurrentTime(nextKeptChunk.startTime);
          } else {
            // No more kept chunks, pause video
            video.pause();
            setVideoPlay(false);
          }
        }
      }
    };
    const onDur = () => setVideoDuration(video.duration || 0);
    const onEnd = () => setVideoPlay(false);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("durationchange", onDur);
    video.addEventListener("ended", onEnd);
    return () => { video.removeEventListener("timeupdate", onTime); video.removeEventListener("durationchange", onDur); video.removeEventListener("ended", onEnd); };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (videoPlay) video.play().catch(() => setVideoPlay(false));
    else video.pause();
  }, [videoPlay]);

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
    setChunks(prev => prev.map((c, i) => i === idx ? { ...c, userKeep: !c.userKeep } : c));
  };

  const editCaption = (chunkIdx: number, capIdx: number, text: string) => {
    setChunks(prev => prev.map((c, i) => {
      if (i !== chunkIdx) return c;
      const captions = [...(c.editManifest?.captions || [])];
      captions[capIdx] = { ...captions[capIdx], text };
      return { ...c, editManifest: { ...c.editManifest, captions } };
    }));
  };

  const seekToChunk = (chunk: Chunk) => {
    if (videoRef.current) {
      videoRef.current.currentTime = chunk.startTime;
      setCurrentTime(chunk.startTime);
    }
    setSelectedChunk(chunk.index);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const keptDuration = chunks
    .filter(c => c.userKeep !== false)
    .reduce((s, c) => s + c.duration, 0);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top stats bar */}
      <div className="flex items-center gap-6 px-6 py-3 border-b border-border bg-surface/50 flex-wrap">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-mono text-text-muted">{keptCount}/{chunks.length} segments kept</span>
        </div>
        <div className="flex items-center gap-2">
          <Scissors className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs font-mono text-text-muted">
            {formatTime(keptDuration)} / {formatTime(totalDuration)} final duration
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-mono text-text-muted">
            {chunks.filter(c => (c.editManifest?.highlights?.length ?? 0) > 0).length} highlights
          </span>
        </div>

        <div className="ml-auto">
          <button
            onClick={() => onApprove(chunks, captionStyle, captionSize, captionFontSize)}
            disabled={isRendering || keptCount === 0}
            className="flex items-center gap-2 px-5 py-2 bg-accent text-background font-extrabold text-xs rounded-xl hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            {isRendering ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Rendering…</>
            ) : (
              <><CheckCircle className="w-3.5 h-3.5" /> Approve & Render</>
            )}
          </button>
        </div>
      </div>

      {/* Main layout: video preview + chunks */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left: Video Preview */}
        <div className="lg:w-[65%] flex flex-col gap-3 p-6 border-r border-border overflow-y-auto">
          <div className="relative flex-1 min-h-[300px] rounded-xl bg-black border border-border overflow-hidden group">
            <video
              ref={videoRef}
              src={`${API}/api/assets/${project.originalKey || ""}`}
              className="w-full h-full object-contain"
              playsInline
            />

            {/* Subtitle Overlay in Screen */}
            {activeCaption && (
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
            {selectedChunk !== null && (
              <div className={`absolute top-3 left-3 text-[10px] font-mono px-2 py-1 rounded-lg border ${
                chunks[selectedChunk]?.userKeep !== false
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                  : "bg-red-500/20 border-red-500/40 text-red-400"
              }`}>
                Chunk {selectedChunk + 1} · {chunks[selectedChunk]?.userKeep !== false ? "✓ KEEP" : "✗ CUT"}
              </div>
            )}

            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
              <button
                onClick={() => setVideoPlay(v => !v)}
                className="w-14 h-14 rounded-full bg-accent text-background flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform"
              >
                {videoPlay ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
              </button>
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-2.5">
            <button
              onClick={() => setVideoPlay(v => !v)}
              className="w-8 h-8 rounded-lg bg-border flex items-center justify-center hover:bg-accent hover:text-background transition-all cursor-pointer text-text-primary"
            >
              {videoPlay ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            </button>
            <span className="text-[11px] font-mono text-text-muted">
              <span className="text-text-primary">{formatTime(currentTime)}</span>
              {" / "}
              {formatTime(videoDuration || totalDuration)}
            </span>
            <input
              type="range"
              min={0}
              max={videoDuration || totalDuration}
              step={0.1}
              value={currentTime}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (videoRef.current) videoRef.current.currentTime = v;
                setCurrentTime(v);
              }}
              className="flex-1 h-1 accent-current cursor-pointer"
              style={{ accentColor: "var(--color-accent)" }}
            />
          </div>

          {/* Caption Style & Size Selector */}
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-text-muted uppercase">
                Visual Caption Style Template
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setCaptionStyle("kinetic")}
                  className={`p-2 rounded-lg border text-[10px] font-bold text-center transition-all cursor-pointer ${
                    captionStyle === "kinetic"
                      ? "bg-accent/15 border-accent text-accent"
                      : "bg-background/40 border-border text-text-muted hover:text-text-primary"
                  }`}
                >
                  ⚡ Kinetic
                </button>
                <button
                  onClick={() => setCaptionStyle("karaoke")}
                  className={`p-2 rounded-lg border text-[10px] font-bold text-center transition-all cursor-pointer ${
                    captionStyle === "karaoke"
                      ? "bg-accent/15 border-accent text-accent"
                      : "bg-background/40 border-border text-text-muted hover:text-text-primary"
                  }`}
                >
                  🎤 Karaoke
                </button>
                <button
                  onClick={() => setCaptionStyle("minimal")}
                  className={`p-2 rounded-lg border text-[10px] font-bold text-center transition-all cursor-pointer ${
                    captionStyle === "minimal"
                      ? "bg-accent/15 border-accent text-accent"
                      : "bg-background/40 border-border text-text-muted hover:text-text-primary"
                  }`}
                >
                  ▫️ Minimal
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-border pt-3">
              <span className="text-[10px] font-mono font-bold tracking-widest text-text-muted uppercase">
                Visual Caption Size
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(["small", "medium", "large", "xlarge"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setCaptionSize(size)}
                    className={`p-2 rounded-lg border text-[10px] font-bold text-center capitalize transition-all cursor-pointer ${
                      captionSize === size
                        ? "bg-accent/15 border-accent text-accent"
                        : "bg-background/40 border-border text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected chunk info */}
          {selectedChunk !== null && chunks[selectedChunk] && (
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-text-primary">Chunk {selectedChunk + 1}</p>
                  <p className="text-[10px] font-mono text-text-muted mt-0.5">
                    {chunks[selectedChunk].startTime.toFixed(1)}s – {chunks[selectedChunk].endTime.toFixed(1)}s
                    · {chunks[selectedChunk].duration.toFixed(1)}s long
                    · Score: {chunks[selectedChunk].editManifest?.score?.toFixed(1) ?? "N/A"}
                  </p>
                  {(chunks[selectedChunk].editManifest?.highlights?.length ?? 0) > 0 && (
                    <p className="text-[10px] text-yellow-400 mt-1">
                      ★ {chunks[selectedChunk].editManifest.highlights[0]}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggleChunk(selectedChunk)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    chunks[selectedChunk].userKeep !== false
                      ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                >
                  {chunks[selectedChunk].userKeep !== false ? (
                    <><XCircle className="w-3.5 h-3.5" /> Cut this</>
                  ) : (
                    <><CheckCircle className="w-3.5 h-3.5" /> Keep this</>
                  )}
                </button>
              </div>
              {chunks[selectedChunk].transcript && (
                <p className="text-[11px] text-text-muted mt-3 font-mono leading-relaxed border-t border-border pt-3">
                  &quot;{chunks[selectedChunk].transcript}&quot;
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Timeline chunks */}
        <div className="lg:w-[35%] flex flex-col min-h-0">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
              Timeline · {chunks.length} segments · Click to select, toggle to keep/cut
            </p>
          </div>

          {/* Horizontal scrollable timeline */}
          <div
            ref={timelineRef}
            className="p-4 overflow-x-auto shrink-0 border-b border-border"
          >
            <div className="flex gap-1 items-end h-12 min-w-max">
              {chunks.map((chunk, i) => {
                const widthPct = (chunk.duration / totalDuration) * 100;
                const score = chunk.editManifest?.score ?? 5;
                const scoreH = Math.max(30, Math.round((score / 10) * 48));
                return (
                  <div
                    key={i}
                    onClick={() => { seekToChunk(chunk); }}
                    className={`cursor-pointer rounded-t shrink-0 transition-all duration-200 ${
                      !chunk.userKeep ? "bg-red-500/30 border border-red-500/40" :
                      selectedChunk === i ? "bg-accent border border-accent" :
                      score >= 8 ? "bg-emerald-500/40 border border-emerald-500/30 hover:bg-emerald-500/60" :
                      "bg-purple-500/30 border border-purple-500/20 hover:bg-purple-500/50"
                    }`}
                    style={{ width: `${Math.max(widthPct * 3, 20)}px`, height: `${scoreH}px` }}
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
                    style={{ width: `${Math.max(widthPct * 3, 20)}px` }}
                  >
                    {formatTime(chunk.startTime)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chunk cards list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chunks.map((chunk, i) => (
              <ChunkBlock
                key={chunk.index}
                chunk={chunk}
                isActive={selectedChunk === i}
                totalDuration={totalDuration}
                onToggle={() => toggleChunk(i)}
                onCaptionEdit={editCaption}
                onSelect={() => seekToChunk(chunk)}
              />
            ))}
          </div>
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
  const sseRef = useRef<EventSource | null>(null);

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

  // SSE connection
  useEffect(() => {
    if (!projectId) return;

    const connect = () => {
      const token = getToken();
      const es = new EventSource(`${API}/api/video/${projectId}/status?token=${token}`);
      sseRef.current = es;

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as SSEEvent;
          setSse(data);
          if (data.status === "review" || data.status === "done" || data.status === "error") {
            loadProject();
          }
          if (data.status === "cancelled") {
            loadProject();
            es.close();
          }
          if (data.status === "done" || data.status === "error") {
            setIsRendering(false);
            es.close();
          }
        } catch {}
      };

      es.onerror = () => {
        es.close();
        setTimeout(connect, 3000);
      };
    };

    connect();
    return () => sseRef.current?.close();
  }, [projectId, loadProject]);

  // Note: SSE uses query param for auth since EventSource doesn't support headers
  // The backend SSE endpoint needs to also accept ?token= query param
  // For now it works because we fallback to DB lookup

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

      {/* Body */}
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
      {isDone && !isRendering && project && <RenderDoneView project={project} />}
      {isRendering && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <RefreshCw className="w-12 h-12 animate-spin text-accent mx-auto" />
            <p className="text-lg font-bold text-text-primary">Rendering your video…</p>
            <p className="text-sm text-text-muted font-mono">{sse?.message || "Combining segments..."}</p>
            <div className="w-64 h-1.5 bg-border rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${sse?.progress || 10}%` }} />
            </div>
          </div>
        </div>
      )}
      {isProcessing && !isRendering && (
        <ProcessingView sse={sse} projectName={project?.name || "Your Video"} onCancel={handleCancel} isCancelling={isCancelling} />
      )}
      {currentStatus === "review" && project && project.chunks && project.chunks.length > 0 && !isRendering && (
        <TimelineReview project={project} onApprove={handleApprove} isRendering={isRendering} />
      )}
    </div>
  );
}
