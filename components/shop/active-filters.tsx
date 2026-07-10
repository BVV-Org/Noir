"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import {
  FACET_KEYS,
  FACET_LABELS,
  clearFilters,
  setParam,
  toggleFacet,
  type FacetKey,
} from "@/lib/shop/search-params";

/**
 * ActiveFilters — the chips that show what is narrowing the grid.
 *
 * Each chip is a `<Link>` to the URL with that one constraint removed, not a
 * button that mutates state. Removing a filter is therefore a navigation:
 * middle-clickable, back-button-safe, and functional without JavaScript.
 */
export function ActiveFilters() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const chips: { label: string; href: string }[] = [];

  for (const key of FACET_KEYS) {
    for (const value of searchParams.getAll(key)) {
      const query = toggleFacet(searchParams, key as FacetKey, value);
      chips.push({
        label: `${FACET_LABELS[key]}: ${value}`,
        href: query ? `${pathname}?${query}` : pathname,
      });
    }
  }

  const min = searchParams.get("min");
  const max = searchParams.get("max");
  if (min) {
    const query = setParam(searchParams, "min", null);
    chips.push({
      label: `Min ${min}`,
      href: query ? `${pathname}?${query}` : pathname,
    });
  }
  if (max) {
    const query = setParam(searchParams, "max", null);
    chips.push({
      label: `Max ${max}`,
      href: query ? `${pathname}?${query}` : pathname,
    });
  }
  if (searchParams.get("stock") === "in") {
    const query = setParam(searchParams, "stock", null);
    chips.push({
      label: "In stock only",
      href: query ? `${pathname}?${query}` : pathname,
    });
  }

  if (chips.length === 0) return null;

  const clearHref = (() => {
    const query = clearFilters(searchParams);
    return query ? `${pathname}?${query}` : pathname;
  })();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <h2 className="sr-only">Active filters</h2>

      {/* 44px targets on touch, tightened once a pointer is driving (TDD §14). */}
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          scroll={false}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 text-caption text-foreground transition-colors duration-150 ease-premium hover:border-border/80 hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-9"
        >
          {chip.label}
          <X aria-hidden className="size-3.5 text-muted-foreground" />
          <span className="sr-only">Remove filter</span>
        </Link>
      ))}

      {chips.length > 1 && (
        <Link
          href={clearHref}
          scroll={false}
          className="ml-1 min-h-9 rounded-md px-2 text-caption text-muted-foreground underline-offset-4 transition-colors duration-150 ease-premium hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Clear all
        </Link>
      )}
    </div>
  );
}
