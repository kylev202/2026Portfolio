"use client";

import { m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { quickTransition } from "./anim";

type Tag = "div" | "section" | "ul" | "li" | "p" | "header" | "footer";
const revealComponents = {
  div: m.div,
  section: m.section,
  ul: m.ul,
  li: m.li,
  p: m.p,
  header: m.header,
  footer: m.footer,
} as const;

/**
 * Scroll-reveal that *enhances* already-present content. Under reduced motion
 * (and before hydration) the content renders in its final, visible state — the
 * animation only adds a fade-up once it scrolls into view in a real browser.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 14,
  as = "div",
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: Tag;
  id?: string;
}) {
  const reduced = useReducedMotion();
  const Comp = revealComponents[as] as typeof m.div;

  return (
    <Comp
      id={id}
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={reduced ? { duration: 0 } : { ...quickTransition, delay }}
    >
      {children}
    </Comp>
  );
}
