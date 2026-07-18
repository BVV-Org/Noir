import type { KBIndex } from "@/lib/dupes/loader";
import type { ResolvedResult } from "@/lib/dupes/ranker";
import type {
  CloneCardVM,
  DupeResultVM,
  KBCloneRelationship,
  PerformanceAxisVM,
  PriceComparisonVM,
} from "@/types/dupes";

/**
 * formatter — pure transforms from KB records to UI view models.
 *
 * All display wording and the bottle-art gradient are derived here so components
 * stay presentational. Everything is a function of the KB record; nothing is
 * hand-authored per fragrance.
 *
 * The current KB export carries no price and no per-axis performance comparison,
 * so those view-model fields come back empty and the card hides those blocks.
 * The moment the KB ships them, they render with no further change.
 */

export function formatINR(value: number | null | undefined): string | null {
  if (value == null) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function confidenceLabel(confidence: number): string {
  if (confidence >= 93) return "Near-identical match";
  if (confidence >= 88) return "Very strong match";
  if (confidence >= 84) return "Strong match";
  if (confidence >= 80) return "Solid match";
  if (confidence >= 60) return "Moderate match";
  return "Loose match";
}

/** Present when the KB ever ships per-axis performance; empty for now. */
function buildPerformance(): PerformanceAxisVM[] {
  return [];
}

/** Present when the KB ever ships price; empty for now. */
function buildPrice(): PriceComparisonVM {
  return {
    originalINR: null,
    cloneINR: null,
    savingsINR: null,
    savingsPct: null,
    originalDisplay: null,
    cloneDisplay: null,
    savingsDisplay: null,
  };
}

/** Deterministic gradient from a fragrance id — the KB carries no imagery. */
export function swatchFor(id: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  return [`hsl(${hue} 34% 24%)`, `hsl(${(hue + 24) % 360} 40% 7%)`];
}

export function buildCloneCard(
  index: KBIndex,
  rel: KBCloneRelationship,
  /** The searched fragrance — the card shows the fragrance on the far side. */
  anchorId: string,
  rank: number
): CloneCardVM | null {
  // The card shows the *other* side of the edge from the anchor.
  const displayId =
    rel.cloneFragranceId === anchorId
      ? rel.originalFragranceId
      : rel.cloneFragranceId;
  const clone = index.fragranceById.get(displayId);
  if (!clone) return null;
  return {
    relationshipId: rel.id,
    rank,
    clone,
    confidence: rel.confidence,
    confidenceLabel: confidenceLabel(rel.confidence),
    match: rel.match,
    category: rel.category,
    whyItMatches: rel.whyItMatches,
    differences: rel.differences,
    performance: buildPerformance(),
    price: buildPrice(),
    verified: rel.verified,
    swatch: swatchFor(clone.id),
  };
}

export function buildDupeResult(
  index: KBIndex,
  resolved: ResolvedResult
): DupeResultVM {
  const clones = resolved.relationships
    .map((rel, i) => buildCloneCard(index, rel, resolved.searched.id, i + 1))
    .filter((c): c is CloneCardVM => c !== null);

  return {
    original: resolved.original,
    searched: resolved.searched,
    searchedRole: resolved.searchedRole,
    clones,
  };
}
