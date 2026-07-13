import type { Product } from "@/types";
import { RARITIES, RARITY_LABELS } from "@/lib/config/site";
import { FACET_LABELS, type FacetKey } from "./search-params";

/**
 * Facet extraction.
 *
 * Derived from the whole catalogue rather than the filtered result, so options
 * never vanish as you narrow — a sidebar that removes the checkbox you are
 * about to untick is unusable. Counts are catalogue-wide for the same reason.
 *
 * Extension point: the live Storefront API returns `filters` alongside a
 * product query, already counted and pre-bucketed. When `shopifyProvider` lands,
 * this module is replaced by that response — the `FacetGroup` shape stays, so
 * the sidebar does not change.
 */
export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface FacetGroup {
  key: FacetKey;
  label: string;
  options: FacetOption[];
}

/** Notes are long-tailed; showing 60 checkboxes helps nobody. */
const MAX_NOTE_OPTIONS = 12;

const tally = (values: string[]): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
};

const toOptions = (
  counts: Map<string, number>,
  limit?: number
): FacetOption[] => {
  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ value, label: value, count }));

  const capped = limit ? sorted.slice(0, limit) : sorted;
  // Alphabetical for scanning, once the long tail has been cut by frequency.
  return capped.sort((a, b) => a.label.localeCompare(b.label));
};

export function buildFacets(products: Product[]): FacetGroup[] {
  const brands = tally(
    products.map((p) => p.brand).filter((b): b is string => Boolean(b))
  );
  const notes = tally(
    products.flatMap((p) => [...p.notes.top, ...p.notes.heart, ...p.notes.base])
  );
  const seasons = tally(products.flatMap((p) => p.classification.season ?? []));
  const moods = tally(products.flatMap((p) => p.classification.mood ?? []));
  const classes = tally(
    products
      .map((p) => p.classification.class)
      .filter((c): c is string => Boolean(c))
  );
  const dna = tally(
    products
      .map((p) => p.classification.dna)
      .filter((d): d is string => Boolean(d))
  );

  // Rarity is ordered by tier, never alphabetically — the progression is the
  // point, and "Common, Epic, Legendary, Mythic, Rare" destroys it.
  const rarityCounts = tally(
    products
      .map((p) => p.classification.rarity)
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
  );
  const rarityOptions: FacetOption[] = RARITIES.filter((r) =>
    rarityCounts.has(r)
  ).map((r) => ({
    value: r,
    label: RARITY_LABELS[r],
    count: rarityCounts.get(r) ?? 0,
  }));

  const groups: FacetGroup[] = [
    { key: "rarity", label: FACET_LABELS.rarity, options: rarityOptions },
    { key: "brand", label: FACET_LABELS.brand, options: toOptions(brands) },
    { key: "season", label: FACET_LABELS.season, options: toOptions(seasons) },
    { key: "mood", label: FACET_LABELS.mood, options: toOptions(moods) },
    {
      key: "note",
      label: FACET_LABELS.note,
      options: toOptions(notes, MAX_NOTE_OPTIONS),
    },
    { key: "class", label: FACET_LABELS.class, options: toOptions(classes) },
    { key: "dna", label: FACET_LABELS.dna, options: toOptions(dna) },
  ];

  return groups.filter((g) => g.options.length > 0);
}

/** Rounded outward to whole units so the bounds never exclude an edge product. */
export function priceBounds(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 0 };
  const amounts = products.map((p) => Number.parseFloat(p.price.amount));
  return {
    min: Math.floor(Math.min(...amounts)),
    max: Math.ceil(Math.max(...amounts)),
  };
}
