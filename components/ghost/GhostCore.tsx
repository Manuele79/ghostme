"use client";

import Image from "next/image";
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
  const size = compact ? 240 : 420;

  const stateScale =
    voiceState === "speaking"
      ? "scale-110"
      : voiceState === "thinking"
        ? "scale-105"
        : voiceState === "listening"
          ? "scale-105"
          : "scale-100";

  const stateGlow =
    !micEnabled
      ? "opacity-40 grayscale"
      : voiceState === "speaking"
        ? "opacity-100 brightness-125"
        : voiceState === "thinking"
          ? "opacity-95 brightness-110"
          : "opacity-85";

return (
  <>
    <style jsx global>{`
      @keyframes ghostRotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes ghostPulse {
        0%,
        100% {
          transform: scale(0.96);
          opacity: 0.7;
        }
        50% {
          transform: scale(1.08);
          opacity: 1;
        }
      }

      @keyframes ghostBreath {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.03);
        }
      }

      @keyframes ghostParticles {
        0%,
        100% {
          opacity: 0.15;
          transform: scale(0.8);
        }
        50% {
          opacity: 1;
          transform: scale(1.4);
        }
      }
    `}</style>

    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center justify-center rounded-full transition-all duration-700 ${stateScale}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* alone enorme */}
      <div
        className="absolute inset-[-28%] rounded-full bg-cyan-400/25 blur-[160px]"
        style={{
          animation: "ghostPulse 5s ease-in-out infinite",
        }}
      />

      {/* anello plasma */}
      <div
        className={`absolute inset-[6%] rounded-full opacity-90 mix-blend-screen ${stateGlow}`}
        style={{
          animation:
            voiceState === "speaking"
              ? "ghostRotate 4s linear infinite"
              : voiceState === "thinking"
              ? "ghostRotate 9s linear infinite"
              : "ghostRotate 18s linear infinite",
        }}
      >
        <Image
          src="/ghost/ghost-plasma-core1.png"
          alt="ghost plasma"
          fill
          className="object-contain scale-[1.18] opacity-95"
          priority
        />
      </div>

      {/* glow interno */}
      <div className="absolute inset-[24%] rounded-full bg-cyan-300/10 blur-[35px]" />

      {/* cerchi */}
      <div className="absolute inset-[14%] rounded-full border border-cyan-200/10" />
      <div className="absolute inset-[28%] rounded-full border border-cyan-200/10" />

      {/* particelle */}
      {Array.from({ length: 32 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-cyan-100"
          style={{
            width: `${1 + (i % 3)}px`,
            height: `${1 + (i % 3)}px`,
            left: `${10 + ((i * 19) % 80)}%`,
            top: `${10 + ((i * 23) % 80)}%`,
            opacity: micEnabled ? 0.8 : 0.2,
            boxShadow: "0 0 12px rgba(34,211,238,0.9)",
            animation: `ghostParticles ${1.8 + (i % 5)}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* nucleo */}
      <div
        className={`relative z-20 flex items-center justify-center rounded-full border border-white/10 backdrop-blur-xl ${
          micEnabled ? "bg-cyan-300/15" : "bg-red-400/10"
        }`}
        style={{
          width: compact ? 100 : 140,
          height: compact ? 100 : 140,
          boxShadow:
            "0 0 60px rgba(34,211,238,0.35), inset 0 0 30px rgba(255,255,255,0.05)",
          animation: "ghostBreath 4s ease-in-out infinite",
        }}
      >
        <span
          className={`text-5xl ${
            micEnabled
              ? "drop-shadow-[0_0_20px_rgba(34,211,238,0.9)]"
              : "opacity-40 grayscale"
          }`}
        >
          🎙️
        </span>
      </div>
    </button>
  </>
);
}