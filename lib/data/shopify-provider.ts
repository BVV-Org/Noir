import "server-only";
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
  CACHE_TAGS,
  DEFAULT_REVALIDATE,
  PRODUCTS_PER_PAGE,
} from "@/lib/constants";
import { shopifyFetch } from "@/lib/shopify/client";
import {
  buildProductQuery,
  mapCollectionSortKey,
  mapSortKey,
} from "@/lib/shopify/search-query";
import {
  flatten,
  isKit,
  normalizeCollection,
  normalizeHomepageSection,
  normalizeJournalArticle,
  normalizeKit,
  normalizeProduct,
} from "@/lib/shopify/normalize";
import {
  GET_ALL_PRODUCT_HANDLES_QUERY,
  GET_PRODUCTS_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
  SEARCH_PRODUCTS_QUERY,
} from "@/lib/shopify/queries/product";
import {
  GET_COLLECTIONS_QUERY,
  GET_COLLECTION_BY_HANDLE_QUERY,
} from "@/lib/shopify/queries/collection";
import {
  GET_KITS_QUERY,
  GET_KIT_BY_HANDLE_QUERY,
} from "@/lib/shopify/queries/kit";
import {
  GET_JOURNAL_ARTICLES_QUERY,
  GET_JOURNAL_ARTICLE_BY_HANDLE_QUERY,
} from "@/lib/shopify/queries/journal";
import { GET_HOMEPAGE_SECTIONS_QUERY } from "@/lib/shopify/queries/homepage";
import * as cartApi from "@/lib/shopify/cart";
import type {
  CollectionResponse,
  CollectionsResponse,
  MetaobjectResponse,
  MetaobjectsResponse,
  ProductHandlesResponse,
  ProductResponse,
  ProductsResponse,
} from "@/lib/shopify/raw-types";

/**
 * The live Shopify data provider.
 *
 * Satisfies the same `DataProvider` contract as the mock, returning identical
 * normalized types (TDD §6). Pages import neither — they call `getProvider()`.
 *
 * ## Caching
 *
 * Content reads are cached with a long `revalidate` and tagged per entity, so a
 * Shopify webhook hitting `/api/revalidate` can invalidate just the products, or
 * just the journal, without a rebuild. Cart operations are never cached; they
 * live in `lib/shopify/cart.ts`, which forces `no-store`.
 */

const contentCache = (tag: string) => ({
  revalidate: DEFAULT_REVALIDATE,
  tags: [tag],
});

/** Shopify caps `first` at 250 on every connection. */
const clampFirst = (first: number | undefined): number =>
  Math.min(Math.max(first ?? PRODUCTS_PER_PAGE, 1), 250);

// --- Products -------------------------------------------------------------

async function getProducts(
  opts: ProductQuery = {}
): Promise<Paginated<Product>> {
  const { sortKey, reverse } = mapSortKey(opts.sort, false);

  const data = await shopifyFetch<ProductsResponse>({
    query: GET_PRODUCTS_QUERY,
    variables: {
      first: clampFirst(opts.first),
      after: opts.cursor ?? null,
      query: buildProductQuery({ filters: opts.filters, kits: "exclude" }),
      sortKey,
      reverse,
    },
    ...contentCache(CACHE_TAGS.products),
  });

  return {
    items: flatten(data.products).map(normalizeProduct),
    pageInfo: data.products.pageInfo,
  };
}

async function getProductByHandle(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<ProductResponse, { handle: string }>({
    query: GET_PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    ...contentCache(CACHE_TAGS.products),
  });
  return data.product ? normalizeProduct(data.product) : null;
}

/**
 * Every product handle, walked page by page.
 *
 * `generateStaticParams` needs the whole catalogue, and Shopify will not return
 * more than 250 nodes per request. The loop is bounded so a pagination bug in
 * the API cannot hang a build forever.
 */
async function getAllProductHandles(): Promise<string[]> {
  const handles: string[] = [];
  let after: string | null = null;
  const MAX_PAGES = 40; // 10,000 products; a hard stop, not an expectation.

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const data: ProductHandlesResponse =
      await shopifyFetch<ProductHandlesResponse>({
        query: GET_ALL_PRODUCT_HANDLES_QUERY,
        variables: {
          first: 250,
          after,
          query: buildProductQuery({ kits: "exclude" }),
        },
        ...contentCache(CACHE_TAGS.products),
      });

    handles.push(...flatten(data.products).map((node) => node.handle));

    if (!data.products.pageInfo.hasNextPage) break;
    after = data.products.pageInfo.endCursor;
    if (!after) break;
  }

  return handles;
}

async function searchProducts(
  query: string,
  filters?: Filters
): Promise<Paginated<Product>> {
  const { sortKey, reverse } = mapSortKey("relevance", true);

  const data = await shopifyFetch<ProductsResponse>({
    query: SEARCH_PRODUCTS_QUERY,
    variables: {
      first: PRODUCTS_PER_PAGE,
      after: null,
      query: buildProductQuery({ search: query, filters, kits: "exclude" }),
      sortKey,
      reverse,
    },
    ...contentCache(CACHE_TAGS.products),
  });

  return {
    items: flatten(data.products).map(normalizeProduct),
    pageInfo: data.products.pageInfo,
  };
}

// --- Collections ----------------------------------------------------------

async function getCollections(): Promise<Collection[]> {
  const data = await shopifyFetch<CollectionsResponse>({
    query: GET_COLLECTIONS_QUERY,
    variables: { first: 50 },
    ...contentCache(CACHE_TAGS.collections),
  });
  return flatten(data.collections).map(normalizeCollection);
}

async function getCollectionByHandle(
  handle: string,
  opts: ProductQuery = {}
): Promise<Collection | null> {
  const { sortKey, reverse } = mapCollectionSortKey(opts.sort);

  const data = await shopifyFetch<CollectionResponse>({
    query: GET_COLLECTION_BY_HANDLE_QUERY,
    variables: {
      handle,
      first: clampFirst(opts.first ?? 100),
      after: opts.cursor ?? null,
      sortKey,
      reverse,
    },
    ...contentCache(CACHE_TAGS.collections),
  });

  return data.collection ? normalizeCollection(data.collection) : null;
}

// --- Discovery kits -------------------------------------------------------

/**
 * Kits are Products tagged `discovery-kit` (see `metafields.ts`). The tag makes
 * them findable; `nv.is_kit` confirms it. A product carrying the tag but not the
 * flag is a tagging mistake and is dropped rather than rendered as a kit.
 */
async function getDiscoveryKits(): Promise<Kit[]> {
  const data = await shopifyFetch<ProductsResponse>({
    query: GET_KITS_QUERY,
    variables: {
      first: 50,
      query: buildProductQuery({ kits: "only" }),
    },
    ...contentCache(CACHE_TAGS.kits),
  });

  return flatten(data.products).filter(isKit).map(normalizeKit);
}

async function getDiscoveryKitByHandle(handle: string): Promise<Kit | null> {
  const data = await shopifyFetch<ProductResponse, { handle: string }>({
    query: GET_KIT_BY_HANDLE_QUERY,
    variables: { handle },
    ...contentCache(CACHE_TAGS.kits),
  });

  if (!data.product || !isKit(data.product)) return null;

  const kit = normalizeKit(data.product);

  // `nv.kit_products` resolves to handles; GraphQL cannot recurse a product
  // fragment into itself, so the contents are fetched alongside. Unresolvable
  // handles are dropped, never faked.
  const contents = await Promise.all(
    kit.productHandles.map((productHandle) => getProductByHandle(productHandle))
  );

  return {
    ...kit,
    products: contents.filter((product): product is Product =>
      Boolean(product)
    ),
  };
}

// --- Journal --------------------------------------------------------------

async function getJournalArticles(): Promise<JournalArticle[]> {
  const data = await shopifyFetch<MetaobjectsResponse>({
    query: GET_JOURNAL_ARTICLES_QUERY,
    variables: { first: 100, after: null },
    ...contentCache(CACHE_TAGS.journal),
  });

  return flatten(data.metaobjects)
    .map(normalizeJournalArticle)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

async function getJournalArticleByHandle(
  handle: string
): Promise<JournalArticle | null> {
  const data = await shopifyFetch<MetaobjectResponse, { handle: string }>({
    query: GET_JOURNAL_ARTICLE_BY_HANDLE_QUERY,
    variables: { handle },
    ...contentCache(CACHE_TAGS.journal),
  });

  return data.metaobject ? normalizeJournalArticle(data.metaobject) : null;
}

// --- Homepage -------------------------------------------------------------

async function getHomepageSections(): Promise<HomepageSection[]> {
  const data = await shopifyFetch<MetaobjectsResponse>({
    query: GET_HOMEPAGE_SECTIONS_QUERY,
    variables: { first: 50 },
    ...contentCache(CACHE_TAGS.homepage),
  });

  // Shopify returns metaobjects unordered and cannot filter on a field value,
  // so ordering and the `enabled` gate happen here — exactly as in the mock.
  return flatten(data.metaobjects)
    .map(normalizeHomepageSection)
    .filter((section): section is HomepageSection => section !== null)
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);
}

// --- Cart -----------------------------------------------------------------

const createCart = (): Promise<Cart> => cartApi.createCart();
const getCart = (cartId: string): Promise<Cart | null> =>
  cartApi.getCart(cartId);
const addToCart = (cartId: string, lines: CartLineInput[]): Promise<Cart> =>
  cartApi.addToCart(cartId, lines);
const updateCart = (
  cartId: string,
  lines: CartLineUpdateInput[]
): Promise<Cart> => cartApi.updateCart(cartId, lines);
const removeFromCart = (cartId: string, lineIds: string[]): Promise<Cart> =>
  cartApi.removeFromCart(cartId, lineIds);

export const shopifyProvider: DataProvider = {
  getHomepageSections,
  getProducts,
  getProductByHandle,
  getAllProductHandles,
  searchProducts,
  getCollections,
  getCollectionByHandle,
  getDiscoveryKits,
  getDiscoveryKitByHandle,
  getJournalArticles,
  getJournalArticleByHandle,
  createCart,
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
};
