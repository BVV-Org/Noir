"use client";

import { m, useReducedMotion } from "framer-motion";
import { Info } from "lucide-react";
import { EASE } from "@/lib/animations/config";
import type { FragranceRelationshipsVM } from "@/types/relationships";
import { FragranceImage } from "@/components/relationships/fragrance-image";
import { DNABadge } from "@/components/relationships/badges";

/**
 * RelationshipHero — the fragrance being explored, and the engine's verdict on it.
 *
 * The headline adapts to whatever the KB returned (Verified Matches / Inspired
 * By / Original Composition / Closest DNA); this component just renders it.
 * Similarity leads, community confidence trails as a secondary readout.
 */
export function RelationshipHero({ data }: { data: FragranceRelationshipsVM }) {
  const reduce = useReducedMotion();
  const { fragrance, dna } = data;

  return (
    <m.header
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE.signature }}
      className="space-y-5"
    >
      <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:p-6">
        <FragranceImage
          image={data.image}
          sizes="(min-width: 640px) 6rem, 5rem"
          className="aspect-[4/5] w-20 shrink-0 sm:w-24"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <DNABadge dna={dna} />
            {fragrance.category && (
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground">
                {fragrance.category}
              </span>
            )}
          </div>
          <p className="mt-2 overline">{fragrance.brand}</p>
          <h1 className="mt-1 text-h2">{fragrance.name}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {data.summary}
          </p>
        </div>

        <div className="shrink-0 text-right sm:self-center">
          {data.topSimilarity != null ? (
            <>
              <p className="font-display text-h3 leading-none text-gold tabular-nums">
                {data.topSimilarity}
                <span className="align-top text-base">%</span>
              </p>
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
                Top similarity
              </p>
            </>
          ) : (
            <p className="font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground">
              {data.headline}
            </p>
          )}
          {data.topCommunityConfidence != null && (
            <p className="mt-2 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted-foreground/80">
              {data.topCommunityConfidence}% community
            </p>
          )}
        </div>
      </div>

      {/* CASE 4: the KB has no verified inspiration for an original composition. */}
      {data.noVerifiedInspiration && dna.type === "ORIGINAL_DNA" && (
        <p className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
          <Info className="size-4 shrink-0" aria-hidden />
          <span>
            <span className="text-foreground">Original composition.</span> No
            verified inspiration exists — what follows is the closest DNA the
            knowledge base can place against it.
          </span>
        </p>
      )}
    </m.header>
  );
}
