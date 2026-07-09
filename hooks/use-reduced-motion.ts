"use client";

import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * Whether the visitor has asked for reduced motion.
 *
 * The third of the three layers described in DESIGN_SYSTEM.md §5: a global CSS
 * media query zeroes transitions, `MotionConfig reducedMotion="user"` disables
 * transform/layout animation inside Framer Motion, and this hook lets a
 * component skip motion-only markup entirely.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
