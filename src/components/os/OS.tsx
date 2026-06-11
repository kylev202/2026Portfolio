"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, domAnimation, LazyMotion, useReducedMotion } from "framer-motion";
import { CommandBarProvider } from "./CommandBar";
import StatusBar from "./StatusBar";
import Boot from "./Boot";
import Hero from "./Hero";
import Footer from "./Footer";
import SystemBus from "./primitives/SystemBus";
import DepthRail from "./primitives/DepthRail";
import About from "./sections/About";
import Work from "./sections/Work";
import Path from "./sections/Path";
import Contact from "./sections/Contact";

/**
 * Orchestrates the whole instrument. The page content is always present in the
 * DOM (good for no-JS / crawlers); the boot overlay is a client-only layer that
 * snaps over it on mount, plays, then fades — so reduced-motion and no-JS users
 * get the content directly with no boot gate.
 */
export default function OS() {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"boot" | "ready">("boot");

  // eslint-disable-next-line react-hooks/set-state-in-effect -- standard hydration guard
  useEffect(() => setMounted(true), []);

  // Reduced-motion users skip the boot entirely.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- driven by external media query
    if (reduced) setPhase("ready");
  }, [reduced]);

  const showBoot = mounted && !reduced && phase === "boot";

  // Lock scroll while the boot overlay is up.
  useEffect(() => {
    if (!showBoot) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showBoot]);

  return (
    <LazyMotion features={domAnimation} strict>
      {/* Deep background field — behind everything. A single static texture
         (grain + vignette below) carries the "instrument" mood; the animated
         scanline veil was retired to keep the desktop calm. */}
      <div aria-hidden className="grid-dots fixed inset-0 -z-10 opacity-40" />

      {/* First tab stop — lets keyboard users jump past the fixed chrome. */}
      <a href="#main" className="skip-link">
        skip to content
      </a>

      <CommandBarProvider>
        <StatusBar />
        <DepthRail />

        <main key={phase} id="main" className="px-safe mx-auto max-w-shell">
          <Hero />
          <SystemBus />
          <div className="space-y-[clamp(2rem,5vw,4.5rem)] pb-10 pt-4">
            <About />
            <Work />
            <Path />
            <Contact />
          </div>
          <Footer />
        </main>

        <AnimatePresence>
          {showBoot && <Boot key="boot" onDone={() => setPhase("ready")} />}
        </AnimatePresence>
      </CommandBarProvider>

      {/* Ambient overlays — above content, never intercept clicks. */}
      <div
        aria-hidden
        className="grain-layer pointer-events-none fixed inset-0 z-grain opacity-[0.04] mix-blend-screen"
      />
      <div aria-hidden className="vignette-layer pointer-events-none fixed inset-0 z-grain" />
    </LazyMotion>
  );
}
