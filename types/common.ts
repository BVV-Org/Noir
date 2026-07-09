/**
 * Shared primitives used across every domain type. These mirror the normalized
 * shape the data provider returns — never raw Shopify (`edges`/`node`) shapes.
 */

/** Money as returned by Shopify: a decimal string + ISO currency code. */
export interface Money {
  amount: string;
  currencyCode: string;
}

/** A normalized image (Shopify CDN URL + accessibility metadata). */
export interface ShopImage {
  url: string;
  altText: string;
  width?: number;
  height?: number;
}

/** Per-entity SEO overrides sourced from Shopify. */
export interface Seo {
  title?: string;
  description?: string;
  ogImage?: string;
}

/** Cursor pagination metadata (Storefront-style). */
export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

/** A page of results plus its pagination cursor. */
export interface Paginated<T> {
  items: T[];
  pageInfo: PageInfo;
}

/** Sort options for the shop grid. */
export type ProductSortKey =
  "relevance" | "newest" | "price-asc" | "price-desc" | "best-selling";

/** Faceted filters for shop/search (mapped to tags + metafields in Shopify). */
export interface Filters {
  brands?: string[];
  notes?: string[];
  seasons?: string[];
  moods?: string[];
  classes?: string[];
  dna?: string[];
  rarities?: string[];
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}

/** Options accepted by `getProducts` / `searchProducts`. */
export interface ProductQuery {
  first?: number;
  cursor?: string;
  sort?: ProductSortKey;
  filters?: Filters;
}
