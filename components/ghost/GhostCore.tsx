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
          }
          50% {
            transform: scale(1.06);
          }
        }

        @keyframes ghostPulseFast {
          0%,
          100% {
            transform: scale(0.92);
          }
          50% {
            transform: scale(1.12);
          }
        }

        @keyframes ghostParticles {
          0%,
          100% {
            opacity: 0.25;
          }
          50% {
            opacity: 1;
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
        {/* alone generale */}
        <div
          className="absolute inset-[-12%] rounded-full bg-cyan-400/20 blur-[90px]"
          style={{
            animation:
              voiceState === "speaking"
                ? "ghostPulseFast 1s ease-in-out infinite"
                : "ghostPulse 4s ease-in-out infinite",
          }}
        />

        {/* plasma texture */}
        <div
          className={`absolute inset-0 ${stateGlow}`}
          style={{
            animation:
              voiceState === "speaking"
                ? "ghostRotate 5s linear infinite, ghostPulseFast 1s ease-in-out infinite"
                : voiceState === "thinking"
                  ? "ghostRotate 8s linear infinite, ghostPulse 2s ease-in-out infinite"
                  : "ghostRotate 18s linear infinite, ghostPulse 5s ease-in-out infinite",
          }}
        >
          <Image
            src="/ghost/ghost-plasma-core.png"
            alt="ghost plasma"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* cerchi overlay */}
        <div className="absolute inset-[12%] rounded-full border border-cyan-200/10" />
        <div className="absolute inset-[24%] rounded-full border border-cyan-200/10" />

        {/* particelle */}
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
            style={{
              left: `${18 + ((i * 17) % 64)}%`,
              top: `${14 + ((i * 31) % 72)}%`,
              animation: `ghostParticles ${1.2 + (i % 4) * 0.4}s ease-in-out infinite`,
              opacity: micEnabled ? 0.8 : 0.2,
            }}
          />
        ))}

        {/* nucleo */}
        <div
          className={`relative z-20 flex items-center justify-center rounded-full ${
            micEnabled
              ? "bg-cyan-300/15"
              : "bg-red-400/10"
          } backdrop-blur-md border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.55)]`}
          style={{
            width: compact ? 90 : 120,
            height: compact ? 90 : 120,
          }}
        >
          <span
            className={`text-5xl ${
              micEnabled
                ? "drop-shadow-[0_0_16px_rgba(34,211,238,0.9)]"
                : "grayscale opacity-60"
            }`}
          >
            🎙️
          </span>
        </div>
      </button>
    </>
  );
}