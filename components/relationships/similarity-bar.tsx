"use client";

import { m, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/animations/config";
import { cn } from "@/lib/utils";

/**
 * SimilarityBar — one scent-similarity axis, as a bar that fills on scroll-in.
 *
 * This is *similarity*, never "confidence": the two are separate metrics in the
 * KB and the product only calls this one similarity. Under reduced motion the
 * bar renders filled with no travel.
 */
export function SimilarityBar({
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
        <span className="font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-caption tabular-nums text-gold">
          {pct}%
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} similarity`}
      >
        <m.span
          aria-hidden
          className="block h-full rounded-full bg-gold"
          initial={{ width: `${reduce ? pct : 0}%` }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.9, ease: EASE.signature }}
        />
      </div>
    </div>
  );
}
