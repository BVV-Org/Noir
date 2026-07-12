"use client";

import * as React from "react";
import { m, useInView, useReducedMotion } from "framer-motion";
import { MOTION_CONFIG } from "@/lib/animations/config";
import { cn } from "@/lib/utils";

/**
 * MaskRise — type rising out of an overflow mask (DESIGN_SYSTEM.md §5).
 *
 * The print-poster reveal: the wrapper clips, the content starts fully below
 * the clip line and rises to rest. No opacity ramp; the edge of the mask is
 * the effect. `mode="mount"` plays immediately (hero, above the fold);
 * `mode="view"` waits for the element to scroll into view, once.
 *
 * The in-view observer watches the WRAPPER, not the risen content: content
 * that starts fully below its clip line has no visible box, so observing it
 * directly can never fire (IntersectionObserver measures the rect after
 * ancestor clipping).
 *
 * Reduced motion renders the settled state outright: a transform this large
 * is exactly what `prefers-reduced-motion` asks us not to do.
 */
export function MaskRise({
  children,
  className,
  delay = 0,
  mode = "view",
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Seconds. Use to sequence a small group; keep the total under ~0.4s. */
  delay?: number;
  mode?: "mount" | "view";
  /** Render as a semantic element where a div would break the outline. */
  as?: "div" | "span" | "p";
}) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });
  const Component = m[as];

  if (reduce) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  const play = mode === "mount" || inView;

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <Component
        initial={{ y: "110%" }}
        animate={play ? { y: "0%" } : undefined}
        transition={{
          duration: MOTION_CONFIG.maskRiseDuration,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </Component>
    </div>
  );
}
