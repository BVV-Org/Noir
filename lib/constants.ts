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

/**
 * Customer Account API session cookies (Customer Account OAuth).
 *
 * All httpOnly — client JavaScript never sees an access or refresh token. They
 * are split across cookies rather than a single JSON blob so no one cookie
 * approaches the 4 KB limit (the id token is a full JWT).
 */
export const AUTH_COOKIES = {
  accessToken: "nv_ca_at",
  refreshToken: "nv_ca_rt",
  /** Access-token expiry, epoch milliseconds. */
  expiresAt: "nv_ca_exp",
  /** Retained only as the `id_token_hint` on logout. */
  idToken: "nv_ca_idt",
} as const;

/**
 * Short-lived OAuth transaction cookies, set at /api/auth/login and cleared at
 * the callback. They bind the redirect back to this browser (CSRF: `state`;
 * PKCE: `verifier`; id-token replay: `nonce`).
 */
export const OAUTH_TX_COOKIES = {
  state: "nv_oauth_state",
  verifier: "nv_oauth_verifier",
  nonce: "nv_oauth_nonce",
} as const;

/** OAuth transaction cookies live just long enough to complete a login. */
export const OAUTH_TX_MAX_AGE = 60 * 10; // 10 minutes

/** Refresh tokens are long-lived; the session cookie should outlast a browsing gap. */
export const AUTH_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
