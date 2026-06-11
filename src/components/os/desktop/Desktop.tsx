"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { EASE } from "../primitives/anim";
import { appById } from "./apps";
import Dock from "./Dock";
import DesktopIcons from "./DesktopIcons";
import MenuBar from "./MenuBar";
import Win from "./Win";
import { useWindows } from "./WindowManager";

/**
 * The desktop surface: wallpaper, top bar, icons, the live window layer, dock.
 * Owns two global behaviours: a one-time Readme on first boot, and Esc-to-close
 * on the focused window (skipped while typing in a field).
 */
export default function Desktop({ booting = false }: { booting?: boolean }) {
  const { windows, open, close, order, settings } = useWindows();
  const reduced = useReducedMotion();
  const calm = reduced || settings.calm;
  const greeted = useRef(false);

  // Auto-open the Readme once, as a friendly first run — but only after the
  // boot console has handed off, so it never pops behind the overlay.
  useEffect(() => {
    if (booting || greeted.current) return;
    const readme = appById("readme");
    if (!readme) return;
    greeted.current = true;
    const t = window.setTimeout(() => open(readme), calm ? 0 : 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booting]);

  // Esc closes the focused window (but not while typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const ae = document.activeElement;
      if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA")) return;
      for (let i = order.length - 1; i >= 0; i--) {
        const w = windows.find((x) => x.id === order[i]);
        if (w && !w.minimized) {
          close(w.id);
          break;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [order, windows, close]);

  const wall =
    settings.wallpaper === "grid"
      ? "grid-dots"
      : settings.wallpaper === "rules"
        ? "wp-rules"
        : "";

  return (
    <m.div
      className="screen-h relative w-full overflow-hidden bg-bg text-ink"
      initial={calm ? false : { opacity: 0, scale: 1.012 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={calm ? { duration: 0 } : { duration: 0.5, ease: EASE }}
    >
      {/* Wallpaper + atmosphere */}
      <div aria-hidden className={`pointer-events-none absolute inset-0 opacity-50 ${wall}`} />
      <div aria-hidden className="vignette-layer pointer-events-none absolute inset-0" />
      <span
        aria-hidden
        className="ghost-num pointer-events-none absolute bottom-20 right-4 select-none text-[clamp(7rem,18vw,16rem)] leading-none opacity-60"
      >
        os
      </span>

      <MenuBar />
      <DesktopIcons />

      {/* Window layer */}
      <AnimatePresence>
        {windows.map((w) => {
          const app = appById(w.id);
          return app ? <Win key={w.id} win={w} app={app} /> : null;
        })}
      </AnimatePresence>

      {/* Empty-desktop hint (no windows open and nothing minimised) */}
      {windows.length === 0 && (
        <m.p
          className="addr pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
          initial={calm ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: calm ? 0 : 0.2, duration: 0.4 }}
        >
          open an app from the dock below, or the icons on the left
        </m.p>
      )}

      <Dock />
    </m.div>
  );
}
