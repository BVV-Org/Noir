import "server-only";
import type { KBIndex } from "@/lib/dupes/loader";
import type { SearchSuggestion } from "@/types/dupes";

/**
 * search — a fast, in-memory typeahead index over the KB.
 *
 * Built once per KB load. Every fragrance is indexed by its own name, its brand
 * name, and its brand's aliases, so a query can hit a fragrance by name, brand,
 * an alias (e.g. "MFK"), or any partial substring. Ranking prefers exact →
 * prefix → substring, then fragrances that actually have dupes, then shorter
 * names (the more "canonical" hit).
 */
interface IndexEntry {
  fragranceId: string;
  name: string;
  brand: string;
  /** All lowercased haystacks that should match this fragrance. */
  terms: { text: string; kind: SearchSuggestion["matchedOn"] }[];
}

export interface SearchIndex {
  entries: IndexEntry[];
  suggest: (query: string, limit?: number) => SearchSuggestion[];
}

const norm = (s: string) => s.toLowerCase().trim();

export function buildSearchIndex(index: KBIndex): SearchIndex {
  const { kb, brandById, fragranceIdsWithDupes } = index;

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
    return { fragranceId: f.id, name: f.name, brand: f.brand, terms };
  });

  const suggest = (query: string, limit = 8): SearchSuggestion[] => {
    const q = norm(query);
    if (!q) return [];

    type Scored = { entry: IndexEntry; score: number; matchedOn: SearchSuggestion["matchedOn"] };
    const scored: Scored[] = [];

    for (const entry of entries) {
      let best = -1;
      let matchedOn: SearchSuggestion["matchedOn"] = "name";
      for (const term of entry.terms) {
        let s = -1;
        if (term.text === q) s = 100;
        else if (term.text.startsWith(q)) s = 80;
        else if (term.text.includes(q)) s = 55;
        // Token-prefix: any word in the term starting with the query.
        else if (term.text.split(/\s+/).some((w) => w.startsWith(q))) s = 65;
        if (s > best) {
          best = s;
          matchedOn = term.kind;
        }
      }
      if (best >= 0) scored.push({ entry, score: best, matchedOn });
    }

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aDupes = fragranceIdsWithDupes.has(a.entry.fragranceId) ? 1 : 0;
      const bDupes = fragranceIdsWithDupes.has(b.entry.fragranceId) ? 1 : 0;
      if (aDupes !== bDupes) return bDupes - aDupes;
      return a.entry.name.length - b.entry.name.length;
    });

    return scored.slice(0, limit).map(({ entry, matchedOn }) => {
      const frag = index.fragranceById.get(entry.fragranceId)!;
      const brand = brandById.get(frag.brandId);
      return {
        fragranceId: frag.id,
        name: frag.name,
        brand: frag.brand,
        brandKind: brand?.kind ?? "original",
        fragranceKind: frag.kind,
        hasDupes: fragranceIdsWithDupes.has(frag.id),
        matchedOn,
      };
    });
  };

  return { entries, suggest };
}

// Memoise the built index per KBIndex instance so repeated requests within one
// KB load don't rebuild it.
const indexCache = new WeakMap<KBIndex, SearchIndex>();

export function getSearchIndex(index: KBIndex): SearchIndex {
  let built = indexCache.get(index);
  if (!built) {
    built = buildSearchIndex(index);
    indexCache.set(index, built);
  }
  return built;
}
