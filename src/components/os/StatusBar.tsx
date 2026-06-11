"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { nav, profile, system } from "@/lib/content";
import { useCommandBar } from "./CommandBar";

function useClock() {
  // null until mounted → identical server/client first render (no hydration drift).
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

export default function StatusBar() {
  const { open } = useCommandBar();
  const time = useClock();

  return (
    <header className="fixed inset-x-0 top-0 z-chrome border-b border-line bg-bg/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="px-safe mx-auto flex h-11 max-w-shell items-center gap-4">
        {/* Identity */}
        <a
          href="#top"
          className="flex items-center gap-2 font-mono text-xs text-ink transition-colors hover:text-signal"
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-signal"
            title="online"
          />
          <span className="tracking-label">{system.name}</span>
        </a>

        <span aria-hidden className="hidden text-ink-faint sm:inline">
          /
        </span>

        {/* Availability */}
        {profile.available && (
          <span className="hidden items-center gap-2 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-signal rounded-full bg-signal/60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
            </span>
            <span className="font-mono text-xs text-ink-dim">{profile.availableLabel}</span>
          </span>
        )}

        {/* Visible section nav — recognition over recall; ⌘K stays the fast path. */}
        <nav aria-label="Sections" className="ml-2 hidden items-center gap-4 lg:flex">
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="font-mono text-xs text-ink-dim transition-colors hover:text-signal"
            >
              {n.label}
            </a>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-4">
          <time className="readout hidden tabular-nums sm:block" aria-hidden>
            {time ?? "--:--:--"}
          </time>
          <Link
            href="/desktop"
            aria-label="Enter the desktop"
            className="tap flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 font-mono text-[0.7rem] text-ink-dim transition-colors hover:border-signal/50 hover:text-signal"
          >
            <span aria-hidden>▸</span>
            <span className="hidden sm:inline">Desktop</span>
          </Link>
          <button
            type="button"
            onClick={open}
            aria-label="Open command palette"
            aria-keyshortcuts="Meta+K Control+K"
            className="tap flex items-center gap-2 rounded-md border border-line px-2.5 py-1 font-mono text-[0.7rem] text-ink-dim transition-colors hover:border-line-strong hover:text-ink"
          >
            <span className="hidden sm:inline">Command</span>
            <kbd className="kbd border-line-strong">⌘K</kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
