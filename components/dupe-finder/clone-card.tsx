"use client";

import { m, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp, BadgeCheck, Check, Equal, Minus } from "lucide-react";
import { EASE } from "@/lib/animations/config";
import { cn } from "@/lib/utils";
import type { CloneCardVM, PerformanceAxisVM } from "@/types/dupes";
import { BottleArt } from "@/components/dupe-finder/bottle-art";
import { ConfidenceGauge } from "@/components/dupe-finder/confidence-gauge";
import { MetricBar } from "@/components/dupe-finder/metric-bar";

/** Qualitative performance vs the original (KB gives words, not fake numbers). */
function PerformanceRow({ axis }: { axis: PerformanceAxisVM }) {
  const map = {
    stronger: { Icon: ArrowUp, cls: "text-emerald-400", word: "Stronger" },
    weaker: { Icon: ArrowDown, cls: "text-amber-400", word: "Weaker" },
    similar: { Icon: Equal, cls: "text-muted-foreground", word: "Similar" },
    unknown: { Icon: Minus, cls: "text-muted-foreground/60", word: "—" },
  } as const;
  const { Icon, cls, word } = map[axis.direction];
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="font-mono text-caption uppercase tracking-[0.06em] text-muted-foreground">
        {axis.label}
      </span>
      <span className={cn("inline-flex items-center gap-1.5 text-sm", cls)}>
        <Icon className="size-3.5" aria-hidden />
        {axis.raw ? capitalize(axis.raw) : word}
      </span>
    </div>
  );
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function CloneCard({ card }: { card: CloneCardVM }) {
  const reduce = useReducedMotion();
  const { clone, price } = card;
  const hasPerformance = card.performance.length > 0;
  const hasPrice = price.originalDisplay != null || price.cloneDisplay != null;

  return (
    <m.article
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.5, ease: EASE.signature }}
      className={cn(
        "overflow-hidden rounded-xl border bg-card",
        card.rank === 1 ? "border-foreground/30" : "border-border"
      )}
    >
      {/* Header: image + identity + confidence */}
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <BottleArt
          swatch={card.swatch}
          className="aspect-[4/5] w-24 shrink-0 sm:w-28"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {card.rank === 1 && (
              <span className="rounded-full bg-foreground px-2 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.08em] text-background">
                Top match
              </span>
            )}
            <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground">
              {card.category}
            </span>
            {card.verified && (
              <span className="inline-flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground">
                <BadgeCheck className="size-3.5" aria-hidden />
                Verified
              </span>
            )}
          </div>
          <p className="mt-2 font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground">
            {clone.brand}
          </p>
          <h3 className="font-display text-h4 uppercase leading-tight">
            {clone.name}
          </h3>
          <p className="mt-1 font-mono text-caption uppercase tracking-[0.06em] text-muted-foreground">
            {[clone.concentration, clone.gender].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{card.confidenceLabel}</p>
        </div>
        <ConfidenceGauge value={card.confidence} className="shrink-0 self-center" />
      </div>

      {/* Match breakdown. Performance and price only render when the KB carries
          them; without a right column the phases take the full width. */}
      <div
        className={cn(
          "grid gap-x-8 gap-y-4 border-t border-border p-5 sm:p-6",
          (hasPerformance || hasPrice) && "sm:grid-cols-2"
        )}
      >
        <div className="space-y-3.5">
          <h4 className="font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground">
            Similarity by phase
          </h4>
          <MetricBar label="Opening" value={card.match.opening} />
          <MetricBar label="Heart" value={card.match.heart} />
          <MetricBar label="Drydown" value={card.match.drydown} />
          <MetricBar label="Overall DNA" value={card.match.overall} />
        </div>

        {(hasPerformance || hasPrice) && (
          <div className="space-y-6">
            {hasPerformance && (
              <div>
                <h4 className="mb-1 font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground">
                  Performance vs original
                </h4>
                <div className="divide-y divide-border/60">
                  {card.performance.map((axis) => (
                    <PerformanceRow key={axis.label} axis={axis} />
                  ))}
                </div>
              </div>
            )}

            {hasPrice && (
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground">
                      Original
                    </p>
                    <p className="text-sm text-muted-foreground line-through decoration-foreground/30">
                      {price.originalDisplay ?? "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-foreground">
                      This dupe
                    </p>
                    <p className="font-display text-h4 leading-none">
                      {price.cloneDisplay ?? "—"}
                    </p>
                  </div>
                </div>
                {price.savingsDisplay && price.savingsPct != null && (
                  <p className="mt-2 border-t border-foreground/15 pt-2 text-right font-mono text-caption uppercase tracking-[0.06em] text-foreground">
                    Save {price.savingsDisplay} · {price.savingsPct}% less
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explanation + differences */}
      <div className="grid gap-6 border-t border-border p-5 sm:grid-cols-2 sm:p-6">
        <div>
          <h4 className="mb-3 font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground">
            Why it matches
          </h4>
          <ul className="space-y-2">
            {card.whyItMatches.map((why) => (
              <li key={why} className="flex gap-2.5 text-sm leading-relaxed">
                <Check className="mt-0.5 size-3.5 shrink-0 text-foreground" aria-hidden />
                {why}
              </li>
            ))}
          </ul>
        </div>
        {card.differences.length > 0 && (
          <div>
            <h4 className="mb-3 font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground">
              Honest differences
            </h4>
            <ul className="space-y-2">
              {card.differences.map((diff) => (
                <li
                  key={diff}
                  className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                >
                  <Minus className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  {diff}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Verdict */}
      <div className="border-t border-border px-5 py-3 sm:px-6">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground">
          Verdict by Noir
        </p>
      </div>
    </m.article>
  );
}
