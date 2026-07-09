import type { Variants } from "framer-motion";
import { transitions } from "./transitions";

/**
 * The shared motion vocabulary (DESIGN_SYSTEM.md §5). Allowed effects only:
 * fade, translateY, gentle scale (≤1.02), slight blur. No bounce/looping.
 * Consumed by the motion primitives (FadeIn, Reveal, Stagger).
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.base },
};

export const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: transitions.reveal },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: transitions.base },
};

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(6px)" },
  visible: { opacity: 1, filter: "blur(0px)", transition: transitions.reveal },
};

/** Parent/child pair for grids and lists. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const staggerItem: Variants = rise;
