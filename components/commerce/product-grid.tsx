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
 * The grid flows 1 → 2 → 3 → 4 columns (TDD §14). `priorityCount` marks the
 * first row as LCP candidates; anything more and `priority` stops meaning
 * anything because every image is competing for the same bandwidth.
 */
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
            priority={index < priorityCount}
            action={renderAction?.(product)}
            className="w-full"
          />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
