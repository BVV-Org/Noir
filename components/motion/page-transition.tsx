"use client";

import * as React from "react";
import { m } from "framer-motion";
import { transitions } from "@/lib/animations/transitions";

/**
 * PageTransition — the enter animation for every route change.
 *
 * Mounted from `app/template.tsx`, which React re-creates on each navigation,
 * so the animation replays without an `AnimatePresence` wrapper. Enter-only by
 * design: an exit animation would delay the next paint, and the App Router
 * cannot hold the old tree in place without hurting the navigation timings that
 * TDD §13 targets.
 *
 * Fade + a 8px rise, 350ms on the premium ease — the upper end of the
 * 250–350ms band in animation-guidelines.md. Reduced motion is handled by the
 * `MotionConfig` in MotionProvider, which drops the transform.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.page}
    >
      {children}
    </m.div>
  );
}
