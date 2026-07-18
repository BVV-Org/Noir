import "server-only";
import type { KBIndex } from "@/lib/dupes/loader";
import type {
  FeaturedOriginal,
  KBCloneRelationship,
  KBFragrance,
} from "@/types/dupes";

/**
 * ranker — retrieval + ranking of the relationships a fragrance participates in.
 *
 * Given a fragrance, gather EVERY relationship that touches it — in either
 * direction and of any type (verified clone, inspired by, similar DNA, hybrid
 * DNA) — so each relationship in the KB is reachable from the fragrance's own
 * page. The card then shows the fragrance on the *other* side of the edge.
 *
 * Ranking is deterministic and read straight off the KB: headline confidence
 * first, then overall similarity. Nothing about the ordering is hand-assigned.
 */
export interface ResolvedResult {
  /** The searched fragrance — the page anchors on it. */
  original: KBFragrance;
  searched: KBFragrance;
  searchedRole: "original" | "clone";
  relationships: KBCloneRelationship[];
}

/** The fragrance a relationship card should display: the far side from `anchor`. */
export function otherSideOf(
  rel: KBCloneRelationship,
  anchorId: string
): string {
  return rel.cloneFragranceId === anchorId
    ? rel.originalFragranceId
    : rel.cloneFragranceId;
}

/**
 * Featured chips for the empty state — reference fragrances that anchor the most
 * relationships, ordered by their strongest confidence. Purely derived from the
 * KB, so the set grows as the KB does.
 */
export function getFeaturedOriginals(
  index: KBIndex,
  limit = 6
): FeaturedOriginal[] {
  const featured: { frag: KBFragrance; bestConfidence: number; count: number }[] =
    [];
  for (const [originalId, rels] of index.relationshipsByOriginalId) {
    const frag = index.fragranceById.get(originalId);
    if (!frag) continue;
    const bestConfidence = Math.max(...rels.map((r) => r.confidence));
    featured.push({ frag, bestConfidence, count: rels.length });
  }
  return featured
    .sort((a, b) => b.count - a.count || b.bestConfidence - a.bestConfidence)
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
    return b.match.overall - a.match.overall;
  });
}

export function resolveDupes(
  index: KBIndex,
  fragranceId: string
): ResolvedResult | null {
  const searched = index.fragranceById.get(fragranceId);
  if (!searched) return null;

  const touching = index.relationshipsByFragranceId.get(fragranceId) ?? [];

  // One card per related fragrance: a pair can be joined by more than one edge,
  // so keep the strongest and drop the rest to avoid duplicate cards.
  const strongestByOther = new Map<string, KBCloneRelationship>();
  for (const rel of touching) {
    const other = otherSideOf(rel, fragranceId);
    const existing = strongestByOther.get(other);
    if (!existing || rel.confidence > existing.confidence) {
      strongestByOther.set(other, rel);
    }
  }

  return {
    original: searched,
    searched,
    searchedRole: searched.kind === "clone" ? "clone" : "original",
    relationships: rankRelationships([...strongestByOther.values()]),
  };
}
