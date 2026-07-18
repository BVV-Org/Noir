"use client";

import { m, useReducedMotion } from "framer-motion";
import { Sparkles, SearchX, AlertTriangle } from "lucide-react";
import { EASE } from "@/lib/animations/config";
import type { FeaturedFragrance } from "@/types/relationships";

/**
 * Empty / loading / error states for the relationship explorer.
 *
 * The quick-start chips are computed from the KB (fragrances with the most
 * verified relationships), so even the empty state is data-driven.
 */
function Chips({
  items,
  onSelect,
}: {
  items: FeaturedFragrance[];
  onSelect: (id: string, label: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-4 flex flex-wrap justify-center gap-2">
      {items.map((f) => (
        <li key={f.fragranceId}>
          <button
            type="button"
            onClick={() => onSelect(f.fragranceId, `${f.brand} ${f.name}`)}
            className="rounded-full border border-border bg-secondary/30 px-4 py-2 font-mono text-caption uppercase tracking-[0.06em] text-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {f.brand} {f.name}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function EmptyState({
  featured,
  onSelect,
}: {
  featured: FeaturedFragrance[];
  onSelect: (id: string, label: string) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <m.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE.signature }}
      className="mx-auto max-w-lg py-16 text-center sm:py-24"
    >
      <span className="mx-auto grid size-14 place-items-center rounded-full border border-border bg-secondary/40 text-foreground">
        <Sparkles className="size-6" aria-hidden />
      </span>
      <h2 className="mt-6 text-h3">Trace its DNA</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Search any fragrance to see what matches it, what it was inspired by,
        what shares its DNA, and where to go next.
      </p>
      <p className="mt-8 font-mono text-caption uppercase tracking-[0.1em] text-muted-foreground">
        Start here
      </p>
      <Chips items={featured} onSelect={onSelect} />
    </m.div>
  );
}

export function NoRelationshipsState({
  fragranceLabel,
  featured,
  onSelect,
}: {
  fragranceLabel: string;
  featured: FeaturedFragrance[];
  onSelect: (id: string, label: string) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <m.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE.signature }}
      className="mx-auto max-w-lg py-16 text-center sm:py-24"
    >
      <span className="mx-auto grid size-14 place-items-center rounded-full border border-border bg-secondary/40 text-muted-foreground">
        <SearchX className="size-6" aria-hidden />
      </span>
      <h2 className="mt-6 text-h3">No relationships yet</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        The knowledge base has{" "}
        <span className="text-foreground">{fragranceLabel}</span> on file but has
        not placed any relationship against it yet. In the meantime:
      </p>
      <Chips items={featured} onSelect={onSelect} />
    </m.div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center sm:py-24">
      <span className="mx-auto grid size-14 place-items-center rounded-full border border-border bg-secondary/40 text-muted-foreground">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <h2 className="mt-6 text-h3">Something broke</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        We couldn&apos;t reach the knowledge base. That one is on us.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 font-mono text-caption font-bold uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Try again
      </button>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-6" aria-busy role="status" aria-label="Loading relationships">
      <div className="h-36 animate-pulse rounded-xl border border-border bg-card" />
      <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      <span className="sr-only">Loading relationships…</span>
    </div>
  );
}
