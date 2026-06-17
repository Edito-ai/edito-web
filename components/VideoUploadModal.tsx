"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Video, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  onClose: () => void;
}

export default function VideoUploadModal({ onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const acceptFile = (f: File) => {
    if (!f.type.startsWith("video/")) {
      setError("Only video files are accepted.");
      return;
    }
    if (f.size > 2 * 1024 * 1024 * 1024) {
      setError("File must be under 2 GB.");
      return;
    }
    setError("");
    setFile(f);
    if (!projectName) setProjectName(f.name.replace(/\.[^.]+$/, ""));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) acceptFile(f);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");

    const token = localStorage.getItem("Stedtio_token");
    const formData = new FormData();
    formData.append("video", file);
    formData.append("name", projectName || file.name.replace(/\.[^.]+$/, ""));

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:5000/api/video/upload");
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 201) {
            const data = JSON.parse(xhr.responseText);
            resolve();
            router.push(`/dashboard/editor/${data.projectId}`);
          } else {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || "Upload failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(formData);
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes > 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes > 1e6) return `${(bytes / 1e6).toFixed(0)} MB`;
    return `${(bytes / 1e3).toFixed(0)} KB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
              <Video className="w-4.5 h-4.5 text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">Upload Video</h2>
              <p className="text-[10px] text-text-muted font-mono">AI pipeline will process automatically</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-border/60 hover:bg-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !file && inputRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer select-none ${
              dragging
                ? "border-accent bg-accent/5 scale-[1.01]"
                : file
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-border hover:border-accent/50 hover:bg-accent/3 bg-background/40"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) acceptFile(e.target.files[0]); }}
            />

            {file ? (
              <>
                <CheckCircle className="w-10 h-10 text-emerald-400" />
                <div className="text-center">
                  <p className="text-sm font-bold text-text-primary truncate max-w-[280px]">{file.name}</p>
                  <p className="text-xs text-text-muted mt-1">{formatSize(file.size)} · {file.type}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); setProjectName(""); }}
                  className="text-[10px] font-mono text-text-muted hover:text-accent transition-colors cursor-pointer"
                >
                  Change file
                </button>
              </>
            ) : (
              <>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${dragging ? "bg-accent/20" : "bg-border"}`}>
                  <Upload className={`w-6 h-6 transition-colors ${dragging ? "text-accent" : "text-text-muted"}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-text-primary">
                    {dragging ? "Drop it!" : "Drag & drop your video"}
                  </p>
                  <p className="text-xs text-text-muted mt-1">or <span className="text-accent">browse files</span> · MP4, MOV, MKV, WebM</p>
                  <p className="text-[10px] font-mono text-text-muted/60 mt-2">Max 2 GB</p>
                </div>
              </>
            )}
          </div>

          {/* Project Name */}
          {file && (
            <div>
              <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome Video"
                className="w-full bg-background/60 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted/40 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-text-muted">
                  {uploadProgress < 100 ? "Uploading…" : "Processing pipeline…"}
                </span>
                <span className="text-xs font-mono text-accent">{uploadProgress}%</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 font-mono">
              ⚠ {error}
            </p>
          )}

          {/* Pipeline stages hint */}
          {!uploading && file && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {["Upload", "→", "Scene detect", "→", "Transcribe", "→", "AI edit", "→", "Review"].map((step, i) => (
                <span key={i} className={`text-[10px] font-mono ${step === "→" ? "text-border" : "text-text-muted bg-border/50 px-1.5 py-0.5 rounded"}`}>
                  {step}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={uploading}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-text-muted hover:text-text-primary hover:bg-border/50 transition-all disabled:opacity-40 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 py-2.5 rounded-xl bg-accent text-background font-extrabold text-sm transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadProgress < 100 ? "Uploading…" : "Redirecting…"}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Start AI Edit
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
