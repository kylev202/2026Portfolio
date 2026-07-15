"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { INTERACTIVE, useSound } from "./sound";

/**
 * Canvas dot-grid background. Same 26px pitch and hairline colour as the old
 * static `.grid-dots` texture, but alive: the grid breathes on a slow ambient
 * cycle, dots near the pointer bulge and warp toward it (magnetic), and a
 * sonar-style ring pulses outward periodically or on click. Clicking empty
 * background (not an existing interactive element, which already has its own
 * hover/tap cue) voices the shared "tap" blip through the site's opt-in sound
 * engine — ambient auto-pulses stay silent so the loop never nags.
 *
 * Falls back to a single static frame — pixel-identical to the old texture —
 * under prefers-reduced-motion or `paused`. Pointer tracking only attaches on
 * fine/hover pointers so touch devices never pay for a dead listener.
 */
const SPACING = 26;
const DOT_RADIUS = 1.1;
const LINE_RGB = "42, 47, 58"; // colors.line.DEFAULT
const SIGNAL_RGB = "244, 168, 58"; // colors.signal.DEFAULT
const MAGNET_RADIUS = 130;
const MAGNET_PULL = 7;
const BREATHE_PERIOD = 2600; // matches the pulse-signal keyframe cadence
const PULSE_DURATION = 1800;
const PULSE_SPEED = 260; // px/s the ring expands
const PULSE_BAND = 22;
const AMBIENT_PULSE_EVERY = 7000;

type Pulse = { x: number; y: number; start: number };

function lerpRgb(a: string, b: string, t: number) {
  const av = a.split(",").map(Number);
  const bv = b.split(",").map(Number);
  return av.map((v, i) => Math.round(v + (bv[i] - v) * t)).join(", ");
}

export default function InteractiveGrid({
  className = "fixed inset-0 -z-10",
  opacity = 0.7,
  paused = false,
}: {
  className?: string;
  opacity?: number;
  paused?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const animate = !reduced && !paused;
  const { play } = useSound();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    const pointer = { x: -9999, y: -9999, active: false };
    const pulses: Pulse[] = [];

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      const path = new Path2D();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          path.moveTo(c * SPACING + DOT_RADIUS, r * SPACING);
          path.arc(c * SPACING, r * SPACING, DOT_RADIUS, 0, Math.PI * 2);
        }
      }
      ctx.fillStyle = `rgba(${LINE_RGB}, ${opacity})`;
      ctx.fill(path);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / SPACING) + 1;
      rows = Math.ceil(height / SPACING) + 1;
      if (!animate) drawStatic();
    };
    resize();
    window.addEventListener("resize", resize);

    if (!animate) {
      return () => window.removeEventListener("resize", resize);
    }

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onDown = (e: PointerEvent) => {
      // Elements matching INTERACTIVE already voice their own tap cue via the
      // global sound delegation — only ping the background for empty clicks,
      // so a button press never doubles up into two blips at once.
      if (e.target instanceof Element && e.target.closest(INTERACTIVE)) return;
      pulses.push({ x: e.clientX, y: e.clientY, start: performance.now() });
      play("tap");
    };
    if (fine) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerleave", onLeave);
    }
    window.addEventListener("pointerdown", onDown);

    let raf = 0;
    let nextAmbientPulse = performance.now() + AMBIENT_PULSE_EVERY;
    const extras: { x: number; y: number; radius: number; alpha: number; mix: number }[] = [];

    const loop = (now: number) => {
      if (now >= nextAmbientPulse) {
        pulses.push({
          x: width * (0.2 + Math.random() * 0.6),
          y: height * (0.2 + Math.random() * 0.6),
          start: now,
        });
        nextAmbientPulse = now + AMBIENT_PULSE_EVERY + Math.random() * 3000;
      }
      while (pulses.length && now - pulses[0].start > PULSE_DURATION) pulses.shift();

      const breathe = 0.82 + 0.18 * Math.sin((now * 2 * Math.PI) / BREATHE_PERIOD);
      const baseAlpha = opacity * breathe;

      ctx.clearRect(0, 0, width, height);
      const basePath = new Path2D();
      extras.length = 0;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const gx = c * SPACING;
          const gy = r * SPACING;
          let x = gx;
          let y = gy;
          let radius = DOT_RADIUS;
          let extraAlpha = 0;
          let mix = 0;
          let affected = false;

          if (pointer.active) {
            const dx = gx - pointer.x;
            const dy = gy - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < MAGNET_RADIUS) {
              affected = true;
              const falloff = 1 - dist / MAGNET_RADIUS;
              const pull = falloff * falloff * MAGNET_PULL;
              if (dist > 0.01) {
                x -= (dx / dist) * pull;
                y -= (dy / dist) * pull;
              }
              radius += falloff * 1.5;
              extraAlpha += falloff * 0.65;
              mix = Math.max(mix, falloff * 0.85);
            }
          }

          for (const p of pulses) {
            const t = (now - p.start) / PULSE_DURATION;
            if (t < 0 || t > 1) continue;
            const ringRadius = t * PULSE_SPEED * (PULSE_DURATION / 1000);
            const band = Math.abs(Math.hypot(gx - p.x, gy - p.y) - ringRadius);
            if (band < PULSE_BAND) {
              affected = true;
              const strength = (1 - band / PULSE_BAND) * (1 - t);
              radius += strength * 1.4;
              extraAlpha += strength * 0.6;
              mix = Math.max(mix, strength * 0.7);
            }
          }

          if (affected) {
            extras.push({ x, y, radius, alpha: Math.min(1, baseAlpha + extraAlpha), mix });
          } else {
            basePath.moveTo(gx + DOT_RADIUS, gy);
            basePath.arc(gx, gy, DOT_RADIUS, 0, Math.PI * 2);
          }
        }
      }

      ctx.fillStyle = `rgba(${LINE_RGB}, ${baseAlpha})`;
      ctx.fill(basePath);

      for (const e of extras) {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fillStyle =
          e.mix > 0
            ? `rgba(${lerpRgb(LINE_RGB, SIGNAL_RGB, e.mix)}, ${e.alpha})`
            : `rgba(${LINE_RGB}, ${e.alpha})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      cancelAnimationFrame(raf);
    };
  }, [animate, opacity, play]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
