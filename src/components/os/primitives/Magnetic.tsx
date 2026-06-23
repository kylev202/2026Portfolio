"use client";

import { useRef, type ReactNode } from "react";
import { gsap, registerGsap, useGSAP } from "./gsap";

/**
 * Subtle magnetic pull for a single key control (the primary CTA). While the
 * pointer is over the element it eases toward the cursor a few pixels via
 * gsap.quickTo (one reused tween, not a new tween per move), then springs back
 * on leave. Restraint over flash: a gentle nudge, not a bouncing toy.
 *
 * Only active on fine-pointer, non-reduced-motion devices — touch users and
 * reduced-motion users get a plain, static wrapper.
 */
export default function Magnetic({
  children,
  className,
  strength = 0.3,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        // quickTo reuses one tween per axis instead of spawning a tween per move.
        const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });

        const onMove = (event: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          xTo((event.clientX - (rect.left + rect.width / 2)) * strength);
          yTo((event.clientY - (rect.top + rect.height / 2)) * strength);
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
        };

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
        };
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [strength] },
  );

  return (
    <span ref={ref} className={className} style={{ display: "inline-flex" }}>
      {children}
    </span>
  );
}
