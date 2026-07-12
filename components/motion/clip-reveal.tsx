"use client";

import * as React from "react";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * ClipReveal — a signal-yellow sheet wipes off the content as it scrolls in.
 *
 * The sheet sits over the children at full scale and collapses toward the
 * top edge in proportion to scroll (scrub, not a one-shot), so the reveal
 * runs exactly as fast as the reader scrolls. One per page: the wipe spends
 * the accent color, and spending it twice makes it wallpaper.
 *
 * Reduced motion renders the children with no sheet at all.
 */
export function ClipReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "start 35%"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {children}
      {!reduce && (
        <m.div
          aria-hidden
          style={{ scaleY }}
          className="pointer-events-none absolute inset-0 z-10 origin-top rounded-lg bg-yellow"
        />
      )}
    </div>
  );
}
