"use client";

import * as React from "react";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";

/**
 * MotionProvider — the single Framer Motion boundary for the app (TDD §12).
 *
 * `LazyMotion` + `domAnimation` loads only the DOM animation feature set
 * (~15kb rather than the full bundle). `strict` makes the `motion.*` API throw,
 * forcing every component onto the tree-shakeable `m.*` components — the JS
 * budget in TDD §13 depends on it.
 *
 * `reducedMotion="user"` is layer two of the reduced-motion story: Framer skips
 * transform and layout animation for visitors who ask for it, while opacity
 * fades (which do not trigger vestibular symptoms) still run.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
