"use client";

import React from "react";

const TICKER_TEXT =
  "SCRIPTS · CAPTIONS · B-ROLL · SUBTITLES · SILENCE TRIMMER · VIDEO EDITOR · SCRIPTS · CAPTIONS · B-ROLL · SUBTITLES · SILENCE TRIMMER · VIDEO EDITOR · ";

export default function TickerTape() {
  return (
    <section className="w-full bg-accent py-3 overflow-hidden select-none">
      <div
        className="flex whitespace-nowrap"
        style={{ animation: "marquee 25s linear infinite" }}
      >
        <span className="font-mono text-sm font-bold text-black tracking-wider px-4">
          {TICKER_TEXT}
        </span>
        <span className="font-mono text-sm font-bold text-black tracking-wider px-4">
          {TICKER_TEXT}
        </span>
      </div>
    </section>
  );
}
