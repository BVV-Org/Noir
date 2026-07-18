"use client";

import { m, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/animations/config";
import { cn } from "@/lib/utils";
import type { PerformanceAxisVM } from "@/types/relationships";

/**
 * PerformanceComparison — projection / longevity / sillage against the
 * reference, drawn on a three-stop axis instead of printed as words.
 *
 * The engine only gives qualitative wording ("stronger"), so the marker snaps to
 * weaker / similar / stronger rather than pretending to a precise number. The
 * word itself stays visible — the graphic is a reading aid, not a replacement.
 */
const TONE: Record<PerformanceAxisVM["direction"], string> = {
  stronger: "bg-emerald-400",
  weaker: "bg-amber-400",
  similar: "bg-muted-foreground",
  unknown: "bg-muted-foreground/50",
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Axis({ axis, index }: { axis: PerformanceAxisVM; index: number }) {
  const reduce = useReducedMotion();
  return (
    <li className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground">
          {axis.label}
        </span>
        <span className="text-sm text-foreground">
          {axis.raw ? capitalize(axis.raw) : "—"}
        </span>
      </div>
      {/* Track: weaker ← similar → stronger */}
      <div
        className="relative h-1.5 w-full rounded-full bg-foreground/10"
        role="img"
        aria-label={`${axis.label}: ${axis.raw ?? "unknown"} versus the original`}
      >
        {/* Centre tick marks parity, so the marker's offset reads instantly. */}
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-2.5 w-px -translate-x-1/2 -translate-y-1/2 bg-foreground/25"
        />
        <m.span
          aria-hidden
          className={cn(
            "absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full",
            TONE[axis.direction]
          )}
          initial={reduce ? false : { left: "50%", opacity: 0 }}
          whileInView={{ left: `${axis.position}%`, opacity: 1 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{
            duration: 0.6,
            ease: EASE.signature,
            delay: reduce ? 0 : index * 0.06,
          }}
          style={reduce ? { left: `${axis.position}%` } : undefined}
        />
      </div>
    </li>
  );
}

export function PerformanceComparison({
  axes,
  className,
}: {
  axes: PerformanceAxisVM[];
  className?: string;
}) {
  if (axes.length === 0) return null;
  return (
    <div className={className}>
      <h4 className="mb-3 font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground">
        Performance vs original
      </h4>
      <ul className="space-y-3">
        {axes.map((axis, i) => (
          <Axis key={axis.label} axis={axis} index={i} />
        ))}
      </ul>
    </div>
  );
}
