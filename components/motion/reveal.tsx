"use client";

import * as React from "react";
import { m } from "framer-motion";
import { rise } from "@/lib/animations/variants";

/**
 * Reveal — content entering on scroll, once (DESIGN_SYSTEM.md §5).
 *
 * `once: true` is not a performance nicety; re-animating on every scroll past is
 * the "looping animation" the guidelines forbid. The `-80px` bottom margin
 * fires the reveal slightly before the element's edge clears the fold, so the
 * motion reads as anticipation rather than a jolt.
 */
export function Reveal({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Render as a semantic element where the wrapper would break the outline. */
  as?: "div" | "section" | "li" | "article";
}) {
  const Component = m[as];

  return (
    <Component
      className={className}
      variants={rise}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
    >
      {children}
    </Component>
  );
}
