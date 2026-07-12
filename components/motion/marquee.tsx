"use client";

import * as React from "react";
import {
  m,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useVelocity,
} from "framer-motion";
import { MOTION_CONFIG } from "@/lib/animations/config";
import { cn } from "@/lib/utils";

/**
 * Marquee — an endless horizontal band that hurries when the page does.
 *
 * The row holds two copies of the content; a motion value advances it every
 * frame and wraps at half the strip width, so the loop is seamless. Scroll
 * velocity feeds a temporary speed boost (the reference technique), read
 * from motion values only — nothing re-renders.
 *
 * Rationed to ONE per page, and only where the content is a brand statement
 * rather than information the reader must absorb. Reduced motion renders a
 * static, non-repeating row.
 */
export function Marquee({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const half = React.useRef(0);
  const rowRef = React.useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);

  React.useEffect(() => {
    const measure = () => {
      half.current = (rowRef.current?.scrollWidth ?? 0) / 2;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduce || half.current === 0) return;
    const boost =
      1 +
      Math.min(Math.abs(velocity.get()) / 1200, 4) *
        MOTION_CONFIG.marqueeVelocityBoost;
    let next = x.get() + (MOTION_CONFIG.marqueeSpeed * boost * delta) / 1000;
    // Wrap seamlessly at half the strip (the second copy takes over).
    if (next <= -half.current) next += half.current;
    if (next > 0) next -= half.current;
    x.set(next);
  });

  if (reduce) {
    return (
      <div className={cn("overflow-hidden", className)}>
        <div className="flex items-baseline gap-10 whitespace-nowrap">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      <m.div
        ref={rowRef}
        style={{ x }}
        className="flex w-max items-baseline gap-10 whitespace-nowrap will-change-transform"
        aria-hidden
      >
        {children}
        {children}
      </m.div>
    </div>
  );
}
