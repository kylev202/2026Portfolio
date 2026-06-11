import type { ReactNode } from "react";
import Reveal from "./Reveal";

/**
 * The core container: a panel with instrument "window chrome". The title bar
 * shows the section as a filesystem path (e.g. `~/work`) — this is the
 * section's identity and deliberately replaces per-section eyebrow labels.
 * Never nest a Window inside a Window.
 */
export default function Window({
  id,
  path,
  meta,
  children,
  className,
  labelledBy,
}: {
  id?: string;
  path: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <Reveal
      as="section"
      id={id}
      className={`window scroll-mt-24 ${className ?? ""}`}
    >
      {/* Decorative chrome; the heading inside carries the accessible name. */}
      <div className="window-bar" aria-hidden>
        <div className="window-dots">
          <span />
          <span />
          <span />
        </div>
        <span className="font-mono text-xs text-ink-dim">{path}</span>
        {meta ? <span className="readout ml-auto hidden sm:block">{meta}</span> : null}
      </div>
      <div
        className="p-6 sm:p-8 lg:p-10"
        aria-labelledby={labelledBy}
        {...(labelledBy && { role: "region" })}
      >
        {children}
      </div>
    </Reveal>
  );
}
