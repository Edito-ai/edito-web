"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  PenTool,
  MessageSquare,
  Video,
  Send,
  Sparkles,
  Pause,
  Play,
  Scissors
} from "lucide-react";

const mockSubtitles = [
  { text: "Hey everyone! Today, let's build something crazy...", start: 0, end: 25 },
  { text: "We are auto-transcribing this in real-time.", start: 25, end: 50 },
  { text: "Notice how the subtitles sync with the voice?", start: 50, end: 75 },
  { text: "One click, AI B-rolls, and boom—you are ready to go!", start: 75, end: 100 }
];

export default function Playground() {
  // Playground Sandbox States
  const [sandboxTab, setSandboxTab] = useState<"write" | "caption" | "video">("write");

  // Sandbox - Write
  const [writePrompt, setWritePrompt] = useState("Write a YouTube script about the future of AI video editing");
  const [writeOutput, setWriteOutput] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const samplePrompts = [
    "Write a YouTube script about the future of AI video editing",
    "Draft a tech blog post about cinematic composition",
    "Create a hook for a newsletter about viral video hooks"
  ];

  const simulatedDrafts: Record<string, string> = {
    "Write a YouTube script about the future of AI video editing":
      "[Hook - 0:00]\nMost video editors spend 90% of their time on repetitive tasks: cutting silences, syncing audio, and hunting for B-roll.\n\n[Body - 0:30]\nBut AI is changing the timeline forever. We're talking real-time color grading matching, automated semantic video trims based on transcripts, and voice-to-broll integration.\n\n[Call to Action - 1:15]\nIf you aren't integrating AI workspaces into your workflow today, you are already falling behind. Let's look at the top 3 tools...",
    "Draft a tech blog post about cinematic composition":
      "# Cinematic Composition in the AI Era\n\nComposition has always been the visual language of filmmaking. Rule of thirds, leading lines, and symmetric depth define how audiences feel.\n\nToday, AI-driven layouts can analyze footage dynamically and recommend micro-reframing. For editors, this means instantly centering vertical shorts without losing context...",
    "Create a hook for a newsletter about viral video hooks":
      "Subject: 3 hooks that generated 54M views (steal them)\n\nHey Creators,\n\nIf the first 3 seconds of your video don't punch the viewer in the face, the remaining 3 minutes don't exist.\n\nHere are three high-retention hook structures you can copy-paste today..."
  };

  const handleStartWriting = (promptText = writePrompt) => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setIsWriting(true);
    setWriteOutput("");
    
    const targetText = simulatedDrafts[promptText] || simulatedDrafts[samplePrompts[0]];
    let currentCharIndex = 0;
    
    typingTimerRef.current = setInterval(() => {
      if (currentCharIndex < targetText.length) {
        setWriteOutput(prev => prev + targetText.charAt(currentCharIndex));
        currentCharIndex++;
      } else {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setIsWriting(false);
      }
    }, 12);
  };

  // Sandbox - Caption
  const [captionTheme, setCaptionTheme] = useState("3 editing tips to double video retention");
  const [captionOutput, setCaptionOutput] = useState({
    tiktok: "🎥 Want to DOUBLE your video retention? Stop doing this! 👇\n\n1️⃣ Aggressive J-Cuts: Let the audio lead the visual shift.\n2️⃣ B-Roll every 3s: Keep the visual cortex stimulated.\n3️⃣ Visual zooms: Emphasize core statements.\n\n#editingtips #filmmaker #socialgrowth #stedioai",
    linkedin: "The average watch time for video is dropping year-over-year. How do you fight back?\n\nHere are 3 video editing principles we use at stedio.ai:\n\n💡 1. Prioritize J-Cuts: Let the audio pull the viewer into the next shot.\n🚀 2. Scale the pace: Switch visual patterns every 2.5 - 4 seconds.\n📈 3. Kinetic typography: Caption key moments, not just words.\n\nWhat's your biggest retention strategy?",
    twitter: "If you want to keep viewers hooked, stop editing chronologically. 🧵\n\nHere are 3 visual editing rules that double video retention:\n\n1/ The J-Cut Transition: Sound precedes visual. It tricks the brain into anticipating the next scene smoothly."
  });
  const [activeCaptionTab, setActiveCaptionTab] = useState<"tiktok" | "linkedin" | "twitter">("tiktok");

  const handleGenerateCaptions = () => {
    const base = captionTheme || "editing secrets";
    setCaptionOutput({
      tiktok: `🎥 VIRAL SHORT: "${base}" 🔥\n\nHere is what they don't tell you:\n👉 Cut out breaths & micro-pauses\n👉 Zoom in 1.1x on key phrases\n👉 Punchy captions on screen\n\nBookmark this for later! 💾 #editors #growthtips #stedioai`,
      linkedin: `Struggling to make an impact with "${base}"?\n\nAfter analyzing 500+ top-performing media campaigns, here's what actually drives viewer retention:\n\n1. Action-First Hooks: Start mid-motion.\n2. Contextual Subtitles: Keep sound-off users engaged.\n3. Emotional Color Grades.\n\nWhat has been your experience?`,
      twitter: `Writing captions for "${base}"? Here is the cheat sheet to boost engagement by 80%:\n\n• Use sound effects (SFX) on visual changes\n• Apply zoom keyframes to emphasize emotions\n• Match typography with the mood\n\nSimple but effective.`
    });
  };

  // Sandbox - Video
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);
  const [playheadPos, setPlayheadPos] = useState(0);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(0);
  const [autoCutStatus, setAutoCutStatus] = useState(false);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (videoIsPlaying) {
      videoIntervalRef.current = setInterval(() => {
        setPlayheadPos(prev => {
          const next = prev + 1;
          if (next > 100) {
            setVideoIsPlaying(false);
            if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
            return 0;
          }
          const activeSub = mockSubtitles.findIndex(sub => next >= sub.start && next <= sub.end);
          if (activeSub !== -1) {
            setActiveSubtitleIndex(activeSub);
          }
          return next;
        });
      }, 80);
    } else {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    }

    return () => {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, [videoIsPlaying]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, []);

  return (
    <section id="playground" className="py-20 bg-zinc-950/40 border-y border-zinc-800/40 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-indigo-400 text-xs font-extrabold uppercase tracking-widest mb-3 block">LIVE INTERACTIVE WORKSPACE</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Try the Stedio Workspace Simulator</h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Explore how easy it is to handle tasks inside our ecosystem. Click on the features below to test them out.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Sandbox Controls Column */}
          <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
            <button
              onClick={() => setSandboxTab("write")}
              className={`p-5 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                sandboxTab === "write"
                  ? "bg-purple-950/20 border-purple-500/50 shadow-lg shadow-purple-500/5"
                  : "bg-zinc-900/30 border-zinc-800/60 hover:bg-zinc-900/50 hover:border-zinc-700"
              }`}
            >
              <div className={`p-2.5 rounded-lg border ${
                sandboxTab === "write" ? "bg-purple-500/20 border-purple-400/30 text-purple-300" : "bg-zinc-900 border-zinc-800 text-zinc-400"
              }`}>
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-200">1. AI Content Writer</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Generate highly structured video drafts and posts.</p>
              </div>
            </button>

            <button
              onClick={() => setSandboxTab("caption")}
              className={`p-5 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                sandboxTab === "caption"
                  ? "bg-indigo-950/20 border-indigo-500/50 shadow-lg shadow-indigo-500/5"
                  : "bg-zinc-900/30 border-zinc-800/60 hover:bg-zinc-900/50 hover:border-zinc-700"
              }`}
            >
              <div className={`p-2.5 rounded-lg border ${
                sandboxTab === "caption" ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-300" : "bg-zinc-900 border-zinc-800 text-zinc-400"
              }`}>
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-200">2. Viral Caption Writer</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Compile formatted captions for multi-channel posts.</p>
              </div>
            </button>

            <button
              onClick={() => setSandboxTab("video")}
              className={`p-5 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                sandboxTab === "video"
                  ? "bg-pink-950/20 border-pink-500/50 shadow-lg shadow-pink-500/5"
                  : "bg-zinc-900/30 border-zinc-800/60 hover:bg-zinc-900/50 hover:border-zinc-700"
              }`}
            >
              <div className={`p-2.5 rounded-lg border ${
                sandboxTab === "video" ? "bg-pink-500/20 border-pink-400/30 text-pink-300" : "bg-zinc-900 border-zinc-800 text-zinc-400"
              }`}>
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-200">3. Smart Video Editor</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Edit media segments, audio layers, and captions.</p>
              </div>
            </button>
          </div>

          {/* Interactive Screen Column */}
          <div className="lg:col-span-8 bg-[#09090b] border border-zinc-800 rounded-2xl flex flex-col overflow-hidden min-h-[460px] shadow-2xl relative">
            {/* Screen Top Bar */}
            <div className="h-12 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between px-5">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-zinc-400" />
                </div>
                <span className="text-xs font-semibold text-zinc-400">
                  {sandboxTab === "write" && "Stedio Writer v2.0"}
                  {sandboxTab === "caption" && "Stedio Caption Generator"}
                  {sandboxTab === "video" && "Stedio Video Timeline Studio"}
                </span>
              </div>
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              </div>
            </div>

            {/* Tab Content Panels */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              
              {/* 1. WRITE PANEL */}
              {sandboxTab === "write" && (
                <div className="flex-1 flex flex-col justify-between gap-6">
                  <div className="flex flex-col gap-4">
                    <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Select a Topic / Prompt</label>
                    <div className="flex flex-wrap gap-2">
                      {samplePrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setWritePrompt(prompt);
                            setWriteOutput("");
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-left ${
                            writePrompt === prompt
                              ? "bg-purple-500/20 border border-purple-500/40 text-purple-300"
                              : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    {/* Custom prompt text */}
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={writePrompt}
                        onChange={(e) => setWritePrompt(e.target.value)}
                        className="flex-1 text-xs bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-purple-500"
                        placeholder="Type a custom prompt..."
                      />
                      <button
                        onClick={() => handleStartWriting(writePrompt)}
                        disabled={isWriting}
                        className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition-colors"
                        title="Generate Script"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Output Window */}
                  <div className="flex-1 min-h-[180px] bg-black border border-zinc-800/80 rounded-xl p-4 font-mono text-xs overflow-y-auto max-h-[220px] relative">
                    <span className="absolute top-2 right-2 text-[10px] text-zinc-600">PREVIEW</span>
                    {writeOutput ? (
                      <p className="whitespace-pre-line text-zinc-300 leading-relaxed">
                        {writeOutput}
                        {isWriting && <span className="inline-block w-1.5 h-4 bg-purple-400 ml-1 animate-pulse" />}
                      </p>
                    ) : (
                      <div className="h-full flex items-center justify-center text-zinc-600 italic">
                        Click Generate to simulate the writing pipeline...
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartWriting(writePrompt)}
                    disabled={isWriting}
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800/50 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {isWriting ? "Generating Draft..." : "Generate AI Draft"}
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* 2. CAPTION PANEL */}
              {sandboxTab === "caption" && (
                <div className="flex-1 flex flex-col justify-between gap-6">
                  <div className="flex flex-col gap-3">
                    <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Video Theme</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={captionTheme}
                        onChange={(e) => setCaptionTheme(e.target.value)}
                        className="flex-1 text-xs bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={handleGenerateCaptions}
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                      >
                        Adapt Copy
                      </button>
                    </div>
                  </div>

                  {/* Social Network Selector */}
                  <div className="flex gap-2 border-b border-zinc-800 pb-2.5">
                    <button
                      onClick={() => setActiveCaptionTab("tiktok")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeCaptionTab === "tiktok" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      TikTok / Shorts
                    </button>
                    <button
                      onClick={() => setActiveCaptionTab("linkedin")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeCaptionTab === "linkedin" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      LinkedIn
                    </button>
                    <button
                      onClick={() => setActiveCaptionTab("twitter")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeCaptionTab === "twitter" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      X (Twitter)
                    </button>
                  </div>

                  {/* Social Output Preview */}
                  <div className="flex-1 min-h-[160px] max-h-[180px] bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 overflow-y-auto text-xs relative">
                    <span className="absolute top-2 right-2 text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">
                      {activeCaptionTab} Card
                    </span>
                    <p className="whitespace-pre-line text-zinc-300 leading-[1.6]">
                      {activeCaptionTab === "tiktok" && captionOutput.tiktok}
                      {activeCaptionTab === "linkedin" && captionOutput.linkedin}
                      {activeCaptionTab === "twitter" && captionOutput.twitter}
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(
                        activeCaptionTab === "tiktok" ? captionOutput.tiktok :
                        activeCaptionTab === "linkedin" ? captionOutput.linkedin : captionOutput.twitter
                      );
                      alert("Copied to clipboard!");
                    }}
                    className="w-full py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-bold transition-colors"
                  >
                    Copy Output Caption
                  </button>
                </div>
              )}

              {/* 3. VIDEO PANEL */}
              {sandboxTab === "video" && (
                <div className="flex-1 flex flex-col justify-between gap-5">
                  {/* Media Monitor Screen */}
                  <div className="relative aspect-16/7 border border-zinc-800 rounded-xl bg-black overflow-hidden flex flex-col justify-between p-3">
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-900/10 to-transparent" />
                    
                    {/* Subtitle Display */}
                    <div className="flex-1 flex items-center justify-center text-center p-4 z-10">
                      <span className="text-sm font-extrabold uppercase tracking-wide bg-yellow-400 text-black px-2 py-0.5 rounded shadow">
                        {mockSubtitles[activeSubtitleIndex]?.text}
                      </span>
                    </div>

                    {/* Video Controls Bar */}
                    <div className="z-10 flex items-center justify-between text-zinc-400 text-[10px] bg-zinc-950/80 backdrop-blur px-3 py-1.5 rounded-lg border border-zinc-800/60">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setVideoIsPlaying(!videoIsPlaying)}
                          className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
                        >
                          {videoIsPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                        </button>
                        <span>{videoIsPlaying ? "Playing Preview" : "Paused"}</span>
                      </div>
                      <span className="font-mono text-[9px]">00:00:{String(Math.floor(playheadPos / 10)).padStart(2, '0')}</span>
                    </div>
                  </div>

                  {/* Timeline Controls */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setAutoCutStatus(!autoCutStatus);
                        if (!autoCutStatus) {
                          alert("Removed 3 empty silent gaps from the video transcript!");
                        }
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                        autoCutStatus
                          ? "bg-emerald-950/30 border-emerald-500/60 text-emerald-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      {autoCutStatus ? "Silence Trimmed" : "Remove Silences (Auto-Cut)"}
                    </button>
                    <button
                      onClick={() => {
                        setVideoIsPlaying(true);
                        setPlayheadPos(0);
                      }}
                      className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-current" /> Play Preview
                    </button>
                  </div>

                  {/* Timeline Tracks */}
                  <div className="flex flex-col gap-1.5 bg-[#050506] border border-zinc-800 p-2.5 rounded-lg font-mono text-[9px] relative overflow-hidden">
                    <div className="absolute top-0 bottom-0 w-[2px] bg-pink-500 z-20 pointer-events-none transition-all duration-75" style={{ left: `${playheadPos}%` }} />
                    
                    {/* Track 1: Subtitle Text Blocks */}
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-zinc-500">Subs</span>
                      <div className="flex-1 h-5 bg-zinc-950 border border-zinc-900/60 rounded flex items-center p-0.5 gap-0.5 relative">
                        <div className={`h-full rounded text-[8px] flex items-center justify-center text-center truncate ${activeSubtitleIndex === 0 ? "bg-yellow-500/30 text-yellow-300 font-bold border border-yellow-500/40" : "bg-zinc-900 text-zinc-600"}`} style={{ width: "25%" }}>Intro</div>
                        <div className={`h-full rounded text-[8px] flex items-center justify-center text-center truncate ${activeSubtitleIndex === 1 ? "bg-yellow-500/30 text-yellow-300 font-bold border border-yellow-500/40" : "bg-zinc-900 text-zinc-600"}`} style={{ width: "25%" }}>Auto</div>
                        <div className={`h-full rounded text-[8px] flex items-center justify-center text-center truncate ${activeSubtitleIndex === 2 ? "bg-yellow-500/30 text-yellow-300 font-bold border border-yellow-500/40" : "bg-zinc-900 text-zinc-600"}`} style={{ width: "25%" }}>Sync</div>
                        <div className={`h-full rounded text-[8px] flex items-center justify-center text-center truncate ${activeSubtitleIndex === 3 ? "bg-yellow-500/30 text-yellow-300 font-bold border border-yellow-500/40" : "bg-zinc-900 text-zinc-600"}`} style={{ width: "25%" }}>Outro</div>
                      </div>
                    </div>

                    {/* Track 2: Video Track */}
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-zinc-500">Video</span>
                      <div className="flex-1 h-5 bg-zinc-950 border border-zinc-900/60 rounded flex items-center p-0.5 gap-1 relative">
                        <div className="h-full bg-indigo-950 border border-indigo-900/40 rounded flex-1 flex items-center px-1 text-indigo-400">
                          {autoCutStatus ? "[Trimmed gaps]" : "A-Roll_Interview.mp4"}
                        </div>
                      </div>
                    </div>

                    {/* Track 3: Audio Track with fully deterministic height parameters to prevent SSR mismatch */}
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-zinc-500">Audio</span>
                      <div className="flex-1 h-5 bg-zinc-950 border border-zinc-900/60 rounded flex items-center p-0.5 relative">
                        <div className="absolute inset-y-0.5 left-0.5 right-0.5 bg-purple-950/40 border border-purple-900/30 rounded flex items-center">
                          <div className="w-full flex items-end gap-px px-1 h-[60%] opacity-40">
                            {Array.from({ length: 40 }).map((_, i) => (
                              <div
                                key={i}
                                className="bg-purple-400 w-[2px] rounded-t"
                                style={{
                                  height: `${
                                    i % 5 === 0 && !autoCutStatus
                                      ? 2
                                      : Math.round(Math.abs(Math.sin(i * 0.9)) * 10 + 4)
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
              )}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
