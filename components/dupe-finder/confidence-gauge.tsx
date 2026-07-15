"use client";

import * as React from "react";
import { m, animate, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/animations/config";
import { cn } from "@/lib/utils";

/**
 * ConfidenceGauge — the headline provenance-backed confidence, as a ring that
 * sweeps while a number counts up to meet it. The value comes straight from the
 * KB relationship (aggregated from attributed source claims), framed as
 * confidence rather than certainty.
 */
export function ConfidenceGauge({
  value,
  size = 132,
  label = "Confidence",
  className,
}: {
  value: number;
  size?: number;
  label?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = c * (1 - clamped / 100);
  const [display, setDisplay] = React.useState(reduce ? clamped : 0);

  React.useEffect(() => {
    if (reduce) {
      setDisplay(clamped);
      return;
    }
    const controls = animate(0, clamped, {
      duration: 1,
      ease: EASE.signature,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [clamped, reduce]);

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${clamped} percent`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-foreground/10"
        />
        <m.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="hsl(var(--gold))"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduce ? offset : c }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE.signature }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-[2rem] leading-none tabular-nums text-gold">
            {display}
            <span className="align-top text-base">%</span>
          </div>
          <div className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
