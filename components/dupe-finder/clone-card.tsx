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
    stronger: { Icon: ArrowUp, cls: "text-foreground", word: "Stronger" },
    weaker: { Icon: ArrowDown, cls: "text-muted-foreground", word: "Weaker" },
    similar: { Icon: Equal, cls: "text-muted-foreground", word: "Similar" },
    unknown: { Icon: Minus, cls: "text-muted-foreground/60", word: "—" },
  } as const;
  const { Icon, cls, word } = map[axis.direction];
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-small text-muted-foreground">
        {axis.label}
      </span>
      <span className={cn("inline-flex items-center gap-1.5 text-small font-medium", cls)}>
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
        "overflow-hidden rounded-xl border bg-card shadow-card",
        card.rank === 1 ? "border-foreground/25 ring-1 ring-foreground/10" : "border-border"
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
              <span className="rounded-full bg-primary px-2 py-0.5 text-caption font-medium text-primary-foreground">
                Top match
              </span>
            )}
            <span className="rounded-full bg-secondary px-2 py-0.5 text-caption font-medium text-secondary-foreground">
              {card.category}
            </span>
            {card.verified && (
              <span className="inline-flex items-center gap-1 text-caption font-medium text-muted-foreground">
                <BadgeCheck className="size-3.5" aria-hidden />
                Verified
              </span>
            )}
          </div>
          <p className="mt-3 text-small text-muted-foreground">
            {clone.brand}
          </p>
          <h3 className="text-h4 font-semibold">
            {clone.name}
          </h3>
          <p className="mt-1 text-caption text-muted-foreground">
            {[clone.concentration, clone.gender].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-2 text-small text-muted-foreground">{card.confidenceLabel}</p>
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
          <h4 className="text-small font-medium text-foreground">
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
                <h4 className="mb-1 text-small font-medium text-foreground">
                  Performance vs original
                </h4>
                <div className="divide-y divide-border">
                  {card.performance.map((axis) => (
                    <PerformanceRow key={axis.label} axis={axis} />
                  ))}
                </div>
              </div>
            )}

            {hasPrice && (
              <div className="rounded-lg bg-surface p-4 ring-1 ring-inset ring-border">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-caption text-muted-foreground">
                      Original
                    </p>
                    <p className="tabular text-small text-muted-foreground line-through decoration-foreground/30">
                      {price.originalDisplay ?? "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-caption font-medium text-foreground">
                      This dupe
                    </p>
                    <p className="tabular text-h4 font-semibold leading-none">
                      {price.cloneDisplay ?? "—"}
                    </p>
                  </div>
                </div>
                {price.savingsDisplay && price.savingsPct != null && (
                  <p className="mt-3 border-t border-border pt-3 text-right text-caption font-medium text-foreground">
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
          <h4 className="mb-3 text-small font-medium text-foreground">
            Why it matches
          </h4>
          <ul className="space-y-2">
            {card.whyItMatches.map((why) => (
              <li key={why} className="flex gap-2.5 text-small leading-relaxed">
                <Check className="mt-0.5 size-3.5 shrink-0 text-foreground" aria-hidden />
                {why}
              </li>
            ))}
          </ul>
        </div>
        {card.differences.length > 0 && (
          <div>
            <h4 className="mb-3 text-small font-medium text-foreground">
              Honest differences
            </h4>
            <ul className="space-y-2">
              {card.differences.map((diff) => (
                <li
                  key={diff}
                  className="flex gap-2.5 text-small leading-relaxed text-muted-foreground"
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
      <div className="border-t border-border bg-surface px-5 py-3 sm:px-6">
        <p className="text-caption text-muted-foreground">
          Verdict by Noir
        </p>
      </div>
    </m.article>
  );
}
