"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
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
  const lenisRef = React.useRef<Lenis | null>(null);
  const pathname = usePathname();

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
    lenisRef.current = lenis;

    let frame: number;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  /**
   * Reset to the top on navigation.
   *
   * The App Router resets `window.scrollY` itself, but Lenis keeps its own
   * `animatedScroll`/`targetScroll` and writes them back on the very next
   * frame — so the router's reset is immediately undone and the new route
   * opens wherever the previous one was left. Scrolling from the homepage
   * into a product page is the obvious case: it lands mid-page.
   *
   * `immediate` jumps rather than animating: a new page easing up to its own
   * top would read as a glitch, not as motion. `force` is required because
   * Lenis ignores `scrollTo` while stopped (e.g. a modal locked scrolling
   * during the transition), which would silently reinstate the bug.
   *
   * A hash link is the one case to leave alone — the browser is mid-anchor
   * jump and forcing 0 would fight it.
   */
  React.useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (window.location.hash) return;
    lenis.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
