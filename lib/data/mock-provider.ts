import type { DataProvider } from "./provider";
import type {
  Product,
  Paginated,
  Collection,
  Kit,
  JournalArticle,
  HomepageSection,
  Cart,
} from "@/types";

/**
 * Mock data provider — the zero-config default (runs when Shopify credentials
 * are absent). It guarantees "mock parity": identical normalized shapes to the
 * live provider, so the UI cannot break when providers swap.
 *
 * Foundation milestone: the structure and empty-state behavior are in place and
 * production-safe (no throws). The hand-authored fixtures (~12 fragrances, 4
 * collections, 3 kits, 4 articles, homepage sections) and in-memory
 * pagination/filter/sort/search are populated in Milestone 2
 * (`lib/mock/data/*`). Until then every read returns an empty result.
 */

const emptyPage = <T>(): Paginated<T> => ({
  items: [],
  pageInfo: { hasNextPage: false, endCursor: null },
});

const emptyCart = (id = "mock-cart"): Cart => ({
  id,
  checkoutUrl: "#",
  totalQuantity: 0,
  lines: [],
  cost: {
    subtotal: { amount: "0.00", currencyCode: "USD" },
    total: { amount: "0.00", currencyCode: "USD" },
  },
});

export const mockProvider: DataProvider = {
  // Content
  async getHomepageSections(): Promise<HomepageSection[]> {
    return [];
  },
  async getProducts(): Promise<Paginated<Product>> {
    return emptyPage<Product>();
  },
  async getProductByHandle(): Promise<Product | null> {
    return null;
  },
  async getAllProductHandles(): Promise<string[]> {
    return [];
  },
  async searchProducts(): Promise<Paginated<Product>> {
    return emptyPage<Product>();
  },
  async getCollections(): Promise<Collection[]> {
    return [];
  },
  async getCollectionByHandle(): Promise<Collection | null> {
    return null;
  },
  async getDiscoveryKits(): Promise<Kit[]> {
    return [];
  },
  async getDiscoveryKitByHandle(): Promise<Kit | null> {
    return null;
  },
  async getJournalArticles(): Promise<JournalArticle[]> {
    return [];
  },
  async getJournalArticleByHandle(): Promise<JournalArticle | null> {
    return null;
  },

  // Cart
  async createCart(): Promise<Cart> {
    return emptyCart();
  },
  async getCart(cartId: string): Promise<Cart | null> {
    return emptyCart(cartId);
  },
  async addToCart(cartId: string): Promise<Cart> {
    return emptyCart(cartId);
  },
  async updateCart(cartId: string): Promise<Cart> {
    return emptyCart(cartId);
  },
  async removeFromCart(cartId: string): Promise<Cart> {
    return emptyCart(cartId);
  },
};
