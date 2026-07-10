"use client";

import * as React from "react";
import type { Filters, PageInfo, Product, ProductSortKey } from "@/types";
import { loadMoreProducts } from "@/lib/actions/products";

/**
 * Append further pages of products to a server-rendered first page.
 *
 * The first page is always rendered on the server: it is what search engines
 * index and what the visitor sees before any JavaScript runs. This hook only
 * ever *adds* to it, so turning JavaScript off costs you page two, not the shop.
 *
 * Deduplicates by product id on append. Cursor pagination over a catalogue that
 * is being edited can hand back a product that shifted across the page boundary,
 * and React will not forgive two children with the same key.
 *
 * Concurrent `loadMore()` calls are ignored while one is in flight — a
 * double-clicked button must not fetch and append the same page twice.
 */
export interface UseInfiniteProductsOptions {
  initialItems: Product[];
  initialPageInfo: PageInfo;
  sort?: ProductSortKey;
  filters?: Filters;
  pageSize?: number;
}

export interface UseInfiniteProductsResult {
  /** Only the pages fetched *after* the initial one. */
  items: Product[];
  hasNextPage: boolean;
  loading: boolean;
  error: string | null;
  loadMore: () => void;
}

export function useInfiniteProducts({
  initialItems,
  initialPageInfo,
  sort,
  filters,
  pageSize,
}: UseInfiniteProductsOptions): UseInfiniteProductsResult {
  const [items, setItems] = React.useState<Product[]>([]);
  const [pageInfo, setPageInfo] = React.useState<PageInfo>(initialPageInfo);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const inFlight = React.useRef(false);

  // A filter or sort change re-renders the server page with a new first page.
  // Drop everything this hook appended, or the old results linger beneath the
  // new ones.
  //
  // Keyed on a serialized signature rather than the objects themselves: `sort`
  // and `filters` arrive as fresh object literals from the server on every
  // render, so a reference comparison would reset the list on each one.
  const queryKey = JSON.stringify({
    sort,
    filters,
    cursor: initialPageInfo.endCursor,
  });

  React.useEffect(() => {
    setItems([]);
    setPageInfo(initialPageInfo);
    setError(null);
    // `initialPageInfo` is intentionally excluded — `queryKey` already captures
    // the only part of it that identifies a page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  const seen = React.useMemo(() => {
    const ids = new Set(initialItems.map((product) => product.id));
    for (const product of items) ids.add(product.id);
    return ids;
  }, [initialItems, items]);

  const loadMore = React.useCallback(() => {
    if (inFlight.current || !pageInfo.hasNextPage || !pageInfo.endCursor)
      return;

    inFlight.current = true;
    setLoading(true);
    setError(null);

    loadMoreProducts({
      cursor: pageInfo.endCursor,
      sort,
      filters,
      first: pageSize,
    })
      .then((page) => {
        const fresh = page.items.filter((product) => !seen.has(product.id));
        setItems((current) => [...current, ...fresh]);
        setPageInfo(page.pageInfo);
      })
      .catch(() => {
        setError("Could not load more fragrances. Try again.");
      })
      .finally(() => {
        inFlight.current = false;
        setLoading(false);
      });
  }, [pageInfo, sort, filters, pageSize, seen]);

  return {
    items,
    hasNextPage: pageInfo.hasNextPage,
    loading,
    error,
    loadMore,
  };
}
