"use client";

import * as React from "react";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * PinnedRail — the pinned horizontal gallery: the section holds the viewport
 * while vertical scroll pans the track sideways.
 *
 * No animation-engine pinning: the outer section is as tall as the horizontal
 * distance to travel, an inner `sticky top-0 h-screen` frame holds position,
 * and the track's `x` is a transform of the section's scroll progress. The
 * scrub therefore moves exactly as fast as the reader scrolls, in both
 * directions, with nothing listening to scroll events.
 *
 * Track width is measured with a ResizeObserver so card count and viewport
 * changes re-derive the travel distance. Reduced motion (or a zero distance)
 * renders a plain horizontally scrollable rail instead — the content is
 * always reachable.
 */
export function PinnedRail({
  items,
  className,
  itemClassName,
}: {
  items: React.ReactNode[];
  className?: string;
  itemClassName?: string;
}) {
  const outerRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLUListElement>(null);
  const [distance, setDistance] = React.useState(0);
  const [railHeight, setRailHeight] = React.useState(0);
  const reduce = useReducedMotion();

  React.useLayoutEffect(() => {
    if (reduce) return;
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const parentWidth = track.parentElement?.clientWidth ?? 0;
      setDistance(Math.max(0, track.scrollWidth - parentWidth));
      setRailHeight(track.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [reduce, items.length]);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  if (reduce) {
    return (
      <ul
        className={cn(
          "scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto",
          className
        )}
      >
        {items.map((item, i) => (
          <li key={i} className={cn("flex shrink-0 snap-start", itemClassName)}>
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    /*
     * The pinned frame is exactly as tall as the rail, NOT `100svh`.
     *
     * A full-viewport frame looks correct only once the pin has engaged. Before
     * that the frame is still in normal flow directly beneath the section
     * heading, so `items-center` centred the cards inside a viewport-tall box
     * whose top edge started below the heading — parking them roughly half a
     * screen down and opening a large dead gap under the title. Sizing the
     * frame to the content removes the empty space in both states, and the
     * outer track only needs to be tall enough to pan the horizontal distance.
     *
     * `top-24` clears the sticky navbar (h-16 / lg:4.5rem) with breathing room,
     * so the pinned rail never slides under it. Height is applied only once
     * measured, so the first paint keeps the natural (auto) height rather than
     * collapsing to zero.
     */
    <div
      ref={outerRef}
      className={className}
      style={
        railHeight ? { height: `${railHeight + distance}px` } : undefined
      }
    >
      <div
        className="sticky top-24 flex items-center overflow-hidden"
        style={railHeight ? { height: `${railHeight}px` } : undefined}
      >
        <m.ul
          ref={trackRef}
          style={{ x }}
          className="flex w-max gap-5 will-change-transform"
        >
          {items.map((item, i) => (
            <li key={i} className={cn("flex shrink-0", itemClassName)}>
              {item}
            </li>
          ))}
        </m.ul>
      </div>
    </div>
  );
}
