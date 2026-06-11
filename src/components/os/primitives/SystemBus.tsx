import { profile, skills, system } from "@/lib/content";

/**
 * The system bus: a full-bleed ticker of honest telemetry that scrolls
 * continuously, so the instrument always reads as *running*. Not fake log spam
 * — every token is a real fact pulled from content. Pauses on hover; under
 * reduced motion the stylesheet freezes it to a static (masked) strip.
 *
 * Marked aria-hidden: it's an ambient flourish and every fact here is also
 * announced in the status bar / hero / about, so this avoids duplicate noise.
 */
const stack = skills.flatMap((g) => g.items);

const tokens: { k: string; v: string }[] = [
  { k: "sys", v: `${system.name} ${system.version}` },
  { k: "operator", v: profile.name },
  { k: "role", v: profile.role },
  { k: "loc", v: profile.location },
  { k: "status", v: profile.available ? "open to 2026 internships" : "heads-down" },
  { k: "stack", v: stack.join(" · ") },
  { k: "uptime", v: "learning, daily" },
];

function Tokens() {
  return (
    <>
      {tokens.map((t) => (
        <span key={t.k} className="flex items-center gap-8 pr-8">
          <span className="flex items-baseline gap-2 whitespace-nowrap font-mono text-xs">
            <span className="uppercase tracking-label text-ink-faint">{t.k}</span>
            <span className="text-ink-dim">{t.v}</span>
          </span>
          <span className="text-signal/70">◆</span>
        </span>
      ))}
    </>
  );
}

export default function SystemBus() {
  return (
    <div
      aria-hidden
      className="bus group relative -mx-4 overflow-hidden border-y border-line bg-surface/30 py-2.5 sm:-mx-6"
    >
      <div className="mask-fade-x">
        {/* One track holding two identical copies → seamless -50% loop. */}
        <div className="bus-track items-center">
          <Tokens />
          <Tokens />
        </div>
      </div>
    </div>
  );
}
