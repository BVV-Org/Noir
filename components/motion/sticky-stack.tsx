"use client";

import * as React from "react";
import {
  m,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { MOTION_CONFIG } from "@/lib/animations/config";
import { cn } from "@/lib/utils";

/**
 * StickyStack — cards pin near the top of the viewport and each newcomer
 * covers the last, which settles back slightly as it is buried.
 *
 * The pinning is plain CSS `position: sticky`; the only scripted part is the
 * settle-back scale, a transform of the container's scroll progress split
 * into one segment per card. Motion values only — no scroll listeners, no
 * re-renders.
 *
 * Reduced motion renders the items as a plain vertical list: sticky overlap
 * plus scale is exactly the kind of large motion the preference asks off.
 */
export function StickyStack({
  items,
  className,
  itemClassName,
}: {
  items: React.ReactNode[];
  className?: string;
  itemClassName?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  if (reduce) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        {items.map((item, i) => (
          <div key={i} className={itemClassName}>
            {item}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {items.map((item, i) => (
        <StackItem
          key={i}
          index={i}
          total={items.length}
          progress={scrollYProgress}
          className={itemClassName}
        >
          {item}
        </StackItem>
      ))}
    </div>
  );
}

function StackItem({
  children,
  index,
  total,
  progress,
  className,
}: {
  children: React.ReactNode;
  index: number;
  total: number;
  progress: MotionValue<number>;
  className?: string;
}) {
  // Card i settles back while card i+1 travels in: one 1/total-wide segment.
  const start = index / total;
  const end = (index + 1) / total;
  const isLast = index === total - 1;

  const scale = useTransform(
    progress,
    [start, end],
    [1, isLast ? 1 : MOTION_CONFIG.stackScale]
  );

  return (
    <div className="sticky top-[10vh] mb-6">
      <m.div
        style={{ scale }}
        className={cn("origin-top will-change-transform", className)}
      >
        {children}
      </m.div>
    </div>
  );
}
