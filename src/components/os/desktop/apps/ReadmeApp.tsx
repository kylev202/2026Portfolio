import Link from "next/link";
import { system } from "@/lib/content";

const APP_NOTES: [string, string][] = [
  ["Terminal", "a real REPL: type help, whoami, work, or email"],
  ["About", "who I am and the stack I work in"],
  ["Projects", "selected work; expand a row for detail and links"],
  ["Experience", "how I got here, newest first"],
  ["Contact", "the fast path: email, copy, résumé, socials"],
  ["Settings", "wallpaper and motion preferences"],
];

const CONTROLS = [
  "open apps from the dock or the desktop icons",
  "drag a window by its title bar; resize from the bottom-right",
  "the dots close / minimise / maximise (left to right)",
  "Esc closes the focused window",
];

/** Readme window — the first-run welcome; auto-opens on boot. */
export default function ReadmeApp() {
  return (
    <div className="h-full overflow-y-auto px-5 py-5 text-sm leading-relaxed text-ink-dim sm:px-6">
      <div className="flex items-center gap-3 border-b border-line pb-3">
        <span className="addr text-ink-dim">readme.md</span>
        <span className="addr ml-auto">
          {system.name} {system.version}
        </span>
      </div>

      <h2 className="mt-6 text-lg font-semibold text-ink">Welcome to {system.name}</h2>
      <p className="mt-3">
        You&apos;re inside a small desktop I built to make reading a CV less boring. Everything here
        is real: drag the windows, resize them from the corner, run the terminal. Same information as
        the portfolio, now something you operate.
      </p>

      <p className="addr mt-6 uppercase tracking-label">apps</p>
      <ul className="mt-3 space-y-2">
        {APP_NOTES.map(([name, desc]) => (
          <li key={name} className="flex gap-3">
            <span className="w-20 shrink-0 font-mono text-xs text-ink">{name}</span>
            <span className="text-xs text-ink-dim">{desc}</span>
          </li>
        ))}
      </ul>

      <p className="addr mt-6 uppercase tracking-label">controls</p>
      <ul className="mt-3 space-y-1.5 font-mono text-xs text-ink-dim">
        {CONTROLS.map((c) => (
          <li key={c}>· {c}</li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-ink-faint">
        Prefer to skim?{" "}
        <Link className="link-underline text-signal" href="/">
          The classic portfolio ↗
        </Link>{" "}
        has everything on one page.
      </p>
    </div>
  );
}
