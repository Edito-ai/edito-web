"use client";

import React, { useState } from "react";
import { Play, Download, Scissors, Sparkles, Trophy, Flame } from "lucide-react";

interface ClipRecommendation {
  label: "short_form" | "long_form" | "hook_moment";
  segment_id: string;
  start_time: number;
  end_time: number;
  confidence: number;
  display_reason: string;
  clip_url: string;
  thumbnail_url: string;
  status: string;
}

interface ClipDiscoveryScreenProps {
  recommendations: ClipRecommendation[];
  onEditInTimeline: (segmentId: string, startTime: number) => void;
}

export default function ClipDiscoveryScreen({
  recommendations = [],
  onEditInTimeline,
}: ClipDiscoveryScreenProps) {
  // Track which clip is currently playing inline
  const [activePlayLabel, setActivePlayLabel] = useState<string | null>(null);

  // Helper to format seconds as mm:ss
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Helper to format total video duration text
  const formatContentAnalysed = (sec: number) => {
    if (sec < 60) {
      return `${Math.round(sec)}s`;
    }
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  };

  // Calculate maximum end time of all recommendations to estimate total duration
  const maxDuration = recommendations.length > 0 
    ? Math.max(...recommendations.map(r => r.end_time)) 
    : 0;

  // Badge styling configuration
  const getBadgeStyle = (label: string) => {
    switch (label) {
      case "hook_moment":
        return {
          text: "Hook Moment",
          bgClass: "bg-linear-to-r from-rose-500 to-amber-500 text-white shadow-rose-500/10",
          icon: Flame,
        };
      case "short_form":
        return {
          text: "Short Form",
          bgClass: "bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/10",
          icon: Sparkles,
        };
      case "long_form":
        return {
          text: "Long Form Highlight",
          bgClass: "bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/10",
          icon: Trophy,
        };
      default:
        return {
          text: label,
          bgClass: "bg-border text-text-primary",
          icon: Sparkles,
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto max-w-6xl mx-auto w-full gap-8 select-none">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary font-display flex items-center gap-2">
          <span>Your best moments</span>
          <Sparkles className="w-5 h-5 text-accent animate-pulse" />
        </h2>
        <p className="text-xs text-text-muted font-mono">
          {recommendations.length} {recommendations.length === 1 ? "clip" : "clips"} found · {formatContentAnalysed(maxDuration)} of content analysed
        </p>
      </div>

      {/* Grid of Clip Cards */}
      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((rec) => {
            const isPlaying = activePlayLabel === rec.label;
            const badge = getBadgeStyle(rec.label);
            const BadgeIcon = badge.icon;

            return (
              <div 
                key={rec.label}
                className="group flex flex-col bg-surface border border-border hover:border-accent/40 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg shadow-black/10 flex-1"
              >
                {/* Media Container (Thumbnail or Video Player) */}
                <div className="relative aspect-video bg-black/90 w-full overflow-hidden border-b border-border">
                  {isPlaying ? (
                    <video
                      src={rec.clip_url}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div 
                      onClick={() => setActivePlayLabel(rec.label)}
                      className="relative w-full h-full cursor-pointer overflow-hidden"
                    >
                      {/* Thumbnail Image */}
                      {rec.thumbnail_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                          src={rec.thumbnail_url} 
                          alt={badge.text}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-text-muted">
                          <Play className="w-8 h-8 opacity-45" />
                        </div>
                      )}

                      {/* Dark Overlay */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/45 transition-colors duration-300" />

                      {/* Play Hover Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-accent text-background flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Timestamp range badge on video */}
                      <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/75 backdrop-blur-md border border-border/20 text-[10px] font-mono text-text-primary">
                        {formatSeconds(rec.start_time)} – {formatSeconds(rec.end_time)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-5 flex-1 flex flex-col gap-4">
                  {/* Badge & Rating */}
                  <div className="flex items-center justify-between gap-3 shrink-0">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold shadow-xs ${badge.bgClass}`}>
                      <BadgeIcon className="w-3 h-3" />
                      {badge.text}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">
                      {formatSeconds(rec.end_time - rec.start_time)} clip
                    </span>
                  </div>

                  {/* display_reason */}
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-text-primary leading-snug">
                      {rec.display_reason}
                    </p>
                  </div>

                  {/* Confidence Rating Progress */}
                  <div className="space-y-1.5 shrink-0">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-text-muted">Match Confidence</span>
                      <span className="text-accent font-bold">{rec.confidence}%</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-accent to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${rec.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 shrink-0">
                    {rec.clip_url ? (
                      <a
                        href={rec.clip_url}
                        download={`${rec.label}.mp4`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 bg-surface hover:bg-border/40 border border-border text-text-primary font-bold text-[10px] rounded-xl transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    ) : (
                      <button
                        disabled
                        className="flex items-center justify-center gap-1.5 py-2 bg-surface border border-border text-text-muted font-bold text-[10px] rounded-xl opacity-40 cursor-not-allowed"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    )}
                    <button
                      onClick={() => onEditInTimeline(rec.segment_id, rec.start_time)}
                      className="flex items-center justify-center gap-1.5 py-2 bg-accent text-background hover:brightness-110 font-bold text-[10px] rounded-xl transition-all cursor-pointer"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      Edit Timeline
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-2xl bg-surface/30">
          <Sparkles className="w-10 h-10 text-text-muted mb-3" />
          <h3 className="text-sm font-semibold text-text-primary">No recommendations ready</h3>
          <p className="text-xs text-text-muted mt-1 max-w-xs">
            We couldn&apos;t retrieve clip recommendations for this project. Use the timeline editor to cut manually.
          </p>
        </div>
      )}
    </div>
  );
}
