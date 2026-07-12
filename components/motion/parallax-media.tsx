"use client";

import * as React from "react";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { MOTION_CONFIG } from "@/lib/animations/config";
import { cn } from "@/lib/utils";

/**
 * ParallaxMedia — an image plate whose artwork drifts as the page scrolls.
 *
 * The media is oversized (`scale-110`) inside a clipping frame and translated
 * vertically in proportion to the frame's progress through the viewport, so
 * the photograph appears to move at a different depth than the page. Driven
 * by motion values (`useScroll` + `useTransform`), never React state — the
 * tree does not re-render on scroll.
 *
 * The caller keeps ownership of the frame's aspect ratio and radius via
 * `className`; children are typically a `next/image` with `fill`.
 *
 * Reduced motion pins the media static at scale 1.
 */
export function ParallaxMedia({
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
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${MOTION_CONFIG.parallaxTravel}%`, `${MOTION_CONFIG.parallaxTravel}%`]
  );

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {reduce ? (
        <div className="absolute inset-0">{children}</div>
      ) : (
        <m.div style={{ y }} className="absolute inset-0 scale-110">
          {children}
        </m.div>
      )}
    </div>
  );
}
