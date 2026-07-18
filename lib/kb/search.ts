import "server-only";
import type { KBIndex } from "@/lib/kb/loader";
import type { SearchSuggestion } from "@/types/relationships";

/**
 * search — the KB's typeahead surface.
 *
 * Every fragrance is indexed by its own name, "brand name", its brand, and each
 * brand alias, so a query can land via name, brand, alias, or any partial. When
 * nothing matches literally we fall back to bounded edit-distance so typos
 * ("aventis", "bacarat") still resolve.
 *
 * Retrieval only — the KB still owns every relationship judgement.
 */
interface IndexEntry {
  fragranceId: string;
  name: string;
  brand: string;
  terms: { text: string; kind: Exclude<SearchSuggestion["matchedOn"], "fuzzy"> }[];
  /** Compact haystack for fuzzy scoring. */
  fuzzyTargets: string[];
}

export interface SearchIndex {
  entries: IndexEntry[];
  suggest: (query: string, limit?: number) => SearchSuggestion[];
}

const norm = (s: string) => s.toLowerCase().trim();

/**
 * Levenshtein distance, abandoned once it exceeds `max` — we only care whether a
 * token is *close*, so there is no reason to finish an expensive far comparison.
 */
function editDistanceWithin(a: string, b: string, max: number): number | null {
  if (Math.abs(a.length - b.length) > max) return null;
  const n = b.length;
  let prev: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  let curr: number[] = new Array<number>(n + 1).fill(0);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    let rowMin = i;
    const ai = a.charAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const cost = ai === b.charAt(j - 1) ? 0 : 1;
      const del = (prev[j] ?? Number.POSITIVE_INFINITY) + 1;
      const ins = (curr[j - 1] ?? Number.POSITIVE_INFINITY) + 1;
      const sub = (prev[j - 1] ?? Number.POSITIVE_INFINITY) + cost;
      const best = Math.min(del, ins, sub);
      curr[j] = best;
      if (best < rowMin) rowMin = best;
    }
    if (rowMin > max) return null;
    const swap = prev;
    prev = curr;
    curr = swap;
  }

  const d = prev[n];
  return d != null && d <= max ? d : null;
}

/** Typo budget scales with word length: short words tolerate less. */
function budgetFor(q: string): number {
  if (q.length <= 3) return 0;
  if (q.length <= 5) return 1;
  return 2;
}

export function buildSearchIndex(index: KBIndex): SearchIndex {
  const { kb, brandById, fragranceIdsWithRelationships } = index;

  const entries: IndexEntry[] = kb.fragrances.map((f) => {
    const brand = brandById.get(f.brandId);
    const terms: IndexEntry["terms"] = [
      { text: norm(f.name), kind: "name" },
      { text: norm(`${f.brand} ${f.name}`), kind: "name" },
      { text: norm(f.brand), kind: "brand" },
    ];
    for (const alias of brand?.aliases ?? []) {
      terms.push({ text: norm(alias), kind: "alias" });
      terms.push({ text: norm(`${alias} ${f.name}`), kind: "alias" });
    }
    const fuzzyTargets = Array.from(
      new Set([
        norm(f.name),
        norm(f.brand),
        ...norm(f.name).split(/\s+/),
        ...norm(f.brand).split(/\s+/),
      ])
    ).filter((t) => t.length > 2);
    return { fragranceId: f.id, name: f.name, brand: f.brand, terms, fuzzyTargets };
  });

  const suggest = (query: string, limit = 8): SearchSuggestion[] => {
    const q = norm(query);
    if (!q) return [];

    type Scored = {
      entry: IndexEntry;
      score: number;
      matchedOn: SearchSuggestion["matchedOn"];
    };
    const scored: Scored[] = [];

    for (const entry of entries) {
      let best = -1;
      let matchedOn: SearchSuggestion["matchedOn"] = "name";

      for (const term of entry.terms) {
        let s = -1;
        if (term.text === q) s = 100;
        else if (term.text.startsWith(q)) s = 80;
        else if (term.text.split(/\s+/).some((w) => w.startsWith(q))) s = 65;
        else if (term.text.includes(q)) s = 55;
        if (s > best) {
          best = s;
          matchedOn = term.kind;
        }
      }

      // Nothing literal — is the query merely misspelled?
      if (best < 0) {
        const budget = budgetFor(q);
        if (budget > 0) {
          let bestDistance: number | null = null;
          for (const target of entry.fuzzyTargets) {
            const d = editDistanceWithin(q, target, budget);
            if (d != null && (bestDistance == null || d < bestDistance)) {
              bestDistance = d;
            }
          }
          if (bestDistance != null) {
            // Closer typos outrank looser ones, but all sort under literal hits.
            best = 40 - bestDistance * 5;
            matchedOn = "fuzzy";
          }
        }
      }

      if (best >= 0) scored.push({ entry, score: best, matchedOn });
    }

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const ar = fragranceIdsWithRelationships.has(a.entry.fragranceId) ? 1 : 0;
      const br = fragranceIdsWithRelationships.has(b.entry.fragranceId) ? 1 : 0;
      if (ar !== br) return br - ar;
      return a.entry.name.length - b.entry.name.length;
    });

    return scored.slice(0, limit).map(({ entry, matchedOn }) => {
      const frag = index.fragranceById.get(entry.fragranceId)!;
      return {
        fragranceId: frag.id,
        name: frag.name,
        brand: frag.brand,
        kind: frag.kind,
        dupeStatus: frag.dupeStatus,
        hasRelationships: fragranceIdsWithRelationships.has(frag.id),
        matchedOn,
      };
    });
  };

  return { entries, suggest };
}

const indexCache = new WeakMap<KBIndex, SearchIndex>();

export function getSearchIndex(index: KBIndex): SearchIndex {
  let built = indexCache.get(index);
  if (!built) {
    built = buildSearchIndex(index);
    indexCache.set(index, built);
  }
  return built;
}
