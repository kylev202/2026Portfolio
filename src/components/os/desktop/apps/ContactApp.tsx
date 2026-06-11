"use client";

import { useState } from "react";
import { profile, socials } from "@/lib/content";

/** Contact window — the fast path (email, copy, résumé, socials). */
export default function ContactApp() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <div className="h-full overflow-y-auto px-5 py-5 sm:px-6">
      <div className="flex items-center gap-3 border-b border-line pb-3">
        <span className="addr text-ink-dim">~/contact</span>
        <span aria-hidden className="h-3 w-px bg-line-strong" />
        <span className="addr">{profile.available ? "channel open" : "channel"}</span>
      </div>

      <h2 className="mt-6 text-xl font-semibold text-ink">Open a channel</h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">
        {profile.available
          ? `${profile.availableLabel}. Email is the fastest way to reach me, I read everything.`
          : "Always happy to talk. Email is the fastest way to reach me."}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <a href={`mailto:${profile.email}`} className="btn">
          {profile.email}
          <span aria-hidden>↗</span>
        </a>
        <button type="button" onClick={copy} className="btn-ghost" aria-live="polite">
          {copied ? "Copied ✓" : "Copy address"}
        </button>
        {profile.resumeUrl && (
          <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            Résumé
            <span aria-hidden>↗</span>
          </a>
        )}
      </div>

      <ul className="mt-7 flex flex-col gap-2 border-t border-line pt-6 font-mono text-sm">
        {socials.map((s) => (
          <li key={s.label} className="flex items-center gap-3">
            <span aria-hidden className="w-5 text-right text-xs text-ink-faint">
              {s.short}
            </span>
            <a
              href={s.href}
              target={s.href.startsWith("mailto:") ? undefined : "_blank"}
              rel={s.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
              className="link-underline text-ink-dim hover:text-ink"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>

      <p className="addr mt-7">
        {"// or open the Terminal and type "}<span className="text-signal">email</span>
      </p>
    </div>
  );
}
