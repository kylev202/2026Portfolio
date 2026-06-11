"use client";

import { useState } from "react";
import { profile, socials } from "@/lib/content";
import Reveal from "../primitives/Reveal";
import Terminal from "./Terminal";

/**
 * Subsystem 04 — "the uplink". The finale: an interactive terminal you can
 * actually operate, paired with the unmissable fast path (email, copy, résumé,
 * socials) so a recruiter is never more than one click from reaching out.
 */
export default function Contact() {
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
    <Reveal as="section" id="contact" className="scroll-mt-24 py-8">
      <div className="flex items-center gap-3 border-b border-line pb-3">
        <span className="font-mono text-xs font-medium text-ink">Contact</span>
        <span aria-hidden className="h-3 w-px bg-line-strong" />
        <span className="addr text-ink-dim">~/contact</span>
        <span className="addr hidden sm:inline">
          {profile.available ? "channel open" : "channel"}
        </span>
        <span className="ml-auto hidden font-mono text-xs text-ink-faint sm:inline">
          ⌘K · email · or type below
        </span>
      </div>

      <div className="mt-10 grid items-start gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        {/* Fast path */}
        <div>
          <h2 id="contact-title" className="text-section text-ink">
            Open a channel
          </h2>
          <p className="mt-4 max-w-prose leading-relaxed text-ink-dim">
            {profile.available
              ? `${profile.availableLabel}. Email is the fastest way to reach me — I read everything.`
              : "Always happy to talk. Email is the fastest way to reach me."}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href={`mailto:${profile.email}`} className="btn">
              {profile.email}
              <span aria-hidden>↗</span>
            </a>
            <button type="button" onClick={copy} className="btn-ghost" aria-live="polite">
              {copied ? "Copied ✓" : "Copy address"}
            </button>
            {profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                Résumé
                <span aria-hidden>↗</span>
              </a>
            )}
          </div>

          <ul className="mt-9 flex flex-col gap-2 border-t border-line pt-7 font-mono text-sm">
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
        </div>

        {/* The interactive uplink */}
        <Terminal />
      </div>
    </Reveal>
  );
}
