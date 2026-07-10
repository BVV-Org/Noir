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
} as const;

/**
 * The cart id cookie.
 *
 * httpOnly — client JavaScript never reads it. The browser only ever talks to
 * `/api/cart`, which resolves the id server-side, so a stolen XSS payload cannot
 * exfiltrate a cart or replay it. The name uses underscores because a cookie
 * name is an RFC 6265 token and may not contain `:`.
 */
export const CART_COOKIE = "nv_cart_id";

/** Carts outlive a session but not forever; Shopify expires them at ~10 days. */
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;
