"use client";

import { GhostMode } from "./types";

export default function GhostHeader({
  mode,
  userName,
  openMemory,
  openServices,
}: {
  mode: GhostMode;
  userName: string;
  openMemory: () => void;
  openServices: () => void;
}) {
  const showTopButtons = mode !== "voce-voce";

  return (
    <header className="relative mx-auto w-full max-w-5xl text-center">
      {showTopButtons && (
        <>
          <button
            onClick={openMemory}
            className="absolute left-20 top-20 hidden rounded-2xl border border-cyan-400/20 bg-black/45 px-5 py-3 text-sm font-bold text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.12)] backdrop-blur-sm transition hover:scale-105 sm:block"
          >
            MEMORIA
          </button>

          <button
            onClick={openServices}
            className="absolute right-20 top-20 hidden rounded-2xl border border-cyan-400/20 bg-black/45 px-5 py-3 text-sm font-bold text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.12)] backdrop-blur-sm transition hover:scale-105 sm:block"
          >
            SERVIZI
          </button>
        </>
      )}

      <p className="text-xs uppercase tracking-[0.45em] text-cyan-400">
        - GhostMe -
      </p>

      <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-7xl">
        GhostMe
      </h1>

      <p className="mt-2 text-sm text-zinc-400 sm:text-base">
        Memoria Cognitiva Attiva Di {userName}
      </p>

      {showTopButtons && (
        <div className="mt-5 flex items-center justify-center gap-3 sm:hidden">
          <button
            onClick={openMemory}
            className="rounded-2xl border border-cyan-400/25 bg-black/50 px-4 py-3 text-sm font-bold text-cyan-200"
          >
            MEMORIA
          </button>

          <button
            onClick={openServices}
            className="rounded-2xl border border-cyan-400/25 bg-black/50 px-4 py-3 text-sm font-bold text-cyan-200"
          >
            SERVIZI
          </button>
        </div>
      )}
    </header>
  );
}