import type { Transition } from "framer-motion";

/** Ease-out-quint — the project's single easing curve. No bounce, no elastic. */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const DUR = {
  micro: 0.16,
  quick: 0.24,
  base: 0.44,
  slow: 0.62,
} as const;

export const baseTransition: Transition = { duration: DUR.base, ease: EASE };
export const quickTransition: Transition = { duration: DUR.quick, ease: EASE };
