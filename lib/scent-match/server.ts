import "server-only";
import { getProvider } from "@/lib/data";
import type { Collection, Product } from "@/types";

/**
 * server — the catalogue Scent Match is allowed to recommend from.
 *
 * Read through the data provider, so it is the live Shopify catalogue wherever
 * the store is configured. Only products that are listed in the shop AND in
 * stock are returned: the quiz recommends what we are selling, never a sold-out
 * bottle and never a fragrance that only exists in a reference dataset.
 * (`getProducts` already excludes discovery kits.)
 */

/** Storefront pages cap at 250; this is a ceiling, not an expected size. */
const MAX_PRODUCTS = 500;
const PAGE_SIZE = 100;

async function getListedProducts(): Promise<Product[]> {
  const provider = getProvider();
  const all: Product[] = [];
  let cursor: string | undefined;

  while (all.length < MAX_PRODUCTS) {
    const page = await provider.getProducts({ first: PAGE_SIZE, cursor });
    all.push(...page.items);
    if (!page.pageInfo.hasNextPage || !page.pageInfo.endCursor) break;
    cursor = page.pageInfo.endCursor;
  }
  return all;
}

export async function getSellableProducts(): Promise<Product[]> {
  return (await getListedProducts()).filter((p) => p.availableForSale);
}

/** Every collection with its members, for choosing which one to point to. */
export async function getCollectionsWithMembers(): Promise<Collection[]> {
  const provider = getProvider();
  const collections = await provider.getCollections();
  const full = await Promise.all(
    collections.map((c) =>
      provider.getCollectionByHandle(c.handle, { first: 100 })
    )
  );
  return full.filter((c): c is Collection => c !== null);
}
