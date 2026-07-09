"use client";

import type { Filters, PageInfo, Product, ProductSortKey } from "@/types";
import { useInfiniteProducts } from "@/hooks/use-infinite-products";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ProductCard } from "@/components/commerce/product-card";
import { QuickViewDialog } from "@/components/shop/quick-view-dialog";

/**
 * LoadMoreProducts — appends further pages beneath the server-rendered grid.
 *
 * Renders *only* the appended pages. The first page stays a Server Component
 * above this one, so the shop's initial HTML, its LCP image, and everything a
 * crawler sees are unchanged by this component's existence.
 *
 * The appended cards use the same `ProductCard` and `QuickViewDialog` as the
 * server grid, so there is no second visual treatment for "page two".
 */
export function LoadMoreProducts({
  initialItems,
  initialPageInfo,
  sort,
  filters,
}: {
  initialItems: Product[];
  initialPageInfo: PageInfo;
  sort?: ProductSortKey;
  filters?: Filters;
}) {
  const { items, hasNextPage, loading, error, loadMore } = useInfiniteProducts({
    initialItems,
    initialPageInfo,
    sort,
    filters,
  });

  if (!hasNextPage && items.length === 0) return null;

  return (
    <>
      {items.length > 0 && (
        <Stagger
          as="ul"
          className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {items.map((product) => (
            <StaggerItem as="li" key={product.id} className="flex">
              <ProductCard
                product={product}
                action={<QuickViewDialog product={product} />}
                className="w-full"
              />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <p aria-live="polite" className="sr-only">
        {loading ? "Loading more fragrances" : ""}
        {items.length > 0 && !loading
          ? `${items.length} more fragrances loaded`
          : ""}
      </p>

      {error && (
        <p
          role="alert"
          className="mt-8 text-center text-small text-destructive"
        >
          {error}
        </p>
      )}

      {hasNextPage && (
        <div className="mt-14 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </>
  );
}
