"use client";

import Image from "next/image";
import { VoiceState } from "./types";

export default function GhostCanvasCore({
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
  const size = compact ? 280 : 470;

  const pulse =
    voiceState === "speaking"
      ? "scale-110 brightness-125"
      : voiceState === "listening"
        ? "scale-105 brightness-110"
        : voiceState === "thinking"
          ? "scale-105 brightness-105"
          : "scale-100";

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex shrink-0 items-center justify-center rounded-full outline-none"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-[80px]" />

      <div
        className={`absolute inset-0 transition-all duration-500 ${pulse}`}
        style={{
          animation: "ghostPlasmaSpin 18s linear infinite",
        }}
      >
        <Image
          src="/ghost/ghost-plasma-final.png"
          alt="Ghost plasma"
          fill
          priority
          className="object-contain opacity-95"
        />
      </div>

      <div
        className="absolute inset-[18%] rounded-full border border-cyan-200/20"
        style={{ animation: "ghostReverseOrbit 10s linear infinite" }}
      />

      <div
        className="absolute inset-[28%] rounded-full bg-cyan-300/10 blur-xl"
        style={{ animation: "ghostCorePulse 2.5s ease-in-out infinite" }}
      />

      <span
        className={`relative z-10 text-5xl ${
          micEnabled
            ? "drop-shadow-[0_0_22px_rgba(34,211,238,1)]"
            : "grayscale opacity-60"
        }`}
      >
        🎙️
      </span>
    </button>
  );
}