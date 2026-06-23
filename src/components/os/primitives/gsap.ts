"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import { EASE } from "./anim";

/**
 * Central GSAP wiring for the instrument. GSAP is the scroll-choreography layer
 * (depth/parallax, scrubbed draws) that complements Framer Motion (boot, desktop,
 * micro-interactions). Everything here is client-only and reduced-motion aware.
 *
 * `RUNTIME_EASE` mirrors the project's single easing curve (ease-out-quint,
 * `[0.22,1,0.36,1]`) so GSAP tweens feel identical to the Framer ones.
 */
export const RUNTIME_EASE = "runtime";

let registered = false;

/** Idempotent, client-only plugin registration. Safe to call from any effect. */
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase);
  CustomEase.create(RUNTIME_EASE, EASE.join(","));
  gsap.defaults({ ease: RUNTIME_EASE, duration: 0.6 });
  registered = true;
}

export { gsap, ScrollTrigger, useGSAP };
