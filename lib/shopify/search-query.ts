import type { Filters, ProductSortKey } from "@/types";
import { KIT_TAG } from "./metafields";

/**
 * Translate the storefront's `Filters` into Shopify's product search syntax.
 *
 * ## The constraint that shapes this file
 *
 * The Storefront `products(query:)` argument searches *native* fields only —
 * `title`, `vendor`, `tag`, `available_for_sale`, `variants.price`. It cannot
 * filter on metafields. Only a collection's `filters` argument can, and only for
 * facets explicitly published in Admin.
 *
 * Our facets (rarity, season, mood, class, DNA, notes) all live in `nv`
 * metafields. So the store must **mirror those values onto product tags** — a
 * fragrance tagged `Mythic`, `Winter`, `Evening`, `Oud`. This is the standard
 * approach for faceted Shopify storefronts, and it is why `getProducts` can
 * answer a rarity filter at all. A Shopify Flow rule that copies metafield
 * values to tags on publish keeps the two in sync.
 *
 * `nv.*` remains the semantic source of truth and is what the UI renders; tags
 * exist purely so Shopify's index can find things.
 *
 * ## Escaping
 *
 * Values are wrapped in double quotes, and embedded quotes and backslashes are
 * escaped. Without this a value like `5" bottle` would terminate the term early
 * and silently widen the result set.
 */

const escape = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

/** OR within one facet: `(tag:"a" OR tag:"b")`. */
const anyOf = (field: string, values: string[] | undefined): string | null => {
  if (!values?.length) return null;
  const terms = values.map((value) => `${field}:"${escape(value)}"`);
  return terms.length === 1 ? terms[0]! : `(${terms.join(" OR ")})`;
};

export interface BuildQueryOptions {
  /** Free-text search, prepended so relevance ranking sees it. */
  search?: string;
  filters?: Filters;
  /**
   * Kits are Products. Every catalogue read must exclude them, and the kit read
   * must select only them — otherwise a discovery kit appears in the shop grid.
   */
  kits?: "exclude" | "only";
}

export function buildProductQuery({
  search,
  filters,
  kits = "exclude",
}: BuildQueryOptions): string {
  const terms: string[] = [];

  if (search?.trim()) terms.push(escape(search.trim()));

  if (kits === "only") terms.push(`tag:"${KIT_TAG}"`);
  else terms.push(`-tag:"${KIT_TAG}"`);

  if (filters) {
    const facets = [
      anyOf("vendor", filters.brands),
      // Everything below relies on the metafield → tag mirror described above.
      anyOf("tag", filters.rarities),
      anyOf("tag", filters.seasons),
      anyOf("tag", filters.moods),
      anyOf("tag", filters.classes),
      anyOf("tag", filters.dna),
      anyOf("tag", filters.notes),
      anyOf("tag", filters.tags),
    ].filter((term): term is string => Boolean(term));

    terms.push(...facets);

    if (filters.inStockOnly) terms.push("available_for_sale:true");
    if (filters.minPrice !== undefined) {
      terms.push(`variants.price:>=${filters.minPrice}`);
    }
    if (filters.maxPrice !== undefined) {
      terms.push(`variants.price:<=${filters.maxPrice}`);
    }
  }

  // Space-joined terms are ANDed by Shopify — the semantics the shop expects.
  return terms.join(" ");
}

/** Storefront `ProductSortKeys`, plus the `reverse` flag it pairs with. */
export interface ShopifySort {
  sortKey: string | null;
  reverse: boolean;
}

export function mapSortKey(
  sort: ProductSortKey | undefined,
  isSearch: boolean
): ShopifySort {
  switch (sort) {
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    case "newest":
      return { sortKey: "CREATED_AT", reverse: true };
    case "best-selling":
      return { sortKey: "BEST_SELLING", reverse: false };
    case "relevance":
    default:
      // RELEVANCE is only meaningful alongside a search term; Shopify rejects
      // it otherwise. Browsing with no sort falls back to the store's own order.
      return { sortKey: isSearch ? "RELEVANCE" : null, reverse: false };
  }
}

/**
 * The same sort, for a collection's products.
 *
 * `collection.products(sortKey:)` takes `ProductCollectionSortKeys`, which is a
 * *different enum* from `ProductSortKeys`: newest is `CREATED`, not
 * `CREATED_AT`, and the default is `COLLECTION_DEFAULT` (the merchandiser's
 * manual order) rather than nothing. Passing a `ProductSortKeys` value here is
 * a schema error, so the two mappings must stay separate.
 */
export function mapCollectionSortKey(
  sort: ProductSortKey | undefined
): ShopifySort {
  switch (sort) {
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    case "newest":
      return { sortKey: "CREATED", reverse: true };
    case "best-selling":
      return { sortKey: "BEST_SELLING", reverse: false };
    case "relevance":
    default:
      return { sortKey: "COLLECTION_DEFAULT", reverse: false };
  }
}
