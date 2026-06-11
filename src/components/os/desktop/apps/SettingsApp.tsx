"use client";

import { profile, system } from "@/lib/content";
import { useWindows, type Wallpaper } from "../WindowManager";

const WALLPAPERS: { id: Wallpaper; label: string; swatch: string }[] = [
  { id: "grid", label: "Blueprint grid", swatch: "grid-dots" },
  { id: "deep", label: "Deep field", swatch: "" },
  { id: "rules", label: "Hairline rules", swatch: "wp-rules" },
];

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
        on ? "border-signal/60 bg-signal/20" : "border-line bg-surface"
      }`}
    >
      <span
        aria-hidden
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all duration-200 ${
          on ? "left-[1.45rem] bg-signal" : "left-1 bg-ink-faint"
        }`}
      />
    </button>
  );
}

/** Settings window — live desktop preferences (persisted to localStorage). */
export default function SettingsApp() {
  const { settings, setSetting } = useWindows();

  return (
    <div className="h-full overflow-y-auto px-5 py-5 sm:px-6">
      <div className="flex items-center gap-3 border-b border-line pb-3">
        <span className="addr text-ink-dim">~/settings</span>
        <span className="addr ml-auto">live</span>
      </div>

      <p className="addr mt-6 uppercase tracking-label">wallpaper</p>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {WALLPAPERS.map((w) => {
          const active = settings.wallpaper === w.id;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setSetting("wallpaper", w.id)}
              aria-pressed={active}
              className={`rounded-md border p-2 text-left transition-colors ${
                active ? "border-signal/60 bg-signal/10" : "border-line hover:border-line-strong"
              }`}
            >
              <span aria-hidden className={`block h-12 w-full rounded bg-bg-deep ${w.swatch}`} />
              <span
                className={`mt-2 block font-mono text-[0.7rem] ${
                  active ? "text-signal" : "text-ink-dim"
                }`}
              >
                {w.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="addr mt-7 uppercase tracking-label">motion</p>
      <label className="mt-3 flex items-center justify-between gap-4 rounded-md border border-line px-3.5 py-3">
        <span className="text-sm text-ink">
          Calm mode
          <span className="mt-0.5 block font-mono text-[0.7rem] text-ink-faint">
            disables ambient and window animation
          </span>
        </span>
        <Toggle on={settings.calm} onChange={(v) => setSetting("calm", v)} label="Calm mode" />
      </label>

      <p className="addr mt-7 uppercase tracking-label">system</p>
      <dl className="mt-3 divide-y divide-line border-y border-line font-mono text-xs">
        {(
          [
            ["name", system.name],
            ["version", system.version],
            ["user", profile.handle],
            ["renderer", "react 19 · framer-motion"],
          ] as [string, string][]
        ).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-2">
            <dt className="text-ink-faint">{k}</dt>
            <dd className="text-ink-dim">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
