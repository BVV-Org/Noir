"use client";

import * as React from "react";
import { m } from "framer-motion";
import { fadeIn } from "@/lib/animations/variants";

/**
 * FadeIn — the above-the-fold entrance (DESIGN_SYSTEM.md §5).
 *
 * Animates on mount, so it belongs to content that is already in the viewport.
 * Anything below the fold should use `Reveal` instead, or it will finish
 * animating before the visitor ever scrolls to it.
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
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {children}
    </m.div>
  );
}
