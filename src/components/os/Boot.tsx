"use client";

import { useEffect, useRef } from "react";
import { m } from "framer-motion";
import { system } from "@/lib/content";
import { DUR, EASE } from "./primitives/anim";
import { useSound } from "./primitives/sound";

const LINE_STAGGER = 0.24; // seconds between boot lines
const HOLD_AFTER = 0.85; // pause on "ready" before handing off

/**
 * Signature moment #1. A short, honest boot: a meter fills while a few status
 * lines reveal, then it hands off to the desktop. Skippable (click / any key).
 * Only mounted when motion is allowed — reduced-motion users never see it.
 */
export default function Boot({ onDone }: { onDone: () => void }) {
  const done = useRef(false);
  const { play } = useSound();

  const finish = () => {
    if (done.current) return;
    done.current = true;
    onDone();
  };

  const total = system.boot.length * LINE_STAGGER + HOLD_AFTER + 0.4;

  useEffect(() => {
    const id = window.setTimeout(finish, total * 1000);
    const onKey = () => finish();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Voice each boot line as it reveals: a data tick per line, the "system online"
  // signature on the last ("ready") one. Silent unless interface sound is on, and
  // only heard where the browser lets a suspended AudioContext resume without a
  // fresh gesture (i.e. returning visitors with sound already enabled).
  useEffect(() => {
    const timers = system.boot.map((_, i) => {
      const last = i === system.boot.length - 1;
      return window.setTimeout(() => play(last ? "bootDone" : "boot"), i * LINE_STAGGER * 1000);
    });
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [play]);

  return (
    <m.div
      className="fixed inset-0 z-palette flex items-center justify-center bg-bg-deep"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DUR.base, ease: EASE }}
      onClick={finish}
      role="status"
      aria-label="Starting"
    >
      <div className="grain-layer pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-screen" />
      <div className="w-[min(90vw,28rem)] px-2">
        <div className="flex items-baseline justify-between font-mono text-xs text-ink-dim">
          <span className="text-ink">{system.name}</span>
          <span className="text-ink-faint">{system.version}</span>
        </div>

        {/* Meter */}
        <div className="mt-4 h-px w-full overflow-hidden bg-line">
          <m.div
            className="h-full bg-signal"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: total - 0.3, ease: "linear" }}
          />
        </div>

        {/* Boot lines */}
        <ul className="mt-5 space-y-1.5 font-mono text-xs">
          {system.boot.map((line, i) => {
            const last = i === system.boot.length - 1;
            return (
              <li key={line}>
                <m.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * LINE_STAGGER, duration: 0.3, ease: EASE }}
                >
                  <span className={last ? "text-signal" : "text-ink-faint"}>
                    {last ? "●" : "›"}
                  </span>
                  <span className={last ? "text-ink" : "text-ink-dim"}>{line}</span>
                </m.div>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 font-mono text-[0.72rem] text-ink-dim">press any key to skip</p>
      </div>
    </m.div>
  );
}
