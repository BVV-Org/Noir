"use client";

import { m, useReducedMotion } from "framer-motion";
import { AlertTriangle, SearchX, Sparkles } from "lucide-react";
import { EASE } from "@/lib/animations/config";
import { Skeleton } from "@/components/ui/skeleton";
import type { FeaturedOriginal } from "@/types/dupes";

function Chips({
  items,
  onSelect,
}: {
  items: FeaturedOriginal[];
  onSelect: (id: string, label: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      {items.map((f) => (
        <button
          key={f.fragranceId}
          onClick={() => onSelect(f.fragranceId, `${f.brand} ${f.name}`)}
          className="rounded-full border border-border bg-secondary/30 px-4 py-2 font-mono text-caption uppercase tracking-[0.06em] text-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {f.brand} {f.name}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({
  featured,
  onSelect,
}: {
  featured: FeaturedOriginal[];
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
      <h2 className="mt-6 font-display text-h3 uppercase leading-tight">Find its match</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Search a designer or niche fragrance and we&apos;ll surface its verified,
        community-sourced dupes — ranked by confidence, with a transparent
        breakdown of why.
      </p>
      <p className="mt-8 font-mono text-caption uppercase tracking-[0.1em] text-muted-foreground">
        Popular right now
      </p>
      <Chips items={featured} onSelect={onSelect} />
    </m.div>
  );
}

export function NoDupesState({
  fragranceLabel,
  featured,
  onSelect,
}: {
  fragranceLabel: string;
  featured: FeaturedOriginal[];
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
      <h2 className="mt-6 font-display text-h3 uppercase leading-tight">No verified dupe yet</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        We don&apos;t have a high-confidence match for{" "}
        <span className="text-foreground">{fragranceLabel}</span> in the knowledge
        base yet — every relationship needs a real source before it appears here.
        In the meantime:
      </p>
      <Chips items={featured} onSelect={onSelect} />
    </m.div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center sm:py-24">
      <span className="mx-auto grid size-14 place-items-center rounded-full border border-destructive/40 bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <h2 className="mt-6 font-display text-h3 uppercase">Something slipped</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        We couldn&apos;t reach the knowledge base just now. Give it another try.
      </p>
      <button
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
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <span className="sr-only">Finding matches…</span>
      <Skeleton className="h-24 rounded-xl" />
      {[0, 1].map((i) => (
        <div key={i} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="flex gap-5">
            <Skeleton className="aspect-[4/5] w-24 rounded-lg" />
            <div className="flex-1 space-y-2 pt-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="size-[132px] rounded-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
