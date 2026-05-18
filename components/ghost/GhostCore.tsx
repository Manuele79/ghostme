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
  const size = compact ? "h-[220px] w-[220px]" : "h-[340px] w-[340px]";
  const core = compact ? "h-24 w-24" : "h-32 w-32";

  const active = micEnabled;

  return (
    <>
      <style jsx global>{`
        @keyframes ghostPlasmaBreathe {
          0%, 100% { transform: scale(0.96); opacity: 0.78; }
          50% { transform: scale(1.08); opacity: 1; }
        }

        @keyframes ghostPlasmaSlowSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes ghostPlasmaPulseFast {
          0%, 100% { transform: scale(0.92); opacity: 0.55; }
          50% { transform: scale(1.18); opacity: 1; }
        }

        @keyframes ghostSpark {
          0%, 100% { opacity: 0.12; transform: scale(0.7); }
          50% { opacity: 0.85; transform: scale(1.25); }
        }
      `}</style>

      <button
        type="button"
        onClick={onClick}
        className={`relative flex ${size} items-center justify-center rounded-full outline-none transition-all duration-700 ${
          active ? "opacity-100" : "opacity-55 grayscale"
        }`}
      >
        {/* plasma morbido esterno */}
        <div
          className={`absolute inset-[-18%] rounded-full blur-[80px] ${
            active ? "bg-cyan-500/20" : "bg-red-500/10"
          }`}
          style={{ animation: "ghostPlasmaBreathe 5s ease-in-out infinite" }}
        />

        {/* corpo plasma scuro */}
        <div
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.28)_0%,rgba(8,145,178,0.18)_28%,rgba(8,47,73,0.18)_52%,transparent_72%)]"
          style={{ animation: "ghostPlasmaBreathe 4s ease-in-out infinite" }}
        />

        {/* movimento interno, senza effetto sega circolare */}
        <div
          className="absolute inset-[12%] rounded-full bg-[conic-gradient(from_120deg,transparent,rgba(34,211,238,0.18),rgba(125,249,255,0.42),rgba(37,99,235,0.18),transparent,rgba(34,211,238,0.32),transparent)] blur-[18px]"
          style={{
            animation:
              voiceState === "thinking"
                ? "ghostPlasmaSlowSpin 5s linear infinite"
                : voiceState === "speaking"
                  ? "ghostPlasmaSlowSpin 3.5s linear infinite"
                  : "ghostPlasmaSlowSpin 13s linear infinite",
          }}
        />

        {/* macchie energia, tipo sole/plasma */}
        <div
          className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(34,211,238,0.42),transparent_24%),radial-gradient(circle_at_68%_38%,rgba(59,130,246,0.34),transparent_25%),radial-gradient(circle_at_48%_72%,rgba(125,249,255,0.26),transparent_28%)] blur-[16px]"
          style={{
            animation:
              voiceState === "speaking"
                ? "ghostPlasmaPulseFast 1s ease-in-out infinite"
                : "ghostPlasmaBreathe 3.4s ease-in-out infinite",
          }}
        />

        {/* bordo contenuto */}
        <div className="absolute inset-[18%] rounded-full border border-cyan-300/15" />
        <div className="absolute inset-[30%] rounded-full border border-cyan-200/10" />

        {/* particelle piccole */}
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.9)]"
            style={{
              left: `${18 + ((i * 19) % 64)}%`,
              top: `${16 + ((i * 31) % 68)}%`,
              animation: `ghostSpark ${1.8 + (i % 5) * 0.35}s ease-in-out infinite`,
              opacity: active ? 0.7 : 0.18,
            }}
          />
        ))}

        {/* nucleo */}
        <div
          className={`relative z-20 flex ${core} items-center justify-center rounded-full ${
            active
              ? "bg-[radial-gradient(circle_at_center,rgba(125,249,255,0.72),rgba(34,211,238,0.28)_42%,rgba(2,6,23,0.88)_100%)]"
              : "bg-[radial-gradient(circle_at_center,rgba(248,113,113,0.38),rgba(2,6,23,0.9)_100%)]"
          } shadow-[0_0_70px_rgba(34,211,238,0.55)]`}
          style={{
            animation:
              voiceState === "speaking"
                ? "ghostPlasmaPulseFast 0.9s ease-in-out infinite"
                : voiceState === "thinking"
                  ? "ghostPlasmaBreathe 1.6s ease-in-out infinite"
                  : "ghostPlasmaBreathe 3s ease-in-out infinite",
          }}
        >
          <span
            className={`text-5xl ${
              active
                ? "drop-shadow-[0_0_16px_rgba(34,211,238,0.85)]"
                : "grayscale opacity-75 drop-shadow-[0_0_14px_rgba(248,113,113,0.65)]"
            }`}
          >
            🎙️
          </span>
        </div>
      </button>
    </>
  );
}