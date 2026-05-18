"use client";

import { VoiceState } from "./types";

export default function GhostCore({
  voiceState,
  micEnabled,
  onClick,
  compact = false,
}: {
  voiceState: VoiceState;
  micEnabled: boolean;
  onClick?: () => void;
  compact?: boolean;
}) {
  const sizeClass = compact
    ? "h-[220px] w-[220px]"
    : "h-[360px] w-[360px]";

  const innerSizeClass = compact
    ? "h-24 w-24"
    : "h-32 w-32";

  const active = micEnabled;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex ${sizeClass} items-center justify-center rounded-full outline-none transition-all duration-700 ${
        active ? "opacity-100" : "opacity-55 grayscale"
      }`}
    >
      <div
        className={`absolute inset-[-20%] rounded-full blur-[90px] ${
          active ? "bg-cyan-400/18" : "bg-red-400/10"
        }`}
        style={{
          animation: "ghostPlasmaBreath 5s ease-in-out infinite",
        }}
      />

      <div
        className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(125,249,255,0.28),rgba(34,211,238,0.12)_36%,rgba(8,47,73,0.10)_58%,transparent_74%)]"
        style={{
          animation: "ghostPlasmaBreath 4.6s ease-in-out infinite",
        }}
      />

      <div
        className="absolute inset-[8%] rounded-full bg-[conic-gradient(from_20deg,transparent,rgba(34,211,238,0.85),rgba(125,249,255,0.25),transparent,rgba(59,130,246,0.55),transparent,rgba(34,211,238,0.75),transparent)] blur-[8px]"
        style={{
          animation:
            voiceState === "thinking"
              ? "ghostPlasmaSpin 6s linear infinite"
              : voiceState === "speaking"
                ? "ghostPlasmaSpin 4s linear infinite"
                : "ghostPlasmaSpin 14s linear infinite",
        }}
      />

      <div
        className="absolute inset-[5%] rounded-full bg-[radial-gradient(circle_at_30%_35%,rgba(125,249,255,0.55),transparent_18%),radial-gradient(circle_at_70%_42%,rgba(34,211,238,0.48),transparent_20%),radial-gradient(circle_at_45%_78%,rgba(59,130,246,0.45),transparent_18%),radial-gradient(circle_at_50%_50%,transparent_42%,rgba(34,211,238,0.34)_55%,transparent_72%)] blur-[10px]"
        style={{
          animation:
            voiceState === "speaking"
              ? "ghostPlasmaBreath 1.1s ease-in-out infinite"
              : "ghostPlasmaBreath 3.2s ease-in-out infinite",
        }}
      />

      <div className="absolute inset-[26%] rounded-full border border-cyan-200/18" />
      <div className="absolute inset-[36%] rounded-full border border-cyan-100/12" />

      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 h-[2px] rounded-full bg-cyan-100/70 shadow-[0_0_14px_rgba(34,211,238,0.9)]"
          style={{
            width: `${14 + (i % 4) * 8}px`,
            transform: `rotate(${i * 23}deg) translateX(${compact ? 88 : 145}px)`,
            transformOrigin: "0 0",
            opacity: active ? 0.18 + (i % 3) * 0.15 : 0.05,
            animation: `ghostPlasmaSpark ${1.7 + (i % 5) * 0.35}s ease-in-out infinite`,
          }}
        />
      ))}

      <div
        className={`relative z-20 flex ${innerSizeClass} items-center justify-center rounded-full ${
          active
            ? "bg-[radial-gradient(circle_at_center,rgba(224,242,254,0.95),rgba(34,211,238,0.38)_45%,rgba(0,0,0,0.70)_100%)]"
            : "bg-[radial-gradient(circle_at_center,rgba(248,113,113,0.55),rgba(0,0,0,0.75)_100%)]"
        } shadow-[0_0_70px_rgba(34,211,238,0.7)]`}
        style={{
          animation:
            voiceState === "speaking"
              ? "ghostPlasmaBreath 0.9s ease-in-out infinite"
              : voiceState === "thinking"
                ? "ghostPlasmaBreath 1.5s ease-in-out infinite"
                : "ghostPlasmaBreath 3s ease-in-out infinite",
        }}
      >
        <span
          className={`text-5xl ${
            active
              ? "drop-shadow-[0_0_18px_rgba(34,211,238,0.9)]"
              : "grayscale opacity-75 drop-shadow-[0_0_18px_rgba(248,113,113,0.8)]"
          }`}
        >
          🎙️
        </span>
      </div>
    </button>
  );
}