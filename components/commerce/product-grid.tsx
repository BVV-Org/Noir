import * as React from "react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ProductCard } from "@/components/commerce/product-card";

/**
 * ProductGrid — the one grid every product listing uses.
 *
 * Server Component. `Stagger` is a client boundary, but the cards are rendered
 * here and passed through as children, so they stay on the server (React sends
 * them as serialized element trees, not as code).
 *
 * The grid flows 1 → 2 → 3 → 4 columns (TDD §14).
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

export function ProductGrid({
  products,
  priorityCount = 0,
  renderAction,
  className,
}: {
  products: Product[];
  priorityCount?: number;
  /** Overlay control per card, e.g. Quick View. Evaluated on the server. */
  renderAction?: (product: Product) => React.ReactNode;
  className?: string;
}) {
  // Callers ask for a first row; the grid decides what is defensible.
  const priorityLimit = Math.min(priorityCount, MAX_PRIORITY_IMAGES);

  return (
    <Stagger
      as="ul"
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {products.map((product, index) => (
        <StaggerItem as="li" key={product.id} className="flex">
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
