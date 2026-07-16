import "server-only";
import type { KBIndex } from "@/lib/dupes/loader";
import type {
  FeaturedOriginal,
  KBCloneRelationship,
  KBFragrance,
} from "@/types/dupes";

/**
 * ranker — retrieval + ranking of clone relationships for a searched fragrance.
 *
 * Requirement #6/#7/#9: given a fragrance, gather every clone relationship and
 * rank them automatically. A searched *clone* resolves to its original so the
 * user still sees the full field of alternatives (its siblings), with the one
 * they searched among them.
 *
 * Ranking is deterministic: headline confidence first (the KB's provenance-
 * aggregated score), then overall match, then the cheaper clone. Nothing about
 * the ordering is hand-assigned per fragrance.
 */
export interface ResolvedResult {
  original: KBFragrance;
  searched: KBFragrance;
  searchedRole: "original" | "clone";
  relationships: KBCloneRelationship[];
}

/**
 * Featured originals for the empty state — every original that has at least one
 * clone, ordered by its strongest clone's confidence. Purely derived from the
 * KB, so it grows automatically as relationships are added.
 */
export function getFeaturedOriginals(
  index: KBIndex,
  limit = 6
): FeaturedOriginal[] {
  const featured: { frag: KBFragrance; bestConfidence: number }[] = [];
  for (const [originalId, rels] of index.relationshipsByOriginalId) {
    const frag = index.fragranceById.get(originalId);
    if (!frag) continue;
    const bestConfidence = Math.max(...rels.map((r) => r.confidence));
    featured.push({ frag, bestConfidence });
  }
  return featured
    .sort((a, b) => b.bestConfidence - a.bestConfidence)
    .slice(0, limit)
    .map(({ frag }) => ({
      fragranceId: frag.id,
      brand: frag.brand,
      name: frag.name,
    }));
}

export function rankRelationships(
  relationships: KBCloneRelationship[]
): KBCloneRelationship[] {
  return [...relationships].sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    if (b.match.overall !== a.match.overall)
      return b.match.overall - a.match.overall;
    const ap = a.price.cloneApproxINR ?? Number.POSITIVE_INFINITY;
    const bp = b.price.cloneApproxINR ?? Number.POSITIVE_INFINITY;
    return ap - bp;
  });
}

export function resolveDupes(
  index: KBIndex,
  fragranceId: string
): ResolvedResult | null {
  const searched = index.fragranceById.get(fragranceId);
  if (!searched) return null;

  // Case 1: the searched fragrance is an original with known clones.
  const asOriginal = index.relationshipsByOriginalId.get(fragranceId);
  if (asOriginal && asOriginal.length > 0) {
    return {
      original: searched,
      searched,
      searchedRole: "original",
      relationships: rankRelationships(asOriginal),
    };
  }

  // Case 2: the searched fragrance is a clone — resolve to its original and
  // return the whole sibling set so alternatives are still visible.
  const asClone = index.relationshipByCloneId.get(fragranceId);
  if (asClone) {
    const original = index.fragranceById.get(asClone.originalFragranceId);
    if (original) {
      const siblings =
        index.relationshipsByOriginalId.get(original.id) ?? [asClone];
      return {
        original,
        searched,
        searchedRole: "clone",
        relationships: rankRelationships(siblings),
      };
    }
  }

  // Case 3: known fragrance, but no relationship in the KB yet.
  return {
    original: searched,
    searched,
    searchedRole: searched.kind === "clone" ? "clone" : "original",
    relationships: [],
  };
}
