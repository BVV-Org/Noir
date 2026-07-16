"use client";

import * as React from "react";
import { m, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/animations/config";
import { useDupeResult } from "@/hooks/use-dupe-result";
import type { FeaturedOriginal } from "@/types/dupes";
import { SearchBar } from "@/components/dupe-finder/search-bar";
import { ResultView } from "@/components/dupe-finder/result-view";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from "@/components/dupe-finder/states";

/**
 * DupeFinder — client orchestrator. Owns the selected fragrance and drives the
 * result via `useDupeResult` (which calls `/api/dupes/<id>`). All data comes
 * from the knowledge base through the API; nothing is hardcoded here.
 *
 * `featured` is computed on the server from the KB and passed in for the empty
 * state's quick-starts, so it also stays data-driven.
 */
export function DupeFinder({ featured }: { featured: FeaturedOriginal[] }) {
  const reduce = useReducedMotion();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const { result, status, reload } = useDupeResult(selectedId);

  const select = (id: string) => setSelectedId(id);

  const compact = selectedId !== null;

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE.signature, delay },
  });

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
        <m.div {...rise(compact ? 0 : 0.24)} className={compact ? "" : "mx-auto mt-8 max-w-xl"}>
          <SearchBar onSelect={select} autoFocus={!compact} size={compact ? "md" : "lg"} />
        </m.div>
      </div>

      {/* Results region */}
      <div>
        {!compact && <EmptyState featured={featured} onSelect={select} />}
        {compact && status === "loading" && <LoadingSkeleton />}
        {compact && status === "error" && <ErrorState onRetry={reload} />}
        {compact && (status === "success" || status === "not-found") && result && (
          <ResultView result={result} featured={featured} onSelect={select} />
        )}
        {compact && status === "not-found" && !result && (
          <ErrorState onRetry={reload} />
        )}
      </div>
    </div>
  );
}
