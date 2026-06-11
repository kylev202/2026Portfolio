"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, domAnimation, LazyMotion, useReducedMotion } from "framer-motion";
import DesktopBoot from "../DesktopBoot";
import Desktop from "./Desktop";
import { WindowManager } from "./WindowManager";

/**
 * Client entry for the /desktop route. Provides the lazy motion features (kept
 * consistent with the home OS), the window manager, the ambient grain, and the
 * Linux-style boot console that gates the first paint of the desktop.
 */
export default function DesktopShell() {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [booting, setBooting] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- standard hydration guard
  useEffect(() => setMounted(true), []);

  // Decide whether to play the boot once mounted: never under reduced motion.
  useEffect(() => {
    if (!mounted || reduced) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time decision after mount
    setBooting(true);
  }, [mounted, reduced]);

  // Lock scroll while the boot console is up.
  useEffect(() => {
    if (!booting) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [booting]);

  const finishBoot = () => {
    setBooting(false);
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <WindowManager>
        <Desktop booting={booting} />
      </WindowManager>

      {/* Ambient grain, above content but never interactive. */}
      <div
        aria-hidden
        className="grain-layer pointer-events-none fixed inset-0 z-grain opacity-[0.035] mix-blend-screen"
      />

      {/* Boot console — snaps over the (already-rendered) desktop, then fades. */}
      <AnimatePresence>
        {mounted && booting && <DesktopBoot key="boot" onDone={finishBoot} />}
      </AnimatePresence>
    </LazyMotion>
  );
}
