import type { Product } from "@/types";

/**
 * soldOutLast — sink unavailable products to the bottom of any listing.
 *
 * Applied by BOTH providers so the ordering is part of the data contract rather
 * than something each surface remembers to do. It runs *after* the shopper's
 * chosen sort and preserves it inside each group: price-ascending stays
 * price-ascending, it simply lists what you can buy before what you cannot.
 *
 * A partition rather than `sort()` with a comparator — the result is stable by
 * construction, so the incoming order carries through untouched instead of
 * relying on the engine's sort stability.
 *
 * ## This is per-page on live Shopify data
 *
 * The Storefront API has no `sortKey` for availability, and no way to express
 * "available first" in its `query` argument — so the live provider can only
 * order the page it just fetched. With infinite scroll that means sold-out
 * items sink within each batch, not to the very end of the whole catalogue.
 * Making it exact would need two paginated passes (available, then unavailable)
 * stitched into one cursor, which is a meaningful amount of machinery.
 *
 * The mock provider holds the full catalogue in memory, so it applies this
 * before pagination and the ordering there IS global.
 */
export function soldOutLast(items: Product[]): Product[] {
  const available: Product[] = [];
  const unavailable: Product[] = [];

  for (const product of items) {
    (product.availableForSale ? available : unavailable).push(product);
  }

  return unavailable.length === 0 ? items : [...available, ...unavailable];
}
