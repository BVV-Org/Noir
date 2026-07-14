"use client";

import * as React from "react";
import { m } from "framer-motion";
import { transitions } from "@/lib/animations/transitions";

/**
 * FadeIn — the above-the-fold entrance (DESIGN_SYSTEM.md §5).
 *
 * Animates on mount, so it belongs to content that is already in the viewport.
 * Anything below the fold should use `Reveal` instead, or it will finish
 * animating before the visitor ever scrolls to it.
 *
 * Deliberately NOT driven by the shared `fadeIn` variant: that variant carries
 * its own `transition`, and in Framer Motion a variant-level transition beats
 * the component's `transition` prop — which silently discarded `delay` and made
 * this component impossible to sequence. Spelling the transition out here is
 * what makes `delay` mean anything.
 */
export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** Seconds. Use to sequence a small group; keep the total under ~0.4s. */
  delay?: number;
}) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ...transitions.base, delay }}
    >
      {children}
    </m.div>
  );
}
