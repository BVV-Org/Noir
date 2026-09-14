"use client";

import { m, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/animations/config";
import { cn } from "@/lib/utils";

/**
 * MetricBar — the reusable animated bar used for the match breakdown
 * (opening / heart / drydown / overall). Fills from 0 → value on scroll-in;
 * under reduced motion it renders filled with no travel.
 */
export function MetricBar({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-small text-muted-foreground">
          {label}
        </span>
        <span className="tabular text-small font-semibold text-foreground">{pct}%</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <m.span
          aria-hidden
          className="block h-full rounded-full bg-primary"
          initial={{ width: `${reduce ? pct : 0}%` }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.9, ease: EASE.signature }}
        />
      </div>
    </div>
  );
}
