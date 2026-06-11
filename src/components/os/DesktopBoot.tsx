"use client";

import { useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import { profile, system } from "@/lib/content";
import { DUR, EASE } from "./primitives/anim";

/**
 * ──────────────────────────────────────────────────────────────────────────
 *  Desktop boot — a mock Linux/systemd console that plays once (per tab
 *  session) before the /desktop route resolves. Firmware → kernel ring buffer
 *  → systemd units (green [  OK  ]) → login → handoff. Lines stream in with an
 *  irregular, "alive" cadence, the console auto-scrolls, a caret blinks, and a
 *  hairline meter tracks progress. Click or press any key to skip.
 *
 *  Only mounted when motion is allowed (the shell skips it under reduced
 *  motion), so the animation itself never needs a reduced-motion branch.
 * ──────────────────────────────────────────────────────────────────────────
 */

/** A muted, desaturated green — used ONLY here, for the iconic systemd [  OK  ]
 *  marker. Scoped to the boot console so the desktop keeps its single amber
 *  accent everywhere else. */
const OK_GREEN = "#6cc08a";

const HOST = system.name; // e.g. "kylev.os"
const USER = profile.handle; // e.g. "kylev"
const KVER = `6.9.0-${USER}`;

type Entry =
  | { type: "head"; text: string }
  | { type: "kernel"; ts: string; text: string }
  | { type: "unit"; status: "ok" | "info"; text: string }
  | { type: "blank" }
  | { type: "login"; text: string }
  | { type: "welcome"; text: string };

/** A streamed line plus the gap (ms) to wait before revealing the next one. */
type Step = { entry: Entry; gap: number };

/** Build the full boot transcript once. Identity bits come from content. */
function buildSteps(): Step[] {
  const steps: Step[] = [];
  const push = (entry: Entry, gap: number) => steps.push({ entry, gap });

  // ── Firmware / bootloader ────────────────────────────────────────────────
  push({ type: "head", text: `${HOST} bootloader ${system.version}` }, 220);
  push({ type: "kernel", ts: "0.000000", text: `Loading ${KVER} ............ done` }, 70);
  push({ type: "kernel", ts: "0.000000", text: "Loading initial ramdisk ... done" }, 260);
  push({ type: "blank" }, 80);

  // ── Kernel ring buffer ───────────────────────────────────────────────────
  const kernel: [string, string][] = [
    ["0.000000", `Linux version ${KVER} (${USER}@os) #1 SMP PREEMPT_DYNAMIC`],
    ["0.000000", "Command line: BOOT_IMAGE=/boot/vmlinuz ro quiet splash portfolio=1"],
    ["0.013402", "Memory: 16384MB available"],
    ["0.118770", "Detecting hardware ............ ok"],
    ["0.241955", "ACPI: power management online"],
    ["0.392014", "loop: module loaded"],
    ["0.547318", "EXT4-fs (root): mounted filesystem with ordered data mode"],
    ["0.661204", "systemd[1]: System initialization in progress"],
  ];
  kernel.forEach(([ts, text], i) => push({ type: "kernel", ts, text }, i < 2 ? 40 : 70));
  push({ type: "blank" }, 120);

  // ── systemd units (themed to the portfolio, from content) ────────────────
  system.services.forEach((s, i) => {
    const last = i === system.services.length - 1;
    push({ type: "unit", status: s.status, text: s.msg }, last ? 360 : s.status === "info" ? 300 : 130);
  });
  push({ type: "blank" }, 140);

  // ── Login / handoff ──────────────────────────────────────────────────────
  push({ type: "login", text: `${HOST} ${system.version}  tty1` }, 120);
  push({ type: "login", text: `${USER} login: ${USER} (auto)` }, 300);
  push({ type: "welcome", text: `Welcome to ${HOST} — launching desktop session…` }, 520);

  return steps;
}

/** The transcript is deterministic, so build it once at module load. */
const STEPS = buildSteps();

/** The green/amber [  OK  ] / [ INFO ] status marker. */
function Marker({ status }: { status: "ok" | "info" }) {
  const label = status === "ok" ? "  OK  " : " INFO ";
  return (
    <span className="shrink-0">
      <span className="text-ink-faint">[</span>
      <span style={{ color: status === "ok" ? OK_GREEN : undefined }} className={status === "info" ? "text-signal" : ""}>
        {label}
      </span>
      <span className="text-ink-faint">]</span>
    </span>
  );
}

/** Render a single transcript line. */
function LineRow({ entry }: { entry: Entry }) {
  switch (entry.type) {
    case "blank":
      return <div className="h-3" aria-hidden />;
    case "head":
      return <div className="text-ink">{entry.text}</div>;
    case "kernel":
      return (
        <div className="flex gap-2 text-ink-dim">
          <span className="select-none text-ink-faint tabular-nums">
            [{entry.ts.padStart(11, " ")}]
          </span>
          <span className="min-w-0">{entry.text}</span>
        </div>
      );
    case "unit": {
      // The message already carries its verb (Started / Mounted / Reached…);
      // dim the verb, brighten the unit it acted on.
      const [verb, ...rest] = entry.text.split(" ");
      return (
        <div className="flex gap-2.5">
          <Marker status={entry.status} />
          <span className="min-w-0 text-ink-dim">
            {verb} <span className="text-ink">{rest.join(" ")}</span>.
          </span>
        </div>
      );
    }
    case "login":
      return <div className="text-ink-dim">{entry.text}</div>;
    case "welcome":
      return <div className="text-ink">{entry.text}</div>;
  }
}

export default function DesktopBoot({ onDone }: { onDone: () => void }) {
  const steps = STEPS;
  const [shown, setShown] = useState(0); // number of entries revealed
  const finished = useRef(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const total = steps.length;
  const progress = Math.min(shown / total, 1);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };

  // Stream the transcript one line at a time on the authored cadence.
  useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setShown(i);
      if (i >= total) {
        timer = setTimeout(finish, 650); // brief hold on "ready" before handoff
        return;
      }
      timer = setTimeout(tick, steps[i - 1].gap);
    };
    timer = setTimeout(tick, 160);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Skip on any key / pointer.
  useEffect(() => {
    const skip = () => finish();
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the latest line pinned to the bottom of the console (real-tty scroll).
  useEffect(() => {
    const el = viewportRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown]);

  const visible = steps.slice(0, shown);
  const done = shown >= total;

  return (
    <m.div
      className="fixed inset-0 z-palette flex flex-col bg-bg-deep"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DUR.base, ease: EASE }}
      onClick={finish}
      role="status"
      aria-label="Booting desktop"
    >
      <span className="sr-only">Loading desktop session…</span>

      {/* Progress hairline — fills as the transcript streams. */}
      <div className="h-px w-full shrink-0 bg-line/60">
        <m.div
          className="h-full bg-signal"
          style={{ width: `${progress * 100}%` }}
          transition={{ ease: "linear" }}
        />
      </div>

      {/* Console */}
      <div
        ref={viewportRef}
        className="crt-on no-scrollbar relative min-h-0 flex-1 overflow-hidden px-5 py-6 font-mono text-[0.78rem] leading-[1.5] sm:px-10 sm:py-8 sm:text-[0.84rem]"
      >
        <div className="mx-auto max-w-3xl">
          {visible.map((step, i) => (
            <LineRow key={i} entry={step.entry} />
          ))}

          {/* Caret trails the last line; blinks once the stream completes. */}
          <span
            aria-hidden
            className={`mt-0.5 inline-block h-[1em] w-[0.55ch] translate-y-[0.15em] bg-ink-dim ${
              done ? "animate-caret" : "opacity-90"
            }`}
          />
        </div>
      </div>

      {/* Ambient: scanlines + grain + edge vignette. Never interactive. */}
      <div aria-hidden className="scanlines pointer-events-none absolute inset-0 mix-blend-overlay" />
      <div
        aria-hidden
        className="grain-layer pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-screen"
      />
      <div aria-hidden className="vignette-layer pointer-events-none absolute inset-0" />

      {/* Skip hint */}
      <div className="px-safe pointer-events-none flex shrink-0 items-center justify-between pb-4 font-mono text-[0.72rem] text-ink-dim">
        <span>{HOST}</span>
        <span className="tabular-nums">{Math.round(progress * 100)}% · press any key to skip</span>
      </div>
    </m.div>
  );
}
