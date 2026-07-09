import type {
  Cart,
  CartLine,
  Classification,
  Collection,
  HomepageSection,
  HomepageSectionType,
  JournalArticle,
  JournalAuthor,
  Kit,
  Money,
  PerformanceProfile,
  Product,
  ProductFlags,
  ProductVariant,
  ShopImage,
} from "@/types";
import { RARITIES, type Rarity } from "@/lib/config/site";
import { richTextToHtml } from "./rich-text";
import type {
  Connection,
  ShopifyCart,
  ShopifyCartLine,
  ShopifyCollection,
  ShopifyImage,
  ShopifyMetafield,
  ShopifyMetafields,
  ShopifyMetaobject,
  ShopifyMetafieldReference,
  ShopifyMoney,
  ShopifyProduct,
  ShopifyVariant,
} from "./raw-types";

/**
 * Raw Storefront responses → normalized domain types.
 *
 * **Every Shopify quirk dies in this file.** The UI never sees `edges`, `node`,
 * a positional metafield array, a JSON-encoded list, or a rich-text AST. If a
 * component elsewhere in the codebase reaches for `.edges`, this module has
 * failed.
 *
 * The guiding rule is *absence over invention*: a missing metafield yields
 * `undefined`, never `0` or `""`. A bar drawn at zero says "this fragrance has
 * no longevity", which is a different and worse claim than saying nothing.
 */

// --- Primitives -----------------------------------------------------------

export const flatten = <T>(connection: Connection<T>): T[] =>
  connection.edges.map((edge) => edge.node);

const normalizeMoney = (money: ShopifyMoney): Money => ({
  amount: money.amount,
  currencyCode: money.currencyCode,
});

/**
 * `altText` is nullable in Shopify and mandatory for us. Falling back to the
 * product title is better than an empty string, which screen readers announce
 * as "image" and nothing else.
 */
const normalizeImage = (
  image: ShopifyImage,
  fallbackAlt: string
): ShopImage => ({
  url: image.url,
  altText: image.altText ?? fallbackAlt,
  width: image.width ?? undefined,
  height: image.height ?? undefined,
});

// --- Metafield decoding ---------------------------------------------------

/**
 * `metafields(identifiers:)` returns a positional array with `null` in every
 * slot the resource does not define. Index it by key once, then read by name.
 */
export type MetafieldMap = Map<string, ShopifyMetafield>;

export function indexMetafields(metafields: ShopifyMetafields): MetafieldMap {
  const map: MetafieldMap = new Map();
  for (const field of metafields) {
    if (field) map.set(field.key, field);
  }
  return map;
}

const mfString = (map: MetafieldMap, key: string): string | undefined =>
  map.get(key)?.value || undefined;

const mfInt = (map: MetafieldMap, key: string): number | undefined => {
  const raw = map.get(key)?.value;
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const mfBool = (map: MetafieldMap, key: string): boolean | undefined => {
  const raw = map.get(key)?.value;
  if (raw === undefined) return undefined;
  return raw === "true";
};

/** `list.single_line_text` arrives as a JSON array string: `["a","b"]`. */
const mfList = (map: MetafieldMap, key: string): string[] => {
  const raw = map.get(key)?.value;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is string => typeof v === "string");
    }
  } catch {
    // A single-value list is sometimes authored as a bare string.
    return [raw];
  }
  return [];
};

/** Handles from a `list.product_reference`. */
const mfRefHandles = (map: MetafieldMap, key: string): string[] =>
  map
    .get(key)
    ?.references?.nodes.flatMap((node) => (node.handle ? [node.handle] : [])) ??
  [];

/** First playable source from a `file_reference` pointing at a Video. */
const mfVideoUrl = (map: MetafieldMap, key: string): string | undefined => {
  const sources = map.get(key)?.reference?.sources;
  if (!sources?.length) return undefined;
  const mp4 = sources.find((source) => source.mimeType === "video/mp4");
  return (mp4 ?? sources[0])?.url;
};

/** Rarity is authored free-text; only the five known tiers are accepted. */
const mfRarity = (map: MetafieldMap, key: string): Rarity | undefined => {
  const raw = map.get(key)?.value?.trim().toLowerCase();
  return RARITIES.find((tier) => tier === raw);
};

// --- Product --------------------------------------------------------------

const normalizeVariant = (variant: ShopifyVariant): ProductVariant => ({
  id: variant.id,
  title: variant.title,
  price: normalizeMoney(variant.price),
  compareAtPrice: variant.compareAtPrice
    ? normalizeMoney(variant.compareAtPrice)
    : null,
  availableForSale: variant.availableForSale,
  quantityAvailable: variant.quantityAvailable ?? undefined,
  selectedOptions: variant.selectedOptions,
});

function normalizePerformance(map: MetafieldMap): PerformanceProfile {
  return {
    longevity: mfInt(map, "longevity"),
    projection: mfInt(map, "projection"),
    sillage: mfInt(map, "sillage"),
    freshness: mfInt(map, "freshness"),
    sweetness: mfInt(map, "sweetness"),
    versatility: mfInt(map, "versatility"),
    uniqueness: mfInt(map, "uniqueness"),
    complimentFactor: mfInt(map, "compliment_factor"),
    citrus: mfInt(map, "citrus"),
    spice: mfInt(map, "spice"),
    smokiness: mfInt(map, "smokiness"),
    creaminess: mfInt(map, "creaminess"),
    green: mfInt(map, "green"),
    aquatic: mfInt(map, "aquatic"),
    floral: mfInt(map, "floral"),
    woody: mfInt(map, "woody"),
    musk: mfInt(map, "musk"),
    vanilla: mfInt(map, "vanilla"),
    masculinity: mfInt(map, "masculinity"),
    femininity: mfInt(map, "femininity"),
  };
}

function normalizeClassification(map: MetafieldMap): Classification {
  return {
    fragranceFamily: mfString(map, "fragrance_family"),
    season: mfList(map, "season"),
    occasion: mfList(map, "occasion"),
    class: mfString(map, "class"),
    dna: mfString(map, "dna"),
    mood: mfList(map, "mood"),
    vibe: mfList(map, "vibe"),
    rarity: mfRarity(map, "rarity"),
  };
}

function normalizeFlags(map: MetafieldMap): ProductFlags {
  return {
    featured: mfBool(map, "featured"),
    newArrival: mfBool(map, "new_arrival"),
    bestSeller: mfBool(map, "best_seller"),
    editorsPick: mfBool(map, "editors_pick"),
    limitedDrop: mfBool(map, "limited_drop"),
    staffFavorite: mfBool(map, "staff_favorite"),
  };
}

export function normalizeProduct(product: ShopifyProduct): Product {
  const map = indexMetafields(product.metafields);

  const images = product.images.nodes.map((image) =>
    normalizeImage(image, product.title)
  );

  const price = normalizeMoney(product.priceRange.minVariantPrice);
  const compareAt = normalizeMoney(product.compareAtPriceRange.minVariantPrice);
  // Shopify reports a compare-at of "0.00" (or the price itself) when there is
  // no markdown. Only a strictly higher value is a real previous price.
  const hasMarkdown =
    Number.parseFloat(compareAt.amount) > Number.parseFloat(price.amount);

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    // `nv.brand` may be promoted to an `nv_brand` metaobject; fall back to the
    // native vendor field, which every Shopify product has.
    brand: mfString(map, "brand") ?? (product.vendor || undefined),
    releaseYear: mfInt(map, "release_year"),
    tagline: mfString(map, "tagline"),
    price,
    compareAtPrice: hasMarkdown ? compareAt : null,
    availableForSale: product.availableForSale,
    images,
    heroVideoUrl: mfVideoUrl(map, "hero_video") ?? null,
    variants: product.variants.nodes.map(normalizeVariant),
    performance: normalizePerformance(map),
    classification: normalizeClassification(map),
    notes: {
      top: mfList(map, "top_notes"),
      heart: mfList(map, "heart_notes"),
      base: mfList(map, "base_notes"),
    },
    tags: product.tags,
    flags: normalizeFlags(map),
    similarFragranceHandles: mfRefHandles(map, "similar_fragrances"),
    relatedProductHandles: mfRefHandles(map, "related_products"),
    seo: {
      title: product.seo.title ?? undefined,
      description: product.seo.description ?? undefined,
      ogImage: images[0]?.url,
    },
  };
}

/** A kit is a Product; this projects one into the `Kit` shape (TDD §6.5). */
export function normalizeKit(product: ShopifyProduct): Kit {
  const map = indexMetafields(product.metafields);
  const images = product.images.nodes.map((image) =>
    normalizeImage(image, product.title)
  );

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    tagline: mfString(map, "tagline"),
    price: normalizeMoney(product.priceRange.minVariantPrice),
    image: images[0] ?? null,
    images,
    availableForSale: product.availableForSale,
    productHandles: mfRefHandles(map, "kit_products"),
    seo: {
      title: product.seo.title ?? undefined,
      description: product.seo.description ?? undefined,
      ogImage: images[0]?.url,
    },
  };
}

export function isKit(product: ShopifyProduct): boolean {
  return indexMetafields(product.metafields).get("is_kit")?.value === "true";
}

// --- Collection -----------------------------------------------------------

export function normalizeCollection(collection: ShopifyCollection): Collection {
  const map = indexMetafields(collection.metafields);

  return {
    id: collection.id,
    handle: collection.handle,
    title: collection.title,
    description: collection.description,
    tagline: mfString(map, "tagline"),
    image: collection.image
      ? normalizeImage(collection.image, collection.title)
      : null,
    theme: mfString(map, "theme"),
    // The Storefront API exposes no cheap product count for a collection, and
    // fetching every product to call `.length` would be absurd on an index
    // page. `productCount` stays undefined; the card omits the line.
    productCount: collection.products
      ? flatten(collection.products).length
      : undefined,
    products: collection.products
      ? flatten(collection.products).map(normalizeProduct)
      : undefined,
    seo: {
      title: collection.seo.title ?? undefined,
      description: collection.seo.description ?? undefined,
      ogImage: collection.image?.url,
    },
  };
}

// --- Metaobjects ----------------------------------------------------------

type FieldMap = Map<
  string,
  {
    value: string | null;
    reference: ShopifyMetafieldReference | null;
    references: { nodes: ShopifyMetafieldReference[] } | null;
  }
>;

function indexFields(metaobject: ShopifyMetaobject): FieldMap {
  const map: FieldMap = new Map();
  for (const field of metaobject.fields) {
    map.set(field.key, {
      value: field.value,
      reference: field.reference,
      references: field.references,
    });
  }
  return map;
}

const fieldString = (map: FieldMap, key: string): string | undefined =>
  map.get(key)?.value || undefined;

const fieldInt = (map: FieldMap, key: string): number | undefined => {
  const raw = map.get(key)?.value;
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const fieldBool = (map: FieldMap, key: string): boolean =>
  map.get(key)?.value === "true";

const fieldList = (map: FieldMap, key: string): string[] => {
  const raw = map.get(key)?.value;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [raw];
  } catch {
    return [raw];
  }
};

const fieldImage = (
  map: FieldMap,
  key: string,
  fallbackAlt: string
): ShopImage | null => {
  const image = map.get(key)?.reference?.image;
  return image ? normalizeImage(image, fallbackAlt) : null;
};

const fieldRefHandles = (map: FieldMap, key: string): string[] =>
  map
    .get(key)
    ?.references?.nodes.flatMap((node) => (node.handle ? [node.handle] : [])) ??
  [];

function normalizeAuthor(
  reference: ShopifyMetafieldReference | null | undefined
): JournalAuthor | undefined {
  if (!reference?.fields) return undefined;
  const fields = new Map(reference.fields.map((f) => [f.key, f.value]));
  const name = fields.get("name");
  if (!name) return undefined;

  return {
    name,
    role: fields.get("role") ?? undefined,
    bio: fields.get("bio") ?? undefined,
    // The author's avatar is a nested file reference; the Storefront API does
    // not resolve references two levels deep in one query. Fetching it would
    // cost a round trip per author, so the card falls back to initials.
    avatar: null,
  };
}

export function normalizeJournalArticle(
  metaobject: ShopifyMetaobject
): JournalArticle {
  const map = indexFields(metaobject);
  const title = fieldString(map, "title") ?? "Untitled";

  return {
    id: metaobject.id,
    handle: fieldString(map, "handle") ?? metaobject.handle,
    title,
    excerpt: fieldString(map, "excerpt") ?? "",
    heroImage: fieldImage(map, "hero_image", title),
    author: normalizeAuthor(map.get("author")?.reference),
    readingTime: fieldInt(map, "reading_time"),
    tags: fieldList(map, "tags"),
    bodyHtml: richTextToHtml(map.get("body")?.value),
    relatedFragranceHandles: fieldRefHandles(map, "related_fragrances"),
    relatedArticleHandles: fieldRefHandles(map, "related_articles"),
    publishedAt: fieldString(map, "published_at") ?? new Date(0).toISOString(),
    seo: {
      title: fieldString(map, "seo_title"),
      description: fieldString(map, "seo_description"),
      ogImage: fieldImage(map, "og_image", title)?.url,
    },
  };
}

const SECTION_TYPES: HomepageSectionType[] = [
  "hero",
  "featured_collections",
  "best_sellers",
  "discovery_kits",
  "new_arrivals",
  "journal_preview",
  "newsletter",
  "cta",
];

/**
 * Returns `null` for a section whose `type` the code does not understand — an
 * editor inventing a type in Admin should get a missing section, not a crash.
 */
export function normalizeHomepageSection(
  metaobject: ShopifyMetaobject
): HomepageSection | null {
  const map = indexFields(metaobject);
  const rawType = fieldString(map, "type");
  const type = SECTION_TYPES.find((known) => known === rawType);
  if (!type) return null;

  const title = fieldString(map, "title");

  return {
    id: metaobject.id,
    type,
    enabled: fieldBool(map, "enabled"),
    order: fieldInt(map, "order") ?? 0,
    title,
    subtitle: fieldString(map, "subtitle"),
    collectionHandle: map.get("collection")?.reference?.handle,
    productHandles: fieldRefHandles(map, "products"),
    ctaLabel: fieldString(map, "cta_label"),
    ctaUrl: fieldString(map, "cta_url"),
    media: fieldImage(map, "media", title ?? "Noir Vault"),
  };
}

// --- Cart -----------------------------------------------------------------

function normalizeCartLine(line: ShopifyCartLine): CartLine {
  const { merchandise } = line;
  return {
    id: line.id,
    merchandiseId: merchandise.id,
    productHandle: merchandise.product.handle,
    productTitle: merchandise.product.title,
    variantTitle: merchandise.title,
    image: merchandise.image
      ? normalizeImage(merchandise.image, merchandise.product.title)
      : null,
    quantity: line.quantity,
    unitPrice: normalizeMoney(line.cost.amountPerQuantity),
    lineTotal: normalizeMoney(line.cost.totalAmount),
  };
}

export function normalizeCart(cart: ShopifyCart): Cart {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    lines: flatten(cart.lines).map(normalizeCartLine),
    cost: {
      subtotal: normalizeMoney(cart.cost.subtotalAmount),
      total: normalizeMoney(cart.cost.totalAmount),
      totalTax: cart.cost.totalTaxAmount
        ? normalizeMoney(cart.cost.totalTaxAmount)
        : null,
    },
  };
}
