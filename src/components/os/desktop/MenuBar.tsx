"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { EASE } from "../primitives/anim";
import SoundToggle from "../primitives/SoundToggle";
import { system } from "@/lib/content";
import { PowerIcon } from "./icons";
import { appById } from "./apps";
import { useWindows } from "./WindowManager";

/** HH:MM + short date, mounted-only (null first render → no hydration drift). */
function useClock() {
  const [now, setNow] = useState<{ time: string; date: string } | null>(null);
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow({
        time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        date: d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" }),
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

/** A tiny three-bar equalizer — the "system is alive" indicator. */
function Activity() {
  const reduced = useReducedMotion();
  return (
    <span className="hidden h-3 items-end gap-[2px] sm:flex" aria-hidden title="System activity">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[2px] origin-bottom rounded-full bg-ink-faint"
          style={{
            height: "100%",
            animation: reduced ? undefined : `eq 1.1s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

/** Uplink / network glyph — three rising arcs, all "connected". */
function Uplink() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M5 13a10 10 0 0 1 14 0" />
      <path d="M8.5 16a5 5 0 0 1 7 0" />
      <circle cx="12" cy="19" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** The desktop top bar: identity, the focused app's name, system tray, clock, exit. */
export default function MenuBar() {
  const { order, windows } = useWindows();
  const reduced = useReducedMotion();
  const now = useClock();

  // Focused = topmost non-minimised window.
  let activeName = "Desktop";
  for (let i = order.length - 1; i >= 0; i--) {
    const w = windows.find((x) => x.id === order[i]);
    if (w && !w.minimized) {
      activeName = appById(w.id)?.name ?? activeName;
      break;
    }
  }

  return (
    <m.header
      className="absolute inset-x-0 top-0 z-50 border-b border-line bg-bg/75 pt-[env(safe-area-inset-top)] backdrop-blur-xl"
      initial={reduced ? false : { y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE }}
    >
      <div className="px-safe flex h-11 items-center gap-3">
        <Link
          href="/"
          className="tap flex items-center gap-2 font-mono text-xs text-ink transition-colors hover:text-signal"
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_6px_0_rgb(244_168_58/0.6)]"
          />
          <span className="tracking-label">{system.name}</span>
        </Link>

        <span aria-hidden className="h-3 w-px shrink-0 bg-line-strong" />
        <span className="min-w-0 truncate font-mono text-xs text-ink-dim">{activeName}</span>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          {/* System tray */}
          <div className="flex items-center gap-3 text-ink-faint">
            <Activity />
            <span className="hidden sm:inline-flex" title="Uplink">
              <Uplink />
            </span>
            <SoundToggle />
          </div>

          <span aria-hidden className="hidden h-3 w-px bg-line-strong sm:block" />

          <div className="hidden items-baseline gap-2 sm:flex">
            <span className="readout text-ink-dim">{now?.date ?? "—"}</span>
            <time className="readout tabular-nums text-ink" aria-label="Current time">
              {now?.time ?? "--:--"}
            </time>
          </div>

          <Link
            href="/"
            aria-label="Exit to the portfolio"
            className="tap flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 font-mono text-[0.7rem] text-ink-dim transition-colors hover:border-line-strong hover:text-ink"
          >
            <PowerIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </Link>
        </div>
      </div>
    </m.header>
  );
}
