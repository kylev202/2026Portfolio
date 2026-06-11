"use client";

import { useState } from "react";
import { about, profile, skills } from "@/lib/content";
import Reveal from "../primitives/Reveal";

/**
 * Subsystem 01 — "the operator". Deliberately *not* a window panel: an open
 * manifest with a PID-style meta strip, the readme prose, a live "currently"
 * process list, and an interactive capability matrix (hover a module to focus
 * it; the rest dim, like inspecting one process on a control panel).
 */
export default function About() {
  const [hover, setHover] = useState<{ name: string; group: string } | null>(null);
  const moduleCount = skills.reduce((n, g) => n + g.items.length, 0);

  return (
    <Reveal as="section" id="about" className="scroll-mt-24 py-8">
      {/* Address strip — plain label first (scannable), the path as flavor. */}
      <div className="flex items-center gap-3 border-b border-line pb-3">
        <span className="font-mono text-xs font-medium text-ink">About</span>
        <span aria-hidden className="h-3 w-px bg-line-strong" />
        <span className="addr text-ink-dim">~/operator</span>
        <span className="addr hidden sm:inline">proc 0001 · state: learning</span>
        <span className="ml-auto hidden font-mono text-xs text-ink-faint sm:inline">
          since 2023
        </span>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        {/* Left — identity + readme + running processes */}
        <div>
          <h2 id="about-title" className="text-section text-ink">
            The operator
          </h2>

          <div className="mt-6 space-y-5 leading-relaxed text-ink-dim">
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 24)} className="max-w-prose">
                {p}
              </p>
            ))}
          </div>

          <p className="addr mt-10 uppercase tracking-label">ps · currently running</p>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {about.now.map((item, i) => (
              <li key={item} className="flex items-center gap-3 py-2.5 text-sm text-ink">
                <span aria-hidden className="led led-on" />
                <span className="w-8 shrink-0 font-mono text-[0.7rem] text-ink-faint tabular-nums">
                  {String(i + 1).padStart(3, "0")}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — interactive capability matrix */}
        <div>
          <div className="flex items-baseline justify-between">
            <p className="addr uppercase tracking-label">capabilities</p>
            <p className="font-mono text-xs tabular-nums text-ink-faint">
              {moduleCount} modules
            </p>
          </div>

          {/* Live readout reflecting the focused module */}
          <div className="mt-4 flex h-7 items-center gap-2 font-mono text-xs">
            <span aria-hidden className="text-signal">
              ❯
            </span>
            {hover ? (
              <span className="text-ink">
                {hover.name}
                <span className="text-ink-faint"> — {hover.group.toLowerCase()}</span>
              </span>
            ) : (
              <span className="text-ink-faint">hover a module to inspect</span>
            )}
          </div>

          <div className="matrix mt-3 space-y-6" onMouseLeave={() => setHover(null)}>
            {skills.map((group) => (
              <div key={group.group}>
                <p className="addr mb-2.5">{group.group}</p>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="module"
                      onMouseEnter={() => setHover({ name: item, group: group.group })}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-7 max-w-prose font-mono text-[0.72rem] leading-relaxed text-ink-faint">
            {profile.available
              ? "// stack i can be productive in today, plus what i'm compiling next."
              : "// the toolset i reach for, plus what i'm learning."}
          </p>
        </div>
      </div>
    </Reveal>
  );
}
