import type {
  Product,
  ProductQuery,
  Paginated,
  Collection,
  Kit,
  JournalArticle,
  HomepageSection,
  Cart,
  CartLineInput,
  CartLineUpdateInput,
  Filters,
} from "@/types";

/**
 * The data contract.
 *
 * Every read/write the storefront needs is declared here. Both the live Shopify
 * provider and the mock provider implement this interface and return identical
 * normalized domain types — so pages never know (or care) which answered.
 * Going live is an environment-variable change, not a code change (TDD §6).
 */
export interface DataProvider {
  // --- Homepage composition ---
  getHomepageSections(): Promise<HomepageSection[]>;

  // --- Products ---
  getProducts(opts?: ProductQuery): Promise<Paginated<Product>>;
  getProductByHandle(handle: string): Promise<Product | null>;
  /** All handles — for `generateStaticParams`. */
  getAllProductHandles(): Promise<string[]>;
  searchProducts(query: string, filters?: Filters): Promise<Paginated<Product>>;

  // --- Collections ---
  getCollections(): Promise<Collection[]>;
  getCollectionByHandle(
    handle: string,
    opts?: ProductQuery
  ): Promise<Collection | null>;

  // --- Discovery Kits ---
  getDiscoveryKits(): Promise<Kit[]>;
  getDiscoveryKitByHandle(handle: string): Promise<Kit | null>;

  // --- Journal ---
  getJournalArticles(): Promise<JournalArticle[]>;
  getJournalArticleByHandle(handle: string): Promise<JournalArticle | null>;

  // --- Cart (mutations) ---
  createCart(): Promise<Cart>;
  getCart(cartId: string): Promise<Cart | null>;
  addToCart(cartId: string, lines: CartLineInput[]): Promise<Cart>;
  updateCart(cartId: string, lines: CartLineUpdateInput[]): Promise<Cart>;
  removeFromCart(cartId: string, lineIds: string[]): Promise<Cart>;
}
