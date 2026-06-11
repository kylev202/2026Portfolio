"use client";

import { useState } from "react";
import { about, profile, skills } from "@/lib/content";

/** About window — the operator manifest, currently-running list, capability matrix. */
export default function AboutApp() {
  const [hover, setHover] = useState<{ name: string; group: string } | null>(null);
  const moduleCount = skills.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="h-full overflow-y-auto px-5 py-5 sm:px-6">
      <div className="flex items-center gap-3 border-b border-line pb-3">
        <span className="addr text-ink-dim">proc 0001</span>
        <span aria-hidden className="h-3 w-px bg-line-strong" />
        <span className="addr">state: learning</span>
        <span className="addr ml-auto hidden sm:inline">since 2023</span>
      </div>

      <h2 className="mt-6 text-xl font-semibold text-ink">{profile.name}</h2>
      <p className="addr mt-1">
        {profile.role} · {profile.location}
      </p>

      <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink-dim">
        {about.paragraphs.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>

      <p className="addr mt-7 uppercase tracking-label">ps · currently running</p>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {about.now.map((item, i) => (
          <li key={item} className="flex items-center gap-3 py-2 text-sm text-ink">
            <span aria-hidden className="led led-on" />
            <span className="w-7 shrink-0 font-mono text-[0.7rem] tabular-nums text-ink-faint">
              {String(i + 1).padStart(3, "0")}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex items-baseline justify-between">
        <p className="addr uppercase tracking-label">capabilities</p>
        <p className="font-mono text-xs tabular-nums text-ink-faint">{moduleCount} modules</p>
      </div>

      <div className="mt-3 flex h-7 items-center gap-2 font-mono text-xs">
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

      <div className="matrix mt-3 space-y-5" onMouseLeave={() => setHover(null)}>
        {skills.map((group) => (
          <div key={group.group}>
            <p className="addr mb-2">{group.group}</p>
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
    </div>
  );
}
