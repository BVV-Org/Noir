/**
 * App-wide constants. Values that are structural (not commerce data — which
 * always comes from Shopify) and shared across modules.
 */

/** Default ISR revalidation window (seconds) for content routes. */
export const DEFAULT_REVALIDATE = 60 * 60; // 1 hour; webhooks revalidate sooner

/** Cache tags for on-demand revalidation (Shopify webhook → revalidateTag). */
export const CACHE_TAGS = {
  products: "products",
  collections: "collections",
  kits: "kits",
  journal: "journal",
  homepage: "homepage",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/** Default page size for paginated product queries. */
export const PRODUCTS_PER_PAGE = 24;

/** localStorage keys for client-only V1 state (wishlist, recently viewed). */
export const STORAGE_KEYS = {
  wishlist: "nv:wishlist",
  recentlyViewed: "nv:recently-viewed",
  cartId: "nv:cart-id",
} as const;
