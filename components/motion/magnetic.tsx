"use client";

import * as React from "react";
import { m, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MOTION_CONFIG } from "@/lib/animations/config";

/**
 * Magnetic — the wrapped element leans toward the cursor and springs home.
 *
 * Pointer position feeds motion values directly (`useMotionValue` +
 * `useSpring`), never React state: no re-renders, no mobile collapse. Only
 * active on real hover devices; touch and reduced-motion users get a plain
 * wrapper.
 */
export function Magnetic({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  if (reduce || !canHover) {
    return <div className={className}>{children}</div>;
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(
      (event.clientX - (rect.left + rect.width / 2)) *
        MOTION_CONFIG.magneticStrength
    );
    y.set(
      (event.clientY - (rect.top + rect.height / 2)) *
        MOTION_CONFIG.magneticStrength
    );
  };

  const onPointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.div
      className={className}
      style={{ x: springX, y: springY, display: "inline-block" }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </m.div>
  );
}
