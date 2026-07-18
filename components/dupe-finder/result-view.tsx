"use client";

import { m, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/animations/config";
import { swatchFor } from "@/lib/dupes/formatter";
import type { DupeResultVM, FeaturedOriginal } from "@/types/dupes";
import { BottleArt } from "@/components/dupe-finder/bottle-art";
import { CloneCard } from "@/components/dupe-finder/clone-card";
import { NoDupesState } from "@/components/dupe-finder/states";

/**
 * ResultView — the searched fragrance, then every fragrance it relates to as
 * ranked cards. The page anchors on the searched fragrance itself; each card's
 * chip names the relationship type the KB assigned.
 */
export function ResultView({
  result,
  featured,
  onSelect,
}: {
  result: DupeResultVM;
  featured: FeaturedOriginal[];
  onSelect: (id: string, label: string) => void;
}) {
  const reduce = useReducedMotion();
  const { original, clones } = result;

  if (clones.length === 0) {
    return (
      <NoDupesState
        fragranceLabel={`${original.brand} ${original.name}`}
        featured={featured}
        onSelect={onSelect}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Original header */}
      <m.header
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE.signature }}
        className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:p-6"
      >
        <BottleArt
          swatch={swatchFor(original.id)}
          className="aspect-[4/5] w-20 shrink-0 opacity-80 sm:w-24"
        />
        <div className="min-w-0 flex-1">
          <p className="overline">Dupes for</p>
          <h2 className="mt-1 text-h2">
            {original.name}
          </h2>
          <p className="mt-1 font-mono text-caption uppercase tracking-[0.06em] text-muted-foreground">
            {[original.brand, original.concentration, original.category]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-h3 leading-none text-foreground">{clones.length}</p>
          <p className="font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground">
            {clones.length === 1 ? "match" : "matches"}
          </p>
        </div>
      </m.header>

      <div className="space-y-6">
        {clones.map((card) => (
          <CloneCard key={card.relationshipId} card={card} />
        ))}
      </div>
    </div>
  );
}
