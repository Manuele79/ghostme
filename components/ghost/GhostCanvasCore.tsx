"use client";

import { useEffect, useRef } from "react";
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let animationId = 0;

    const size = compact ? 260 : 430;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    ctx.scale(dpr, dpr);

    function draw() {
      frame += 0.018;

      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;

      const base =
        voiceState === "speaking"
          ? 1.22
          : voiceState === "thinking"
          ? 1.12
          : voiceState === "listening"
          ? 1.08
          : 1;

      const micPower = micEnabled ? 1 : 0.45;

      // glow esterno
      const outer = ctx.createRadialGradient(cx, cy, 20, cx, cy, size * 0.48);
      outer.addColorStop(0, `rgba(80, 240, 255, ${0.32 * micPower})`);
      outer.addColorStop(0.38, `rgba(0, 180, 255, ${0.18 * micPower})`);
      outer.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = outer;
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.48, 0, Math.PI * 2);
      ctx.fill();

      // plasma vivo
      for (let i = 0; i < 42; i++) {
        const angle = (Math.PI * 2 * i) / 42 + frame * (0.35 + (i % 4) * 0.08);
        const wave =
          Math.sin(frame * 4 + i * 1.7) * 18 +
          Math.cos(frame * 2.2 + i * 0.9) * 12;

        const r = size * 0.22 * base + wave;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        const radius = 18 + Math.sin(frame * 3 + i) * 8;

        const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, `rgba(160, 250, 255, ${0.75 * micPower})`);
        g.addColorStop(0.45, `rgba(0, 210, 255, ${0.28 * micPower})`);
        g.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // scariche elettriche morbide
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < 9; i++) {
        const a = frame * 0.8 + i * 0.7;
        const startR = size * 0.12;
        const endR = size * (0.28 + Math.sin(frame + i) * 0.035);

        ctx.beginPath();
        ctx.moveTo(
          cx + Math.cos(a) * startR,
          cy + Math.sin(a) * startR
        );

        for (let j = 1; j <= 5; j++) {
          const rr = startR + ((endR - startR) / 5) * j;
          const aa = a + Math.sin(frame * 3 + i + j) * 0.16;

          ctx.lineTo(
            cx + Math.cos(aa) * rr,
            cy + Math.sin(aa) * rr
          );
        }

        ctx.strokeStyle = `rgba(130, 245, 255, ${0.22 * micPower})`;
        ctx.lineWidth = 1.4;
        ctx.shadowBlur = 18;
        ctx.shadowColor = "rgba(60, 220, 255, 0.9)";
        ctx.stroke();
      }

      ctx.restore();

      // nucleo
      const pulse =
        voiceState === "speaking"
          ? Math.sin(frame * 12) * 7
          : Math.sin(frame * 4) * 4;

      const coreR = (compact ? 46 : 62) + pulse;

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      core.addColorStop(
        0,
        micEnabled ? "rgba(230, 255, 255, 0.95)" : "rgba(255, 120, 120, 0.75)"
      );
      core.addColorStop(
        0.42,
        micEnabled ? "rgba(0, 210, 255, 0.42)" : "rgba(120, 20, 20, 0.45)"
      );
      core.addColorStop(1, "rgba(0, 0, 0, 0.35)");

      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [voiceState, micEnabled, compact]);

  const size = compact ? 260 : 430;

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center justify-center rounded-full outline-none"
      style={{ width: size, height: size }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      <span
        className={`relative z-10 text-5xl ${
          micEnabled
            ? "drop-shadow-[0_0_18px_rgba(34,211,238,0.95)]"
            : "grayscale opacity-60"
        }`}
      >
        🎙️
      </span>
    </button>
  );
}