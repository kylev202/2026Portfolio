"use client";

import { m, useReducedMotion } from "framer-motion";
import { timeline } from "@/lib/content";
import { EASE } from "../primitives/anim";
import Reveal from "../primitives/Reveal";

/**
 * Subsystem 03 — "the log". The timeline rendered as a version history: a spine
 * that draws itself in on scroll, commit-style nodes, and a live "HEAD" at the
 * most recent entry. Ordered, so the numbering is earned (it's a real sequence).
 */
export default function Path() {
  const reduced = useReducedMotion();

  return (
    <Reveal as="section" id="path" className="scroll-mt-24 py-8">
      <div className="flex items-center gap-3 border-b border-line pb-3">
        <span className="font-mono text-xs font-medium text-ink">Experience</span>
        <span aria-hidden className="h-3 w-px bg-line-strong" />
        <span className="addr text-ink-dim">~/path</span>
        <span className="addr hidden sm:inline">git log · {timeline.length} entries</span>
        <span className="ml-auto hidden font-mono text-xs text-ink-faint sm:inline">
          newest first
        </span>
      </div>

      <h2 id="path-title" className="text-section mt-8 text-ink">
        How I got here
      </h2>

      <div className="relative mt-10 ml-1 pl-9">
        {/* The spine — draws downward as the section enters. */}
        <m.span
          aria-hidden
          className="absolute left-0 top-1 w-px origin-top bg-line"
          style={{ height: "calc(100% - 0.5rem)" }}
          initial={reduced ? false : { scaleY: 0 }}
          whileInView={reduced ? undefined : { scaleY: 1 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={reduced ? { duration: 0 } : { duration: 0.9, ease: EASE }}
        />

        <ol>
          {timeline.map((item, i) => {
            const head = i === 0;
            return (
              <li key={`${item.period}-${item.title}`} className="relative pb-10 last:pb-0">
                {/* commit node */}
                <span
                  aria-hidden
                  className={`absolute -left-[2.31rem] top-1 h-3.5 w-3.5 rounded-full ${
                    head ? "led led-live" : "border border-line-strong bg-bg"
                  }`}
                />

                <m.div
                  initial={reduced ? false : { opacity: 0, x: -8 }}
                  whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={reduced ? { duration: 0 } : { duration: 0.4, delay: 0.1 + i * 0.08, ease: EASE }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="readout text-signal/90">{item.period}</span>
                    {head && (
                      <span className="rounded border border-signal/40 px-1.5 font-mono text-[0.7rem] uppercase tracking-label text-signal">
                        head
                      </span>
                    )}
                    <span className="font-mono text-[0.7rem] tabular-nums text-ink-faint">
                      {String(timeline.length - i).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-semibold text-ink">
                    {item.title}
                    <span className="font-normal text-ink-faint"> · {item.org}</span>
                  </h3>
                  <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-ink-dim">
                    {item.detail}
                  </p>
                </m.div>
              </li>
            );
          })}
        </ol>
      </div>
    </Reveal>
  );
}
