"use client";

import { m, useScroll, useSpring } from "framer-motion";

/**
 * ProgressBar — a hairline of signal yellow tracking page scroll progress.
 *
 * Driven entirely by motion values; the tree never re-renders on scroll.
 * Kept under reduced motion: it communicates position, it does not move on
 * its own. Mounted once from the root layout, above the sticky navbar.
 */
export function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <m.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-yellow"
    />
  );
}
