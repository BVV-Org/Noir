"use client";

import * as React from "react";

/**
 * Whether the page has scrolled past `threshold` pixels.
 *
 * Drives the Navbar's scroll-aware surface (transparent over the hero, then a
 * glass hairline once content passes beneath it). The listener is passive and
 * reads are batched into a rAF so scrolling never blocks the main thread.
 */
export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    let frame = 0;

    const read = () => {
      frame = 0;
      setScrolled(window.scrollY > threshold);
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(read);
    };

    // Seed from the current position: a refresh can restore mid-page scroll.
    read();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return scrolled;
}
