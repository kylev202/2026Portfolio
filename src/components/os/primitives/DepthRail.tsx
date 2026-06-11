"use client";

import { useEffect, useRef, useState } from "react";
import { m, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { nav } from "@/lib/content";

/**
 * The "you are here" instrument — a fixed vertical rail on the right gutter.
 * It reads as a depth gauge for the descent through the machine: a progress
 * fill, one tick per subsystem, and a hex "address" that climbs as you scroll.
 * Ticks are real buttons (keyboard-operable jump-to). Desktop only; on small
 * screens the status bar + command palette already cover navigation.
 */
export default function DepthRail() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const fill = useSpring(scrollYProgress, reduced ? { duration: 0 } : { stiffness: 120, damping: 26 });

  const [active, setActive] = useState<string>(nav[0]?.id ?? "");
  const [addr, setAddr] = useState("0x00");
  const lastAddr = useRef("0x00");

  // Climb a hex address with depth — only re-render when the byte changes.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const byte = Math.min(255, Math.max(0, Math.round(v * 255)));
    const next = `0x${byte.toString(16).toUpperCase().padStart(2, "0")}`;
    if (next !== lastAddr.current) {
      lastAddr.current = next;
      setAddr(next);
    }
  });

  // Active subsystem via intersection — the section nearest the top wins.
  useEffect(() => {
    const ids = ["top", ...nav.map((n) => n.id)];
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null);
    if (targets.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id === "top" ? (nav[0]?.id ?? "top") : visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const jump = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Section depth"
      className="fixed right-3 top-1/2 z-rail hidden -translate-y-1/2 select-none flex-col items-center gap-3 xl:flex"
    >
      <span
        aria-hidden
        className="font-mono text-[0.66rem] uppercase tracking-wide text-ink-faint"
        style={{ writingMode: "vertical-rl" }}
      >
        depth
      </span>

      {/* Track with progress fill */}
      <div className="relative h-44 w-px bg-line">
        <m.div
          aria-hidden
          className="absolute left-0 top-0 w-px origin-top bg-signal"
          style={{ height: "100%", scaleY: fill }}
        />
        {/* Section ticks, positioned along the track */}
        <ul className="absolute -left-[5px] top-0 h-full">
          {nav.map((n, i) => {
            const pct = nav.length > 1 ? (i / (nav.length - 1)) * 100 : 0;
            const isActive = active === n.id;
            return (
              <li
                key={n.id}
                className="absolute"
                style={{ top: `${pct}%`, transform: "translateY(-50%)" }}
              >
                <button
                  type="button"
                  onClick={() => jump(n.id)}
                  className="group flex items-center"
                  aria-current={isActive ? "true" : undefined}
                >
                  <span
                    aria-hidden
                    className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 ${
                      isActive
                        ? "scale-110 border-signal bg-signal"
                        : "border-line-strong bg-bg group-hover:border-ink-faint"
                    }`}
                  />
                  <span
                    className={`pointer-events-none absolute right-5 whitespace-nowrap rounded border bg-surface/95 px-1.5 py-0.5 font-mono text-[0.7rem] uppercase tracking-label opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 ${
                      isActive ? "border-signal/40 text-signal" : "border-line text-ink-dim"
                    }`}
                  >
                    {n.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <span aria-hidden className="font-mono text-[0.66rem] tabular-nums text-ink-faint">
        {addr}
      </span>
    </nav>
  );
}
