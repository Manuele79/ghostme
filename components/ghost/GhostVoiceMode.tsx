"use client";

import GhostCore from "./GhostCore";
import { VoiceState } from "./types";
import GhostCanvasCore from "./GhostCanvasCore";


export default function GhostVoiceMode({
  voiceState,
  micEnabled,
  setMicEnabled,
  autoMicOffRef,
  recognitionRef,
  speakingRef,
  setVoiceState,
  currentModeLabel,
  cycleMode,
  startVoiceInput,
  openMemory,
  openServices,
}: {
  voiceState: VoiceState;
  micEnabled: boolean;
  setMicEnabled: any;
  autoMicOffRef: any;
  recognitionRef: any;
  speakingRef: any;
  setVoiceState: any;
  currentModeLabel: string;
  cycleMode: () => void;
  startVoiceInput: () => void;
  openMemory: () => void;
  openServices: () => void;
}) {

const stateLabel =
  !micEnabled
    ? "Microfono spento"
    : voiceState === "listening"
      ? "GhostMe ti sta ascoltando"
      : voiceState === "thinking"
        ? "GhostMe sta pensando"
        : voiceState === "speaking"
          ? "GhostMe sta parlando"
          : "GhostMe è pronto";

const stateGlow =
  voiceState === "listening"
    ? "shadow-[0_0_180px_rgba(34,211,238,1)] scale-110"
    : voiceState === "thinking"
      ? "shadow-[0_0_160px_rgba(96,165,250,0.9)] scale-[1.03]"
      : voiceState === "speaking"
        ? "shadow-[0_0_240px_rgba(125,249,255,1)] scale-125"
        : "shadow-[0_0_140px_rgba(34,211,238,0.45)] scale-100";

  return (
    <section className="relative flex flex-1 flex-col items-center justify-start overflow-hidden pt-6 pb-6">

{/* CORE */}
<div className="relative z-20 -mt-12 scale-[0.72]">
  <GhostCanvasCore
    voiceState={voiceState}
    micEnabled={micEnabled}
    onClick={() => {
      if (micEnabled) {
        try {
          recognitionRef.current?.stop();
        } catch {}

        recognitionRef.current = null;
        clearTimeout(autoMicOffRef.current);

        if (
          typeof window !== "undefined" &&
          "speechSynthesis" in window
        ) {
          window.speechSynthesis.cancel();
        }

        speakingRef.current = false;
        setVoiceState("idle");
        setMicEnabled(false);
        return;
      }

      setMicEnabled(true);
      startVoiceInput();

      clearTimeout(autoMicOffRef.current);
      autoMicOffRef.current = setTimeout(() => {
        try {
          recognitionRef.current?.stop();
        } catch {}

        recognitionRef.current = null;
        speakingRef.current = false;
        setVoiceState("idle");
        setMicEnabled(false);
      }, 30000);
    }}
  />
</div>


      {/* STATO */}
      <div className="relative z-20 -mt-8 flex h-24 flex-col items-center justify-start">
        <p className="text-xl sm:text-2xl font-light tracking-tight text-cyan-50">
          {stateLabel}
        </p>

        <div className="mt-2 flex h-10 items-end gap-2">
          {voiceState !== "idle" &&
            [1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-2 rounded-full bg-cyan-200"
                style={{
                  height: `${18 + Math.random() * 40}px`,
                  animation: `ghostCorePulse ${
                    0.6 + i * 0.2
                  }s ease-in-out infinite`,
                }}
              />
            ))}
        </div>
      </div>

      {/* CONTROLLI */}
      <div className="relative z-20 mt-0 grid w-full max-w-lg grid-cols-3 gap-4">
        <button
          onClick={openMemory}
          className="rounded-2xl border border-cyan-400/25 bg-black/60 px-4 py-4 text-sm font-bold text-cyan-200 transition hover:scale-105"
        >
          MEMORIA
        </button>

        <button
          onClick={cycleMode}
          className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-4 text-sm font-black text-cyan-100 transition hover:scale-105"
        >
          {currentModeLabel}
        </button>

        <button
          onClick={openServices}
          className="rounded-2xl border border-cyan-400/25 bg-black/60 px-4 py-4 text-sm font-bold text-cyan-200 transition hover:scale-105"
        >
          SERVIZI
        </button>
      </div>
    </section>
  );
}