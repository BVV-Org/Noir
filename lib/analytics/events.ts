/**
 * Typed analytics event catalog.
 *
 * A single source of truth for event names so tracking stays consistent across
 * client and server. This is a documented extension seam (TDD §17): the same
 * commerce events (view, add-to-cart, collect) become V2 XP/achievement
 * triggers without changing call sites. V1 defines the vocabulary; the
 * transport (PostHog / GA) is wired when analytics is implemented.
 */
export const ANALYTICS_EVENTS = {
  pageView: "page_view",
  productViewed: "product_viewed",
  collectionViewed: "collection_viewed",
  searchPerformed: "search_performed",
  filtersApplied: "filters_applied",
  addToCart: "add_to_cart",
  removeFromCart: "remove_from_cart",
  cartViewed: "cart_viewed",
  checkoutStarted: "checkout_started",
  wishlistAdded: "wishlist_added",
  wishlistRemoved: "wishlist_removed",
  newsletterSubscribed: "newsletter_subscribed",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;
