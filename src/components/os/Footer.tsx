"use client";

import { useEffect, useState } from "react";
import { profile, socials, system } from "@/lib/content";

/** Elapsed since the page mounted, as HH:MM:SS — a small honest "alive" signal. */
function useUptime() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => setSecs(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function Footer() {
  const year = new Date().getFullYear();
  const source = socials.find((s) => s.label === "GitHub")?.href;
  const uptime = useUptime();

  return (
    <footer className="mt-20 border-t border-line pb-6 pt-6 font-mono text-[0.72rem] text-ink-faint">
      {/* shell status line */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="flex items-center gap-2">
          <span aria-hidden className="led led-live" />
          <span className="text-ink-dim">{system.name}</span>
          <span>{system.version}</span>
        </span>
        <span aria-hidden className="hidden h-3 w-px bg-line sm:inline-block" />
        <span>
          session uptime <span className="tabular-nums text-ink-dim">{uptime}</span>
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>{profile.name}</span>
        <span className="max-w-prose">{system.colophon}</span>
        <span className="flex items-center gap-3">
          <span>© {year}</span>
          {source && (
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline text-ink-dim hover:text-ink"
            >
              source <span aria-hidden>↗</span>
            </a>
          )}
        </span>
      </div>
    </footer>
  );
}
