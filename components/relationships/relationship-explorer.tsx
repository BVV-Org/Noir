"use client";

import * as React from "react";
import { m, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/animations/config";
import { useRelationships } from "@/hooks/use-relationships";
import type { FeaturedFragrance } from "@/types/relationships";
import { SearchBar } from "@/components/relationships/search-bar";
import { RelationshipHero } from "@/components/relationships/relationship-hero";
import { RelationshipSection } from "@/components/relationships/relationship-section";
import { PeopleAlsoExplored } from "@/components/relationships/people-also-explored";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  NoRelationshipsState,
} from "@/components/relationships/states";

/**
 * RelationshipExplorer — the client orchestrator.
 *
 * It owns the selected fragrance and renders whatever the engine returns. The
 * page shape is not decided here: sections come back from the API already
 * grouped and ranked by relationship type, and this component maps over them.
 * That is what lets a new relationship type appear with no change to this file.
 *
 * `initialFragranceId` lets a card elsewhere deep-link straight into a
 * fragrance (`/dupe-finder?f=<id>`).
 */
export function RelationshipExplorer({
  featured,
  initialFragranceId = null,
}: {
  featured: FeaturedFragrance[];
  initialFragranceId?: string | null;
}) {
  const reduce = useReducedMotion();
  const [selectedId, setSelectedId] = React.useState<string | null>(
    initialFragranceId
  );
  const { result, status, reload } = useRelationships(selectedId);

  const select = React.useCallback((id: string) => {
    setSelectedId(id);
    // Exploring from a card jumps the reader up to the new subject.
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const compact = selectedId !== null;

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE.signature, delay },
  });

  const sections = result?.sections ?? [];
  const hasAnything =
    sections.length > 0 || (result?.peopleAlsoExplored.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-12 sm:space-y-14">
      {/* Hero + search */}
      <div className={compact ? "pt-2" : "pt-8 text-center sm:pt-14"}>
        {!compact && (
          <>
            <m.p {...rise(0)} className="overline">
              The Vault
            </m.p>
            <m.h1
              {...rise(0.08)}
              className="mt-4 text-h1 font-semibold text-foreground"
            >
              Dupe Finder
            </m.h1>
            <m.p
              {...rise(0.16)}
              className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground"
            >
              Every match is community-verified and provenance-backed — ranked by
              confidence, with an honest breakdown of how close it really gets.
            </m.p>
          </>
        )}
        <m.div
          {...rise(compact ? 0 : 0.24)}
          className={compact ? "" : "mx-auto mt-8 max-w-xl"}
        >
          <SearchBar
            onSelect={select}
            autoFocus={!compact}
            size={compact ? "md" : "lg"}
          />
        </m.div>
      </div>

      {/* Results */}
      <div className="space-y-12 sm:space-y-14">
        {!compact && <EmptyState featured={featured} onSelect={select} />}
        {compact && status === "loading" && <LoadingSkeleton />}
        {compact && status === "error" && <ErrorState onRetry={reload} />}
        {compact && status === "not-found" && <ErrorState onRetry={reload} />}

        {compact && status === "success" && result && (
          <>
            <RelationshipHero data={result} />

            {/* Every section the engine returned, in registry order. */}
            {sections.map((section) => (
              <RelationshipSection
                key={`${section.presentation.type}-${section.cards[0]?.relationshipId ?? "empty"}`}
                section={section}
                onExplore={select}
              />
            ))}

            <PeopleAlsoExplored
              cards={result.peopleAlsoExplored}
              onExplore={select}
            />

            {!hasAnything && (
              <NoRelationshipsState
                fragranceLabel={`${result.fragrance.brand} ${result.fragrance.name}`}
                featured={featured}
                onSelect={select}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
