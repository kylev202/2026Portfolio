"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { profile } from "@/lib/content";
import { useCommandBar } from "./CommandBar";
import { DUR, EASE } from "./primitives/anim";

const HEADLINE = profile.headline;
const HEADLINE_TEXT = HEADLINE.join("");
const TYPE_TOTAL = HEADLINE_TEXT.length;

/** Cumulative character count at the end of each line (line breaks not counted). */
const LINE_ENDS = HEADLINE.reduce<number[]>((acc, line) => {
  acc.push((acc[acc.length - 1] ?? 0) + line.length);
  return acc;
}, []);

/**
 * Typewriter counter: reveals the headline one character at a time, pausing a
 * beat at the end of each line. Returns the number of characters typed so far.
 * When disabled (reduced motion), it stays idle — the caller shows the full
 * headline instead.
 */
function useHeadlineTyping(enabled: boolean) {
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;

    let typed = 0;
    const tick = () => {
      typed += 1;
      setCount(typed);
      if (typed >= TYPE_TOTAL) return;

      // A steady, even cadence reads smoother than per-character variance;
      // the only break is a gentle pause as each line wraps.
      const atLineEnd = LINE_ENDS.includes(typed);
      const delay = atLineEnd ? 150 : 38;
      timer.current = setTimeout(tick, delay);
    };

    timer.current = setTimeout(tick, 160);
    return () => clearTimeout(timer.current);
  }, [enabled]);

  return count;
}

/** The desktop "home screen": identity + entry points. Revealed as boot fades. */
export default function Hero() {
  const { open } = useCommandBar();
  const reduced = useReducedMotion();

  const count = useHeadlineTyping(!reduced);
  // Reduced motion: skip the animation and render the full headline at rest.
  const typed = reduced ? TYPE_TOTAL : count;
  const done = typed >= TYPE_TOTAL;

  // The line the caret currently sits on: the first not-yet-finished line, or
  // the last line once everything is typed.
  let caretLine = HEADLINE.length - 1;
  for (let i = 0; i < HEADLINE.length; i += 1) {
    const before = LINE_ENDS[i] - HEADLINE[i].length;
    const visible = Math.min(Math.max(typed - before, 0), HEADLINE[i].length);
    if (visible < HEADLINE[i].length) {
      caretLine = i;
      break;
    }
  }

  const heroTransition = reduced ? { duration: 0 } : { duration: DUR.base, ease: EASE };

  return (
    <section
      id="top"
      className="min-screen-h relative flex items-center pb-16 pt-24"
    >
      <div className="grid w-full items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        {/* Identity */}
        <div className="max-w-2xl">
          <p className="label flex items-center gap-2.5">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-signal" />
            {profile.role}
            <span className="text-ink-faint">·</span>
            {profile.location}
          </p>

          <h1 className="text-display mt-5 font-mono font-medium text-ink">
            {/* Full sentence for screen readers and crawlers, regardless of animation state. */}
            <span className="sr-only">{HEADLINE.join(" ")}</span>

            <span aria-hidden>
              {HEADLINE.map((line, index) => {
                const before = LINE_ENDS[index] - line.length;
                const visible = Math.min(Math.max(typed - before, 0), line.length);
                const text = line.slice(0, visible);
                return (
                  <span key={line} className="block">
                    {text || " "}
                    {index === caretLine && (
                      <span
                        className={`ml-1 inline-block h-[0.7em] w-[0.45ch] translate-y-[0.04em] bg-signal align-baseline motion-reduce:animate-none ${
                          done ? "animate-caret" : ""
                        }`}
                      />
                    )}
                  </span>
                );
              })}
            </span>
          </h1>

          <m.p
            className="mt-7 max-w-prose text-lg leading-relaxed text-ink-dim"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? heroTransition : { ...heroTransition, delay: 0.48 }}
          >
            {profile.intro}
          </m.p>

          <m.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? heroTransition : { ...heroTransition, delay: 0.62 }}
          >
            <Link href="/desktop" className="btn">
              Enter desktop
              <span aria-hidden>▸</span>
            </Link>
            <a href="#work" className="btn-ghost">
              Open work
              <span aria-hidden>↓</span>
            </a>
            <button type="button" onClick={open} className="btn-ghost">
              Run command
              <kbd className="kbd border-line-strong">⌘K</kbd>
            </button>
          </m.div>
        </div>

        {/* Instrument readout */}
        <m.aside
          className="window p-0 lg:justify-self-end lg:max-w-sm"
          aria-hidden
          initial={reduced ? false : { opacity: 0, y: 18, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.58, delay: 0.28, ease: EASE }}
        >
          <div className="window-bar">
            <div className="window-dots">
              <span />
              <span />
              <span />
            </div>
            <span className="font-mono text-xs text-ink-dim">~/status</span>
          </div>
          <dl className="divide-y divide-line font-mono text-xs">
            {[
              ["user", profile.handle],
              ["role", profile.role],
              ["located", profile.location],
              ["status", profile.available ? "open to work" : "heads-down"],
              ["focus", "web · frontend · backend"],
            ].map(([k, v], index) => (
              <m.div
                key={k}
                className="flex items-center justify-between gap-4 px-4 py-2.5"
                initial={reduced ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: DUR.quick, delay: 0.48 + index * 0.06, ease: EASE }
                }
              >
                <dt className="text-ink-faint">{k}</dt>
                <dd className="text-right text-ink-dim">{v}</dd>
              </m.div>
            ))}
          </dl>
          <div className="flex items-center gap-2 border-t border-line px-4 py-3 text-ink-dim">
            <kbd className="kbd">⌘K</kbd>
            <span className="font-mono text-[0.7rem]">to navigate anywhere</span>
          </div>
        </m.aside>
      </div>

      {/* Descent cue — the invitation into the machine. */}
      <a
        href="#about"
        aria-label="Scroll down to about"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-label text-ink-dim transition-colors hover:text-signal sm:flex"
      >
        descend
        <m.span
          aria-hidden
          animate={reduced ? undefined : { y: [0, 5, 0] }}
          transition={reduced ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          ↓
        </m.span>
      </a>
    </section>
  );
}
