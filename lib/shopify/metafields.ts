/**
 * The `nv` metafield registry (TDD §7).
 *
 * The Storefront API returns metafields only when you ask for them by
 * identifier, so this list is the single source of truth for *what exists*.
 * Queries build their `identifiers:` argument from it, and `normalize.ts` reads
 * the response back by key. Adding a metafield in Shopify Admin means adding one
 * line here — nowhere else.
 *
 * Keeping it as one array also guarantees product queries and the kit query ask
 * for exactly the same fields, which is what makes a kit renderable as a
 * product.
 */
export const NV_NAMESPACE = "nv";

/** Basic identity. */
const BASIC = ["brand", "release_year", "tagline"] as const;

/**
 * Performance & scent profile — `number_integer`, 0–100.
 * V1 surfaces the first seven; the rest are stored for the DNA radar (TDD §7).
 */
const PERFORMANCE = [
  "longevity",
  "projection",
  "sillage",
  "freshness",
  "sweetness",
  "citrus",
  "spice",
  "smokiness",
  "creaminess",
  "green",
  "aquatic",
  "floral",
  "woody",
  "musk",
  "vanilla",
  "masculinity",
  "femininity",
  "versatility",
  "compliment_factor",
  "uniqueness",
] as const;

const CLASSIFICATION = [
  "fragrance_family",
  "season",
  "occasion",
  "class",
  "dna",
  "mood",
  "vibe",
  "rarity",
] as const;

const NOTES = ["top_notes", "heart_notes", "base_notes"] as const;

/** Reference lists — resolved through `references`, never as raw text. */
const RELATIONSHIPS = ["similar_fragrances", "related_products"] as const;

const FLAGS = [
  "featured",
  "new_arrival",
  "best_seller",
  "editors_pick",
  "limited_drop",
  "staff_favorite",
] as const;

/** Optional media. Both degrade gracefully when unset. */
const MEDIA = ["hero_video", "rotation_360"] as const;

/** Discovery kits are Products carrying these two (TDD §6.5). */
const KIT = ["is_kit", "kit_products"] as const;

const SEARCH = ["search_tags"] as const;

export const PRODUCT_METAFIELD_KEYS = [
  ...BASIC,
  ...PERFORMANCE,
  ...CLASSIFICATION,
  ...NOTES,
  ...RELATIONSHIPS,
  ...FLAGS,
  ...MEDIA,
  ...KIT,
  ...SEARCH,
] as const;

export type ProductMetafieldKey = (typeof PRODUCT_METAFIELD_KEYS)[number];

/** Editorial fields hung off a Collection. */
export const COLLECTION_METAFIELD_KEYS = ["tagline", "theme"] as const;

/**
 * Render an identifier list for a GraphQL `metafields(identifiers: …)` argument.
 * Inlined into the query text rather than passed as a variable so the query
 * string stays a compile-time constant and Shopify can cache its parse.
 */
export function metafieldIdentifiers(
  keys: readonly string[],
  namespace = NV_NAMESPACE
): string {
  return keys
    .map((key) => `{namespace: "${namespace}", key: "${key}"}`)
    .join(", ");
}

/**
 * Discovery kits must carry this product tag.
 *
 * The Storefront `products(query:)` search syntax cannot filter on metafields,
 * only on native fields and tags. So `nv.is_kit` remains the semantic flag, and
 * this tag is what makes kits *findable* — and, just as importantly, what lets
 * the main catalogue exclude them. Tag every kit product `discovery-kit`.
 */
export const KIT_TAG = "discovery-kit";
