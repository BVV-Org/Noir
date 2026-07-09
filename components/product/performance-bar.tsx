"use client";

import * as React from "react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { transitions } from "@/lib/animations/transitions";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * PerformanceBar — a `nv.*` 0–100 metric, filling on scroll into view.
 *
 * Accessibility: the bar is a `meter`, not a `progressbar` — the value is a
 * measurement of the fragrance, not the progress of a task. The visible label
 * names it, and `aria-valuetext` gives "72 out of 100" rather than a bare
 * number.
 *
 * Reduced motion is handled here explicitly. `MotionConfig reducedMotion="user"`
 * only suppresses transform and layout animation; a width tween would still
 * run, so when the visitor asks for stillness the bar is simply drawn full.
 */
export function PerformanceBar({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const labelId = React.useId();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <span id={labelId} className="text-small text-muted-foreground">
          {label}
        </span>
        <span className="text-small font-medium tabular-nums text-foreground">
          {clamped}
        </span>
      </div>

      <div
        role="meter"
        aria-labelledby={labelId}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${clamped} out of 100`}
        className="h-1 w-full overflow-hidden rounded-full bg-secondary"
      >
        <m.div
          className="h-full rounded-full bg-primary"
          initial={reduced ? false : { width: 0 }}
          whileInView={{ width: `${clamped}%` }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={transitions.reveal}
          style={reduced ? { width: `${clamped}%` } : undefined}
        />
      </div>
    </div>
  );
}

/*
 * `CORE_METRICS` deliberately does not live here. A plain value exported from a
 * "use client" module reaches a Server Component as a client reference proxy,
 * not as the array — `.filter` on it throws at prerender time. It lives in
 * `lib/config/metrics.ts`, which both sides may import.
 */
