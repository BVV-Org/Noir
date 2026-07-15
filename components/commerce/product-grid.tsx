import * as React from "react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ProductCard } from "@/components/commerce/product-card";

/**
 * ProductGrid — the one product listing every surface uses.
 *
 * Server Component. `Stagger` is a client boundary, but the cards are rendered
 * here and passed through as children, so they stay on the server (React sends
 * them as serialized element trees, not as code).
 *
 * Two layouts, one component:
 *   `grid` — flows 1 → 2 → 3 → 4 columns (TDD §14). Catalogue pages.
 *   `rail` — a horizontal scroll-snap strip. Homepage secondary sections use
 *   it so two product sections on one page never share a layout family.
 *
 * ## `priorityCount` is capped, deliberately
 *
 * `priority` emits a `<link rel=preload>` and `fetchpriority="high"`. The grid
 * is mobile-first: at 390px exactly *one* card is above the fold. Marking a
 * desktop row of four as priority therefore issues three high-priority preloads
 * for images the phone cannot see, competing for bandwidth with the one image
 * that actually determines LCP.
 *
 * Two is the ceiling: it covers the two-column tablet breakpoint and no more.
 * The remaining cards lazy-load, and any that are already in the viewport begin
 * fetching on the first intersection callback — a few milliseconds, not a
 * regression.
 */
const MAX_PRIORITY_IMAGES = 2;

/**
 * `rail-mobile` is a horizontal scroll-snap strip on phones that becomes the
 * normal responsive grid from `sm` up — so a long homepage section stays a quick
 * swipe on a phone but keeps its grid on tablet/desktop.
 */
const CONTAINER_CLASS = {
  grid: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  rail: "scrollbar-none -mb-4 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4",
  "rail-mobile":
    "scrollbar-none -mb-4 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 " +
    "sm:mb-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 " +
    "lg:grid-cols-3 xl:grid-cols-4",
} as const;

const ITEM_CLASS = {
  grid: "",
  rail: "w-[72vw] shrink-0 snap-start sm:w-[44vw] lg:w-[30%]",
  "rail-mobile": "w-[72vw] shrink-0 snap-start sm:w-auto",
} as const;

export function ProductGrid({
  products,
  layout = "grid",
  priorityCount = 0,
  renderAction,
  className,
}: {
  products: Product[];
  layout?: "grid" | "rail" | "rail-mobile";
  priorityCount?: number;
  /** Overlay control per card, e.g. Quick View. Evaluated on the server. */
  renderAction?: (product: Product) => React.ReactNode;
  className?: string;
}) {
  // Callers ask for a first row; the grid decides what is defensible.
  const priorityLimit = Math.min(priorityCount, MAX_PRIORITY_IMAGES);

  return (
    <Stagger as="ul" className={cn(CONTAINER_CLASS[layout], className)}>
      {products.map((product, index) => (
        <StaggerItem
          as="li"
          key={product.id}
          className={cn("flex", ITEM_CLASS[layout])}
        >
          <ProductCard
            product={product}
            priority={index < priorityLimit}
            action={renderAction?.(product)}
            className="w-full"
          />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
