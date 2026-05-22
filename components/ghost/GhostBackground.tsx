"use client";

import { GhostMode, VoiceState } from "./types";


export default function GhostBackground({
  mode,
  voiceState,
}: {
  mode: GhostMode;
  voiceState: VoiceState;
}) {
  const voiceOnly = mode === "voce-voce";

  if (voiceOnly) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[150px]" />

      {Array.from({ length: 22 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.9)]"
          style={{
            left: `${10 + ((i * 37) % 80)}%`,
            top: `${15 + ((i * 29) % 70)}%`,
            animation: `ghostFlicker ${2.4 + (i % 5)}s ease-in-out infinite`,
            opacity: voiceState === "idle" ? 0.35 : 0.8,
          }}
        />
      ))}
    </div>
  );
}

  const stateClass =
    voiceState === "listening"
      ? "scale-105 opacity-100"
      : voiceState === "thinking"
        ? "scale-95 opacity-80"
        : voiceState === "speaking"
          ? "scale-105 opacity-100"
          : "scale-100 opacity-75";

  const coreColor =
    voiceState === "listening"
      ? "bg-cyan-200/55"
      : voiceState === "thinking"
        ? "bg-blue-400/35"
        : voiceState === "speaking"
          ? "bg-cyan-100/70"
          : "bg-cyan-300/30";

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className={`absolute left-1/2 ${
          voiceOnly ? "top-[47%]" : "top-[46%]"
        } h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[140px] transition-all duration-700 ${stateClass}`}
        style={{ animation: "ghostCorePulse 5s ease-in-out infinite" }}
      />

      <div
        className={`absolute left-1/2 ${
          voiceOnly ? "top-[47%]" : "top-[46%]"
        } h-[470px] w-[470px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20 bg-cyan-400/8 shadow-[0_0_130px_rgba(34,211,238,0.22)] transition-all duration-700 ${stateClass}`}
      />

      <div
        className={`absolute left-1/2 ${
          voiceOnly ? "top-[47%]" : "top-[46%]"
        } h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full`}
        style={{
          animation:
            voiceState === "thinking"
              ? "ghostOrbit 4s linear infinite"
              : "ghostOrbit 11s linear infinite",
        }}
      >
        <div className="absolute left-1/2 top-0 h-3 w-24 -translate-x-1/2 rounded-full bg-cyan-200/80 blur-[2px] shadow-[0_0_40px_rgba(34,211,238,0.9)]" />
        <div className="absolute bottom-10 right-8 h-2 w-20 rounded-full bg-blue-300/70 blur-[2px] shadow-[0_0_32px_rgba(34,211,238,0.75)]" />
        <div className="absolute left-5 top-1/3 h-2 w-14 rounded-full bg-cyan-100/65 blur-[1px] shadow-[0_0_28px_rgba(125,249,255,0.8)]" />
      </div>

      <div
        className={`absolute left-1/2 ${
          voiceOnly ? "top-[47%]" : "top-[46%]"
        } h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full`}
        style={{
          animation:
            voiceState === "speaking"
              ? "ghostReverseOrbit 3.5s linear infinite"
              : "ghostReverseOrbit 8s linear infinite",
        }}
      >
        <div className="absolute right-0 top-1/2 h-2 w-20 rounded-full bg-cyan-100/80 blur-[1px] shadow-[0_0_42px_rgba(125,249,255,0.9)]" />
        <div className="absolute bottom-2 left-10 h-2 w-14 rounded-full bg-cyan-400/70 blur-[1px] shadow-[0_0_30px_rgba(34,211,238,0.8)]" />
      </div>

      <div
        className={`absolute left-1/2 ${
          voiceOnly ? "top-[47%]" : "top-[46%]"
        } h-[135px] w-[135px] -translate-x-1/2 -translate-y-1/2 rounded-full ${coreColor} shadow-[0_0_100px_rgba(34,211,238,0.9)] transition-all duration-500 ${stateClass}`}
        style={{ animation: "ghostCorePulse 2.4s ease-in-out infinite" }}
      />

      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.9)]"
          style={{
            left: `${15 + ((i * 37) % 70)}%`,
            top: `${18 + ((i * 29) % 62)}%`,
            animation: `ghostFlicker ${2.4 + (i % 5)}s ease-in-out infinite`,
            opacity: voiceState === "idle" ? 0.35 : 0.8,
          }}
        />
      ))}
    </div>
  );
}