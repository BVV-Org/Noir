import type { Filters, Paginated, Product, ProductSortKey } from "@/types";

/**
 * In-memory query engine for the mock provider.
 *
 * The point of this file is fidelity, not cleverness: it reproduces the
 * *semantics* the Storefront API gives us (opaque cursors, `hasNextPage`,
 * AND-across-facets / OR-within-a-facet filtering) so that swapping in the live
 * provider changes no calling code. Where Shopify would do the work server-side
 * against tags and metafields, we do it over an array.
 */

const amount = (p: Product): number => Number.parseFloat(p.price.amount);

/** Every note in the pyramid, flattened — filters match against any tier. */
const allNotes = (p: Product): string[] => [
  ...p.notes.top,
  ...p.notes.heart,
  ...p.notes.base,
];

/** OR within a facet: an empty selection means "no constraint". */
const matchesAny = (
  selected: string[] | undefined,
  values: (string | undefined)[]
): boolean => {
  if (!selected?.length) return true;
  const haystack = values.filter(Boolean).map((v) => v!.toLowerCase());
  return selected.some((s) => haystack.includes(s.toLowerCase()));
};

/** AND across facets — the behaviour Shopify's faceted filtering gives. */
export function applyFilters(items: Product[], filters?: Filters): Product[] {
  if (!filters) return items;

  return items.filter((p) => {
    if (!matchesAny(filters.brands, [p.brand])) return false;
    if (!matchesAny(filters.notes, allNotes(p))) return false;
    if (!matchesAny(filters.seasons, p.classification.season ?? []))
      return false;
    if (!matchesAny(filters.moods, p.classification.mood ?? [])) return false;
    if (!matchesAny(filters.classes, [p.classification.class])) return false;
    if (!matchesAny(filters.dna, [p.classification.dna])) return false;
    if (!matchesAny(filters.rarities, [p.classification.rarity])) return false;
    if (!matchesAny(filters.tags, p.tags)) return false;

    if (filters.inStockOnly && !p.availableForSale) return false;
    if (filters.minPrice !== undefined && amount(p) < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && amount(p) > filters.maxPrice) {
      return false;
    }
    return true;
  });
}

/**
 * Sorting. `relevance` preserves catalogue order, which is what the Storefront
 * API returns when no `sortKey` is supplied.
 */
export function applySort(items: Product[], sort?: ProductSortKey): Product[] {
  const sorted = [...items];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => amount(a) - amount(b));
    case "price-desc":
      return sorted.sort((a, b) => amount(b) - amount(a));
    case "newest":
      return sorted.sort((a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0));
    case "best-selling":
      return sorted.sort((a, b) => {
        const flag =
          Number(!!b.flags.bestSeller) - Number(!!a.flags.bestSeller);
        if (flag !== 0) return flag;
        return (
          (b.performance.complimentFactor ?? 0) -
          (a.performance.complimentFactor ?? 0)
        );
      });
    case "relevance":
    default:
      return sorted;
  }
}

/**
 * Full-text search across the fields a shopper would reasonably type: the name,
 * the house, the notes, and the classification vocabulary. Results are ranked so
 * a title hit outranks a note hit, which is roughly what Shopify's search does.
 */
export function searchItems(items: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  const scored = items
    .map((p) => {
      const title = p.title.toLowerCase();
      const brand = (p.brand ?? "").toLowerCase();
      const notes = allNotes(p).join(" ").toLowerCase();
      const meta = [
        p.tagline,
        p.description,
        p.classification.fragranceFamily,
        p.classification.dna,
        ...p.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      let score = 0;
      if (title === q) score += 100;
      if (title.includes(q)) score += 50;
      if (brand.includes(q)) score += 30;
      if (notes.includes(q)) score += 15;
      if (meta.includes(q)) score += 5;
      return { p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((r) => r.p);
}

/**
 * Cursor pagination.
 *
 * Cursors are opaque base64 strings, exactly as the Storefront API treats them.
 * Nothing outside this module may decode one — the shop reads `hasNextPage` and
 * passes `endCursor` straight back, which is the only contract that survives the
 * swap to live data.
 */
const encodeCursor = (index: number): string =>
  Buffer.from(`offset:${index}`, "utf8").toString("base64");

const decodeCursor = (cursor: string): number => {
  try {
    const raw = Buffer.from(cursor, "base64").toString("utf8");
    const [, value] = raw.split(":");
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    // An unreadable cursor is treated as "start from the beginning", which is
    // gentler than throwing on a hand-edited URL.
    return 0;
  }
};

export function paginate<T>(
  items: T[],
  first = 24,
  cursor?: string
): Paginated<T> {
  const start = cursor ? decodeCursor(cursor) : 0;
  const end = start + first;
  const page = items.slice(start, end);

  return {
    items: page,
    pageInfo: {
      hasNextPage: end < items.length,
      endCursor: page.length > 0 ? encodeCursor(end) : null,
    },
  };
}
