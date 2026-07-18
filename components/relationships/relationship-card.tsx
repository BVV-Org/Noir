"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE } from "@/lib/animations/config";
import { cn } from "@/lib/utils";
import type { RelationshipCardVM } from "@/types/relationships";
import { FragranceImage } from "@/components/relationships/fragrance-image";
import { RelationshipBadge } from "@/components/relationships/badges";
import { SimilarityBar } from "@/components/relationships/similarity-bar";
import { PerformanceComparison } from "@/components/relationships/performance-comparison";
import { PriceComparison } from "@/components/relationships/price-comparison";
import { RelationshipExplanation } from "@/components/relationships/relationship-explanation";

/**
 * RelationshipCard — one related fragrance, exactly as the engine describes it.
 *
 * Every block is conditional on the KB actually having the data: the speculative
 * layer scores only `overallSimilarity`, so a SIMILAR_DNA card collapses to its
 * headline while a VERIFIED_CLONE card shows the full breakdown. Nothing is
 * padded out with placeholders.
 *
 * Similarity is the headline metric; community confidence sits beside it as a
 * clearly secondary readout.
 */
export function RelationshipCard({
  card,
  onExplore,
}: {
  card: RelationshipCardVM;
  /** Explore this fragrance in place — omitted on pages that link out. */
  onExplore?: (fragranceId: string, label: string) => void;
}) {
  const reduce = useReducedMotion();
  const { fragrance } = card;
  const label = `${fragrance.brand} ${fragrance.name}`;

  return (
    <m.article
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.5, ease: EASE.signature }}
      className={cn(
        "overflow-hidden rounded-xl border bg-card",
        card.rank === 1 && card.verified
          ? "border-foreground/30"
          : "border-border"
      )}
    >
      {/* Identity */}
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <FragranceImage
          image={card.image}
          className="aspect-[4/5] w-24 shrink-0 sm:w-28"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <RelationshipBadge
              presentation={card.presentation}
              verified={card.verified}
            />
            {fragrance.category && (
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground">
                {fragrance.category}
              </span>
            )}
          </div>

          <p className="mt-2 font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground">
            {fragrance.brand}
          </p>
          <h3 className="font-display text-h4 uppercase leading-tight">
            {fragrance.name}
          </h3>
          {(fragrance.concentration || fragrance.gender) && (
            <p className="mt-1 font-mono text-caption uppercase tracking-[0.06em] text-muted-foreground">
              {[fragrance.concentration, fragrance.gender]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>

        {/* Headline similarity, with community confidence clearly secondary. */}
        <div className="shrink-0 text-right sm:self-center">
          {card.overallSimilarity != null && (
            <>
              <p className="font-display text-h3 leading-none text-gold tabular-nums">
                {card.overallSimilarity}
                <span className="align-top text-base">%</span>
              </p>
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
                Similarity
              </p>
            </>
          )}
          {card.communityConfidence != null && (
            <p className="mt-2 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted-foreground/80">
              {card.communityConfidence}% community
            </p>
          )}
        </div>
      </div>

      {/* Breakdown — only when the engine scored the axes. */}
      {(card.similarityAxes.length > 0 || card.performance.length > 0) && (
        <div className="grid gap-x-8 gap-y-6 border-t border-border p-5 sm:grid-cols-2 sm:p-6">
          {card.similarityAxes.length > 0 && (
            <div className="space-y-3.5">
              <h4 className="font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground">
                Similarity by phase
              </h4>
              {card.similarityAxes.map((axis) => (
                <SimilarityBar
                  key={axis.label}
                  label={axis.label}
                  value={axis.value}
                />
              ))}
            </div>
          )}
          <div className="space-y-6">
            <PerformanceComparison axes={card.performance} />
            <PriceComparison price={card.price} />
          </div>
        </div>
      )}

      {/* Price alone still deserves a home when there is no breakdown grid. */}
      {card.similarityAxes.length === 0 &&
        card.performance.length === 0 &&
        card.price.hasComparison && (
          <div className="border-t border-border p-5 sm:p-6">
            <PriceComparison price={card.price} />
          </div>
        )}

      {(card.whyItMatches.length > 0 || card.differences.length > 0) && (
        <div className="border-t border-border p-5 sm:p-6">
          <RelationshipExplanation
            whyItMatches={card.whyItMatches}
            differences={card.differences}
          />
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3 sm:px-6">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground">
          Verdict by Noir
        </p>
        {onExplore ? (
          <button
            type="button"
            onClick={() => onExplore(fragrance.id, label)}
            className="group inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-foreground transition-opacity hover:opacity-70"
          >
            View fragrance
            <ArrowRight
              aria-hidden
              className="size-3.5 transition-transform duration-200 ease-premium group-hover:translate-x-0.5"
            />
          </button>
        ) : (
          <Link
            href={`/dupe-finder?f=${encodeURIComponent(fragrance.id)}`}
            className="group inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-foreground transition-opacity hover:opacity-70"
          >
            View fragrance
            <ArrowRight
              aria-hidden
              className="size-3.5 transition-transform duration-200 ease-premium group-hover:translate-x-0.5"
            />
          </Link>
        )}
      </div>
    </m.article>
  );
}
