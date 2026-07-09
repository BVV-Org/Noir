import type { DataProvider } from "./provider";
import type {
  Cart,
  CartLineInput,
  CartLineUpdateInput,
  Collection,
  Filters,
  HomepageSection,
  JournalArticle,
  Kit,
  Paginated,
  Product,
  ProductQuery,
} from "@/types";
import {
  collections,
  collectionTagRules,
  homepageSections,
  journalArticles,
  kits,
  products,
} from "@/lib/mock/data";
import {
  applyFilters,
  applySort,
  paginate,
  searchItems,
} from "@/lib/mock/query";
import {
  addToMockCart,
  createMockCart,
  getMockCart,
  removeFromMockCart,
  updateMockCart,
} from "@/lib/mock/cart";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";

/**
 * Mock data provider — full parity with the live Shopify provider.
 *
 * Every method returns the same normalized domain types the Storefront
 * normalizer will produce, so the storefront is completely explorable with no
 * Shopify credentials. Two rules keep the parity honest:
 *
 *   1. Nothing here leaks a mock-only shape. Cursors stay opaque, collections
 *      resolve by tag rule rather than a hand-written membership list.
 *   2. Reads are cloned before being handed out. The fixtures are module-level
 *      singletons shared across requests in a warm server process; returning
 *      them by reference would let one request mutate another's data.
 *
 * Cart mutations are in-memory and per-process. They exist so the contract is
 * satisfiable; the real cart arrives with the Storefront Cart API (TDD §9).
 */

/** Defensive copy — see rule 2 above. `structuredClone` is Node 17+. */
const clone = <T>(value: T): T => structuredClone(value);

/** Resolve a smart collection's members from its tag rule (TDD §6.5). */
function productsInCollection(handle: string): Product[] {
  const tag = collectionTagRules[handle];
  if (!tag) return [];
  return products.filter((p) =>
    p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

export const mockProvider: DataProvider = {
  // --- Homepage composition ---
  async getHomepageSections(): Promise<HomepageSection[]> {
    // Shopify returns metaobjects unordered; ordering is the consumer's job.
    return clone(homepageSections)
      .filter((s) => s.enabled)
      .sort((a, b) => a.order - b.order);
  },

  // --- Products ---
  async getProducts(opts: ProductQuery = {}): Promise<Paginated<Product>> {
    const filtered = applyFilters(products, opts.filters);
    const sorted = applySort(filtered, opts.sort);
    return clone(
      paginate(sorted, opts.first ?? PRODUCTS_PER_PAGE, opts.cursor)
    );
  },

  async getProductByHandle(handle: string): Promise<Product | null> {
    const found = products.find((p) => p.handle === handle);
    return found ? clone(found) : null;
  },

  async getAllProductHandles(): Promise<string[]> {
    return products.map((p) => p.handle);
  },

  async searchProducts(
    query: string,
    filters?: Filters
  ): Promise<Paginated<Product>> {
    const matched = searchItems(products, query);
    const filtered = applyFilters(matched, filters);
    // Search results keep their relevance order — no re-sort.
    return clone(paginate(filtered, PRODUCTS_PER_PAGE));
  },

  // --- Collections ---
  async getCollections(): Promise<Collection[]> {
    return collections.map((c) => ({
      ...clone(c),
      productCount: productsInCollection(c.handle).length,
    }));
  },

  async getCollectionByHandle(
    handle: string,
    opts: ProductQuery = {}
  ): Promise<Collection | null> {
    const collection = collections.find((c) => c.handle === handle);
    if (!collection) return null;

    const members = productsInCollection(handle);
    const filtered = applyFilters(members, opts.filters);
    const sorted = applySort(filtered, opts.sort);

    return {
      ...clone(collection),
      productCount: members.length,
      products: clone(sorted),
    };
  },

  // --- Discovery Kits ---
  async getDiscoveryKits(): Promise<Kit[]> {
    return clone(kits);
  },

  async getDiscoveryKitByHandle(handle: string): Promise<Kit | null> {
    const kit = kits.find((k) => k.handle === handle);
    if (!kit) return null;

    // `nv.kit_products` is a product-reference list; the live provider resolves
    // it in the same query. Unresolvable handles are dropped, not faked.
    const contents = kit.productHandles
      .map((h) => products.find((p) => p.handle === h))
      .filter((p): p is Product => Boolean(p));

    return { ...clone(kit), products: clone(contents) };
  },

  // --- Journal ---
  async getJournalArticles(): Promise<JournalArticle[]> {
    return clone(journalArticles).sort(
      (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
    );
  },

  async getJournalArticleByHandle(
    handle: string
  ): Promise<JournalArticle | null> {
    const found = journalArticles.find((a) => a.handle === handle);
    return found ? clone(found) : null;
  },

  // --- Cart ---
  // A working in-memory implementation of the Storefront Cart API's semantics
  // (line merging, quantity-0 removal, derived totals). See `lib/mock/cart.ts`
  // for the two limitations it is honest about: per-process storage, and no
  // checkout URL.
  async createCart(): Promise<Cart> {
    return createMockCart();
  },
  async getCart(cartId: string): Promise<Cart | null> {
    return getMockCart(cartId);
  },
  async addToCart(cartId: string, lines: CartLineInput[]): Promise<Cart> {
    return addToMockCart(cartId, lines);
  },
  async updateCart(
    cartId: string,
    lines: CartLineUpdateInput[]
  ): Promise<Cart> {
    return updateMockCart(cartId, lines);
  },
  async removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
    return removeFromMockCart(cartId, lineIds);
  },
};
