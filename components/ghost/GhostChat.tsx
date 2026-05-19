"use client";

import GhostCore from "./GhostCore";
import { GhostMode, VoiceState } from "./types";

export default function GhostChat({
  mode,
  voiceState,
  micEnabled,
  currentModeLabel,
  cycleMode,
  input,
  setInput,
  sendMessage,
  loadingChat,
  startVoiceInput,
  lastUserMessage,
  lastAssistantMessage,
  userName,
  openHistory,
}: {
  mode: GhostMode;
  voiceState: VoiceState;
  micEnabled: boolean;
  currentModeLabel: string;
  cycleMode: () => void;
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
  loadingChat: boolean;
  startVoiceInput: () => void;
    lastUserMessage?: {
    role: "user" | "assistant";
    content: string;
    };

    lastAssistantMessage?: {
    role: "user" | "assistant";
    content: string;
    };
  userName: string;
  openHistory: () => void;
}) {
  return (
    <div className="relative z-20 mt-2 flex w-full max-w-5xl flex-1 flex-col items-center justify-end">
      {/* core centrale */}
      <div className="pointer-events-none absolute left-1/2 top-[-70px] -translate-x-1/2 opacity-70">
        <GhostCore
          voiceState={voiceState}
          micEnabled={micEnabled}
          compact={mode !== "voce-voce"}
        />
      </div>

      {/* risposta precedente */}
      {lastAssistantMessage && (
        <div className="mb-3 w-full rounded-3xl border border-cyan-400/10 bg-black/35 p-5 backdrop-blur-xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
            Ghost
          </p>

          <p className="whitespace-pre-wrap text-zinc-100">
            {lastAssistantMessage.content}
          </p>
        </div>
      )}

      {/* domanda attuale */}
      {lastUserMessage && (
        <div className="mb-5 w-full rounded-3xl border border-white/5 bg-white/5 p-5 backdrop-blur-xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
            {userName || "Tu"}
          </p>

          <p className="whitespace-pre-wrap text-zinc-100">
            {lastUserMessage.content}
          </p>
        </div>
      )}

      {/* input */}
      <div className="sticky bottom-4 mt-auto flex w-full items-end gap-3 rounded-3xl border border-cyan-400/10 bg-black/45 p-3 backdrop-blur-2xl">
        {/* modalità */}
        <button
          onClick={cycleMode}
          className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-100 transition hover:scale-105"
        >
          {currentModeLabel}
        </button>

        {/* voce-chat */}
        {mode === "voce-chat" && (
          <button
            onClick={startVoiceInput}
            className={`rounded-2xl border px-4 py-3 text-xl transition ${
              micEnabled
                ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-100"
                : "border-white/10 bg-white/5 text-zinc-300"
            }`}
          >
            🎙️
          </button>
        )}

        {/* textarea */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Parla con GhostMe..."
          rows={1}
          className="max-h-40 min-h-[56px] flex-1 resize-none rounded-2xl border border-white/5 bg-black/35 px-5 py-4 text-white outline-none backdrop-blur-xl focus:border-cyan-400/20"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        {/* cronologia */}
        <button
          onClick={openHistory}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xl text-zinc-300 transition hover:scale-105"
        >
          🕘
        </button>

        {/* invio */}
        <button
          onClick={sendMessage}
          disabled={loadingChat}
          className="rounded-2xl bg-cyan-300 px-5 py-3 text-xl font-bold text-black transition hover:scale-105 disabled:opacity-50"
        >
          ↑
        </button>
      </div>
    </div>
  );
}