import type { KBIndex } from "@/lib/dupes/loader";
import type { ResolvedResult } from "@/lib/dupes/ranker";
import type {
  CloneCardVM,
  DupeResultVM,
  KBCloneRelationship,
  KBPerformance,
  KBPrice,
  PerformanceAxisVM,
  PerformanceDirection,
  PriceComparisonVM,
} from "@/types/dupes";

/**
 * formatter — pure transforms from KB records to UI view models.
 *
 * All display strings, savings math, confidence wording, and the bottle-art
 * gradient are derived here so components stay presentational. Everything is a
 * function of the data: no per-fragrance styling or copy is hardcoded.
 */

export function formatUSD(value: number | null | undefined): string | null {
  if (value == null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function confidenceLabel(confidence: number): string {
  if (confidence >= 93) return "Near-identical match";
  if (confidence >= 88) return "Very strong match";
  if (confidence >= 84) return "Strong match";
  if (confidence >= 80) return "Solid match";
  return "Moderate match";
}

function perfDirection(raw: string | undefined): PerformanceDirection {
  if (!raw) return "unknown";
  const s = raw.toLowerCase();
  if (/(strong|long|better|more|higher|beast|out)/.test(s)) return "stronger";
  if (/(weak|short|less|lower|worse)/.test(s)) return "weaker";
  if (/(similar|compar|same|equal|match|par)/.test(s)) return "similar";
  return "unknown";
}

function perfAxis(label: string, raw: string | undefined): PerformanceAxisVM {
  return { label, direction: perfDirection(raw), raw: raw ?? null };
}

function buildPerformance(perf: KBPerformance): PerformanceAxisVM[] {
  return [
    perfAxis("Longevity", perf.longevityComparison),
    perfAxis("Projection", perf.projectionComparison),
    perfAxis("Sillage", perf.sillageComparison),
  ];
}

function buildPrice(price: KBPrice): PriceComparisonVM {
  const originalUSD = price.originalApproxUSD ?? null;
  const cloneUSD = price.cloneApproxUSD ?? null;
  const savingsUSD =
    originalUSD != null && cloneUSD != null
      ? Math.max(0, originalUSD - cloneUSD)
      : null;
  const savingsPct =
    originalUSD != null && cloneUSD != null && originalUSD > 0
      ? Math.round((savingsUSD! / originalUSD) * 100)
      : null;
  return {
    originalUSD,
    cloneUSD,
    savingsUSD,
    savingsPct,
    originalDisplay: formatUSD(originalUSD),
    cloneDisplay: formatUSD(cloneUSD),
    savingsDisplay: formatUSD(savingsUSD),
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
  rank: number
): CloneCardVM | null {
  const clone = index.fragranceById.get(rel.cloneFragranceId);
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
    performance: buildPerformance(rel.performance),
    price: buildPrice(rel.price),
    sources: rel.sources,
    verified: rel.verified,
    swatch: swatchFor(clone.id),
  };
}

export function buildDupeResult(
  index: KBIndex,
  resolved: ResolvedResult
): DupeResultVM {
  const clones = resolved.relationships
    .map((rel, i) => buildCloneCard(index, rel, i + 1))
    .filter((c): c is CloneCardVM => c !== null);

  return {
    original: resolved.original,
    searched: resolved.searched,
    searchedRole: resolved.searchedRole,
    clones,
  };
}
