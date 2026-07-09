import type { DataProvider } from "./provider";

/**
 * Live Shopify data provider.
 *
 * Architecture is wired here; the GraphQL queries/mutations, fragments, and
 * normalizers (`lib/shopify/*`) that back each method are implemented in
 * Milestone 6 (per the TDD build sequence). Each method composes
 * `shopifyFetch<T>()` → `normalize()` → domain type.
 *
 * This provider is only selected when live credentials are present; the default
 * foundation runs entirely on `mockProvider`. Calling an unimplemented method
 * fails loudly rather than returning misleading data.
 */
function notImplemented(method: string): never {
  throw new Error(
    `shopifyProvider.${method}() is not implemented yet. ` +
      `Live Shopify integration lands in a later milestone; run on the mock ` +
      `provider by leaving SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_ACCESS_TOKEN blank.`
  );
}

export const shopifyProvider: DataProvider = {
  getHomepageSections: () => notImplemented("getHomepageSections"),
  getProducts: () => notImplemented("getProducts"),
  getProductByHandle: () => notImplemented("getProductByHandle"),
  getAllProductHandles: () => notImplemented("getAllProductHandles"),
  searchProducts: () => notImplemented("searchProducts"),
  getCollections: () => notImplemented("getCollections"),
  getCollectionByHandle: () => notImplemented("getCollectionByHandle"),
  getDiscoveryKits: () => notImplemented("getDiscoveryKits"),
  getDiscoveryKitByHandle: () => notImplemented("getDiscoveryKitByHandle"),
  getJournalArticles: () => notImplemented("getJournalArticles"),
  getJournalArticleByHandle: () => notImplemented("getJournalArticleByHandle"),
  createCart: () => notImplemented("createCart"),
  getCart: () => notImplemented("getCart"),
  addToCart: () => notImplemented("addToCart"),
  updateCart: () => notImplemented("updateCart"),
  removeFromCart: () => notImplemented("removeFromCart"),
};
