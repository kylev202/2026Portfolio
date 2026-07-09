"use client";

import { useSound } from "./sound";

/** Monoline speaker glyph — waves when on, a soft × when muted. Matches the
    other tray icons (24-box, 1.6 stroke, round joins). */
function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 9v6h3.5L13 19V5L7.5 9H4Z" />
      {on ? (
        <>
          <path d="M16.5 8.8a4.5 4.5 0 0 1 0 6.4" />
          <path d="M19 6.5a8 8 0 0 1 0 11" />
        </>
      ) : (
        <path d="M17 9.5l4 5m0-5l-4 5" />
      )}
    </svg>
  );
}

/**
 * The interface-sound switch. Carries [data-no-sfx] so the global delegator
 * doesn't also click it — enabling/muting voices its own on/off cue.
 */
export default function SoundToggle({ className = "" }: { className?: string }) {
  const { enabled, toggle } = useSound();
  return (
    <button
      type="button"
      onClick={toggle}
      data-no-sfx
      role="switch"
      aria-checked={enabled}
      aria-label={enabled ? "Mute interface sound" : "Enable interface sound"}
      title={enabled ? "Interface sound: on" : "Interface sound: off"}
      className={`tap grid h-7 w-7 place-items-center rounded-md border transition-colors ${
        enabled
          ? "border-signal/50 text-signal"
          : "border-line text-ink-faint hover:border-line-strong hover:text-ink"
      } ${className}`}
    >
      <SpeakerIcon on={enabled} />
    </button>
  );
}
