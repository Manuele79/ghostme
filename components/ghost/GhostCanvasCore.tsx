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

    const context = canvas.getContext("2d");
    if (!context) return;

    const ctx: CanvasRenderingContext2D = context;

    let frame = 0;
    let animationId = 0;

    const size = compact ? 280 : 600;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    function drawLightningRing({
      cx,
      cy,
      radius,
      points,
      time,
      power,
    }: {
      cx: number;
      cy: number;
      radius: number;
      points: number;
      time: number;
      power: number;
    }) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      ctx.beginPath();

      for (let i = 0; i <= points; i++) {
        const p = i / points;
        const a = p * Math.PI * 2;

        const noise =
          Math.sin(a * 7 + time * 3.2) * 10 +
          Math.sin(a * 13 - time * 2.1) * 7 +
          Math.cos(a * 19 + time * 1.5) * 5;

        const pulse =
          voiceState === "speaking"
            ? Math.sin(time * 18 + i) * 8
            : voiceState === "listening"
              ? Math.sin(time * 9 + i) * 5
              : Math.sin(time * 5 + i) * 3;

        const r = radius + noise + pulse;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.strokeStyle = `rgba(120, 245, 255, ${0.65 * power})`;
      ctx.lineWidth = voiceState === "speaking" ? 3.2 : 2.2;
      ctx.shadowBlur = voiceState === "speaking" ? 34 : 24;
      ctx.shadowColor = "rgba(40, 225, 255, 1)";
      ctx.stroke();

      ctx.beginPath();

      for (let i = 0; i <= points; i++) {
        const p = i / points;
        const a = p * Math.PI * 2;

        const noise =
          Math.sin(a * 9 - time * 4.5) * 16 +
          Math.cos(a * 17 + time * 2.4) * 8;

        const r = radius * 1.08 + noise;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.strokeStyle = `rgba(180, 255, 255, ${0.28 * power})`;
      ctx.lineWidth = 1.2;
      ctx.shadowBlur = 22;
      ctx.shadowColor = "rgba(120, 245, 255, 0.9)";
      ctx.stroke();

      ctx.restore();
    }

    function draw() {
      frame += 0.018;

      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;

      const power = micEnabled ? 1 : 0.45;

      const statePower =
        voiceState === "speaking"
          ? 1.35
          : voiceState === "thinking"
            ? 1.15
            : voiceState === "listening"
              ? 1.25
              : 1;

      const baseRadius = compact ? 82 : 132;

      // alone profondo
      const outer = ctx.createRadialGradient(cx, cy, 20, cx, cy, size * 0.52);
      outer.addColorStop(0, `rgba(140, 255, 255, ${0.16 * power})`);
      outer.addColorStop(0.28, `rgba(0, 210, 255, ${0.18 * power})`);
      outer.addColorStop(0.65, `rgba(0, 120, 160, ${0.08 * power})`);
      outer.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = outer;
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.52, 0, Math.PI * 2);
      ctx.fill();

      // nube plasma attorno
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < 90; i++) {
        const a = (Math.PI * 2 * i) / 90 + frame * 0.7;
        const wave =
          Math.sin(frame * 3.4 + i * 1.9) * 20 +
          Math.cos(frame * 2.1 + i * 0.7) * 12;

        const r = baseRadius * statePower + wave;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;

        const glowSize = 10 + Math.sin(frame * 5 + i) * 5;

        const g = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        g.addColorStop(0, `rgba(210, 255, 255, ${0.45 * power})`);
        g.addColorStop(0.38, `rgba(0, 225, 255, ${0.24 * power})`);
        g.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // anelli elettrici
      drawLightningRing({
        cx,
        cy,
        radius: baseRadius * statePower,
        points: 150,
        time: frame,
        power,
      });

      drawLightningRing({
        cx,
        cy,
        radius: baseRadius * 0.78 * statePower,
        points: 120,
        time: -frame * 0.8,
        power: power * 0.65,
      });

      // scariche radiali
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      const bolts = voiceState === "speaking" ? 18 : 10;

      for (let i = 0; i < bolts; i++) {
        const a = frame * 1.3 + i * ((Math.PI * 2) / bolts);
        const startR = compact ? 38 : 58;
        const endR =
          baseRadius * statePower +
          24 +
          Math.sin(frame * 4 + i * 2) * 22;

        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * startR, cy + Math.sin(a) * startR);

        for (let j = 1; j <= 7; j++) {
          const rr = startR + ((endR - startR) / 7) * j;
          const aa = a + Math.sin(frame * 7 + i * 2 + j) * 0.16;

          ctx.lineTo(cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr);
        }

        ctx.strokeStyle = `rgba(130, 245, 255, ${0.18 * power})`;
        ctx.lineWidth = 1.1;
        ctx.shadowBlur = 20;
        ctx.shadowColor = "rgba(70, 230, 255, 1)";
        ctx.stroke();
      }

      ctx.restore();

      // particelle orbitanti
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < 36; i++) {
        const a = frame * (0.7 + (i % 4) * 0.18) + i * 0.9;
        const r = baseRadius * (1.05 + (i % 5) * 0.045);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;

        ctx.fillStyle = `rgba(210, 255, 255, ${0.45 * power})`;
        ctx.shadowBlur = 14;
        ctx.shadowColor = "rgba(125,249,255,1)";
        ctx.beginPath();
        ctx.arc(x, y, i % 5 === 0 ? 2.4 : 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // nucleo centrale
      const pulse =
        voiceState === "speaking"
          ? Math.sin(frame * 16) * 7
          : voiceState === "listening"
            ? Math.sin(frame * 8) * 5
            : Math.sin(frame * 4) * 3;

      const coreR = (compact ? 42 : 58) + pulse;

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      core.addColorStop(
        0,
        micEnabled ? "rgba(230,255,255,1)" : "rgba(255,120,120,0.75)"
      );
      core.addColorStop(
        0.28,
        micEnabled ? "rgba(100,245,255,0.65)" : "rgba(180,40,40,0.45)"
      );
      core.addColorStop(
        0.72,
        micEnabled ? "rgba(0,160,210,0.25)" : "rgba(80,0,0,0.35)"
      );
      core.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      // cerchio scuro interno per profondità
      ctx.fillStyle = "rgba(0, 25, 35, 0.45)";
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 0.72, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [voiceState, micEnabled, compact]);

  const size = compact ? 280 : 600;

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex shrink-0 items-center justify-center rounded-full outline-none"
      style={{ width: size, height: size }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

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