"use client";

import * as React from "react";
import { m, animate, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/animations/config";
import { cn } from "@/lib/utils";

/**
 * SimilarityRing — the top pick's match score: a thin gold arc that sweeps while
 * the number counts up to meet it. Gold is the feature's one highlight colour
 * (`--gold`), so it appears here and nowhere else on the page. The stroke is
 * flat-ended and fine to sit with the site's hairline rules, not a soft dial.
 */
export function SimilarityRing({
  value,
  size = 120,
  label = "Match",
  className,
}: {
  value: number;
  size?: number;
  label?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const stroke = 3;
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
      duration: 1.2,
      ease: EASE.signature,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [clamped, reduce]);

  return (
    <div
      className={cn("relative grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${clamped} percent`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-foreground/15"
        />
        <m.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="butt"
          stroke="hsl(var(--gold))"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduce ? offset : c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduce ? 0 : 1.2, ease: EASE.signature }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div
            className="font-display tabular-nums leading-none text-gold"
            style={{ fontSize: size * 0.3 }}
          >
            {display}
            <span style={{ fontSize: size * 0.14 }} className="align-top">
              %
            </span>
          </div>
          <div className="mt-1.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
