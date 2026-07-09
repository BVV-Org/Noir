"use server";

import type { Filters, Paginated, Product, ProductSortKey } from "@/types";
import { getProvider } from "@/lib/data";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";

/**
 * Server Action backing `use-infinite-products`.
 *
 * A Server Action rather than a public `/api/products` route: the Storefront
 * token stays server-side, there is no new URL to rate-limit or document, and
 * the response is the same normalized `Product[]` every Server Component
 * already receives. The client sends a cursor and gets the next page.
 *
 * The cursor is opaque on both providers — Shopify's `endCursor` and the mock's
 * base64 offset are equally meaningless to the browser, which only ever hands
 * back what it was given.
 */
export interface LoadMoreArgs {
  cursor: string;
  sort?: ProductSortKey;
  filters?: Filters;
  first?: number;
}

export async function loadMoreProducts({
  cursor,
  sort,
  filters,
  first = PRODUCTS_PER_PAGE,
}: LoadMoreArgs): Promise<Paginated<Product>> {
  // A Server Action is a public HTTP endpoint. Clamp anything a caller controls.
  const pageSize = Math.min(Math.max(first, 1), 100);

  return getProvider().getProducts({
    cursor,
    sort,
    filters,
    first: pageSize,
  });
}
