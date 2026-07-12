"use client";

import * as React from "react";
import Lenis from "lenis";
import { MOTION_CONFIG } from "@/lib/animations/config";

/**
 * SmoothScroll — inertial scrolling for the whole document.
 *
 * Lenis animates native `window.scrollY`, so `position: sticky`, anchor
 * links, and framer-motion's `useScroll` all keep working; only the easing
 * of the scroll itself changes. Mounted once from the root Providers.
 *
 * Disabled entirely under `prefers-reduced-motion`: smoothing IS motion,
 * and the vestibular guidance applies to it the same as to transforms.
 */
export function SmoothScroll() {
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      // A touch heavier than default: the page should feel like a printed
      // sheet being pushed, not a spring. Tune in lib/animations/config.ts.
      lerp: MOTION_CONFIG.lerp,
      wheelMultiplier: MOTION_CONFIG.wheelMultiplier,
    });

    let frame: number;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
