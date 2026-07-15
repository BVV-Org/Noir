"use client";

import { m, useReducedMotion } from "framer-motion";
import { Info } from "lucide-react";
import { EASE } from "@/lib/animations/config";
import { swatchFor } from "@/lib/dupes/formatter";
import type { DupeResultVM, FeaturedOriginal } from "@/types/dupes";
import { BottleArt } from "@/components/dupe-finder/bottle-art";
import { CloneCard } from "@/components/dupe-finder/clone-card";
import { NoDupesState } from "@/components/dupe-finder/states";

/**
 * ResultView — the original being matched, then its clones as ranked cards.
 * If the user searched a clone, a note explains that we resolved to the
 * original so they can see the full field of alternatives.
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
  const { original, searched, searchedRole, clones } = result;

  if (clones.length === 0) {
    return (
      <NoDupesState
        fragranceLabel={`${searched.brand} ${searched.name}`}
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
          <p className="font-mono text-caption uppercase tracking-[0.12em] text-gold">
            Dupes for
          </p>
          <h2 className="mt-1 font-display text-h2 uppercase leading-[0.95]">
            {original.name}
          </h2>
          <p className="mt-1 font-mono text-caption uppercase tracking-[0.06em] text-muted-foreground">
            {[original.brand, original.concentration, original.category]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-h3 leading-none text-gold">{clones.length}</p>
          <p className="font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground">
            {clones.length === 1 ? "verified dupe" : "verified dupes"}
          </p>
        </div>
      </m.header>

      {searchedRole === "clone" && (
        <p className="flex items-center gap-2 rounded-lg border border-gold/25 bg-gold/[0.04] px-4 py-3 text-sm text-muted-foreground">
          <Info className="size-4 shrink-0 text-gold" aria-hidden />
          <span>
            <span className="text-foreground">{searched.name}</span> is a dupe of{" "}
            <span className="text-foreground">{original.name}</span> — here&apos;s the
            full field of alternatives.
          </span>
        </p>
      )}

      <div className="space-y-6">
        {clones.map((card) => (
          <CloneCard key={card.relationshipId} card={card} />
        ))}
      </div>
    </div>
  );
}
