import type { Filters, ProductSortKey } from "@/types";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";

/**
 * The shop's URL contract.
 *
 * Search params are the single source of truth for filters, sort, search, and
 * page size (TDD §15). That makes every shop state shareable, bookmarkable, and
 * back-button-safe, and it means the grid can stay a Server Component — the
 * browser never holds filter state that the server does not also have.
 *
 * Facet params are repeated rather than comma-joined (`?brand=A&brand=B`),
 * which is what `URLSearchParams` produces natively and what Shopify's own
 * faceted URLs look like.
 */

/** Query-string key → the `Filters` field it populates. */
export const FACETS = {
  brand: "brands",
  note: "notes",
  season: "seasons",
  mood: "moods",
  class: "classes",
  dna: "dna",
  rarity: "rarities",
  tag: "tags",
  gender: "genders",
} as const satisfies Record<string, keyof Filters>;

export type FacetKey = keyof typeof FACETS;

export const FACET_KEYS = Object.keys(FACETS) as FacetKey[];

export const SORT_OPTIONS: { value: ProductSortKey; label: string }[] = [
  { value: "relevance", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "best-selling", label: "Best selling" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const SORT_VALUES = new Set(SORT_OPTIONS.map((o) => o.value));

/** Next hands a param as `string | string[] | undefined`. Normalize to array. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

const toArray = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const toNumber = (value: string | undefined): number | undefined => {
  if (value === undefined) return undefined;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export interface ShopQuery {
  query: string;
  sort: ProductSortKey;
  filters: Filters;
  /** How many products to render. Grows via "Load more". */
  show: number;
  /** True when any facet, price bound, or stock toggle is applied. */
  hasFilters: boolean;
}

export function parseShopQuery(params: RawSearchParams): ShopQuery {
  const filters: Filters = {};

  for (const key of FACET_KEYS) {
    const values = toArray(params[key]);
    if (values.length > 0) filters[FACETS[key]] = values;
  }

  const minPrice = toNumber(first(params.min));
  const maxPrice = toNumber(first(params.max));
  if (minPrice !== undefined) filters.minPrice = minPrice;
  if (maxPrice !== undefined) filters.maxPrice = maxPrice;

  const inStockOnly = first(params.stock) === "in";
  if (inStockOnly) filters.inStockOnly = true;

  const rawSort = first(params.sort);
  const sort: ProductSortKey =
    rawSort && SORT_VALUES.has(rawSort as ProductSortKey)
      ? (rawSort as ProductSortKey)
      : "relevance";

  const show = toNumber(first(params.show)) ?? PRODUCTS_PER_PAGE;

  return {
    query: (first(params.q) ?? "").trim(),
    sort,
    filters,
    // Upper clamp guards the provider: `?show=100000` would otherwise ask
    // Shopify for the entire catalogue in one query (its own cap is 250).
    show: Math.min(Math.max(show, 1), 250),
    hasFilters: Object.keys(filters).length > 0,
  };
}

/** Human labels for the facet groups, used by the sidebar and the chips. */
export const FACET_LABELS: Record<FacetKey, string> = {
  brand: "House",
  note: "Notes",
  season: "Season",
  mood: "Mood",
  class: "Class",
  dna: "DNA",
  rarity: "Rarity",
  tag: "Tag",
  gender: "For",
};

/**
 * Toggle one facet value in a query string, returning the new search string.
 *
 * Any change to a facet resets `show`, because keeping "load more" depth across
 * a filter change would render a page of results the visitor never scrolled to.
 */
export function toggleFacet(
  params: URLSearchParams,
  key: FacetKey,
  value: string
): string {
  const next = new URLSearchParams(params);
  const existing = next.getAll(key);

  next.delete(key);
  for (const v of existing) {
    if (v !== value) next.append(key, v);
  }
  if (!existing.includes(value)) next.append(key, value);

  next.delete("show");
  return next.toString();
}

/** Remove every facet, price bound, and the stock toggle. Keeps `q` and `sort`. */
export function clearFilters(params: URLSearchParams): string {
  const next = new URLSearchParams(params);
  for (const key of FACET_KEYS) next.delete(key);
  next.delete("min");
  next.delete("max");
  next.delete("stock");
  next.delete("show");
  return next.toString();
}

/** Set (or clear) a single-valued param, resetting pagination depth. */
export function setParam(
  params: URLSearchParams,
  key: string,
  value: string | null
): string {
  const next = new URLSearchParams(params);
  if (value === null || value === "") next.delete(key);
  else next.set(key, value);
  next.delete("show");
  return next.toString();
}
