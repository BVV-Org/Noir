import "server-only";
import type { KBIndex } from "@/lib/kb/loader";
import {
  dnaTypeForStatus,
  isSymmetric,
  presentationFor,
  sectionLimitFor,
  type EdgeDirection,
} from "@/lib/kb/registry";
import type {
  DnaBadgeVM,
  FragranceImageVM,
  FragranceRelationshipsVM,
  KBFragrance,
  KBPerformanceComparison,
  KBRelationship,
  PerformanceAxisVM,
  PerformanceDirection,
  PriceComparisonVM,
  RelationshipCardVM,
  RelationshipSectionVM,
  SimilarityAxisVM,
} from "@/types/relationships";

/**
 * resolve — turns the engine's edges into the view models the page renders.
 *
 * This module ranks, groups, and formats. It does not classify relationships,
 * score similarity, or judge confidence: every one of those values is read
 * straight off the KB record. Ordering uses the engine's own
 * `overallSimilarity`, so "ranked by similarity" means the KB's ranking.
 */

export function formatINR(value: number | null | undefined): string | null {
  if (value == null) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Deterministic gradient from a fragrance id — used when no real image exists. */
export function swatchFor(id: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  return [`hsl(${hue} 34% 24%)`, `hsl(${(hue + 24) % 360} 40% 7%)`];
}

/**
 * Artwork for a fragrance. The KB ships an image table, but most entries are
 * generated placeholders — those are worse than the derived swatch, so only a
 * `ready`, non-placeholder rendition earns a real `src`.
 */
export function imageFor(
  index: KBIndex,
  fragrance: KBFragrance,
  rendition: "card" | "hero" | "thumbnail" = "card"
): FragranceImageVM {
  const asset = index.imageByFragranceId.get(fragrance.id);
  const usable =
    asset && asset.status === "ready" && !asset.isPlaceholder
      ? asset.renditions[rendition]
      : undefined;
  return {
    src: usable
      ? `/api/kb/image/${encodeURIComponent(fragrance.id)}?r=${rendition}`
      : null,
    swatch: swatchFor(fragrance.id),
    alt: `${fragrance.brand} ${fragrance.name}`,
  };
}

function perfDirection(raw: string | null | undefined): PerformanceDirection {
  if (!raw) return "unknown";
  const s = raw.toLowerCase();
  if (/(strong|long|better|more|higher|beast|out)/.test(s)) return "stronger";
  if (/(weak|short|less|lower|worse)/.test(s)) return "weaker";
  if (/(similar|compar|same|equal|match|par)/.test(s)) return "similar";
  return "unknown";
}

const POSITION: Record<PerformanceDirection, number> = {
  weaker: 0,
  similar: 50,
  stronger: 100,
  unknown: 50,
};

function perfAxis(label: string, raw: string | null | undefined): PerformanceAxisVM {
  const direction = perfDirection(raw);
  return { label, direction, raw: raw ?? null, position: POSITION[direction] };
}

/** Only the axes the engine actually worded. Order matches the spec. */
function buildPerformance(
  perf: KBPerformanceComparison | null
): PerformanceAxisVM[] {
  if (!perf) return [];
  const axes = [
    perfAxis("Projection", perf.projectionComparison),
    perfAxis("Longevity", perf.longevityComparison),
    perfAxis("Sillage", perf.sillageComparison),
  ];
  return axes.filter((a) => a.raw !== null);
}

/**
 * Price always compares the fragrance being explored against the fragrance on
 * the card — never the raw edge.
 *
 * The engine carries no price, so this is composed from the two fragrance
 * records. Reading it off the edge instead (target = "original", source =
 * "derivative") inverts on outgoing edges, where the anchor *is* the source: the
 * card would then print the anchor's own price under "this fragrance".
 *
 * The left-hand label follows the KB's direction: it only claims "Original" when
 * the anchor really is the edge's reference.
 */
function buildPrice(
  index: KBIndex,
  rel: KBRelationship,
  anchorId: string,
  otherId: string
): PriceComparisonVM {
  const anchor = index.fragranceById.get(anchorId);
  const other = index.fragranceById.get(otherId);
  const originalINR = anchor?.approxPriceINR ?? null;
  const relationshipINR = other?.approxPriceINR ?? null;
  const hasComparison = originalINR != null && relationshipINR != null;
  const savingsINR = hasComparison
    ? Math.max(0, originalINR - relationshipINR)
    : null;
  const savingsPct =
    hasComparison && originalINR > 0 && savingsINR != null
      ? Math.round((savingsINR / originalINR) * 100)
      : null;

  return {
    originalINR,
    relationshipINR,
    savingsINR,
    savingsPct,
    originalLabel:
      rel.targetFragranceId === anchorId ? "Original" : "Searched",
    originalDisplay: formatINR(originalINR),
    relationshipDisplay: formatINR(relationshipINR),
    savingsDisplay: formatINR(savingsINR),
    hasComparison,
  };
}

/** Only axes the engine scored — the speculative layer leaves most of them null. */
function buildSimilarityAxes(rel: KBRelationship): SimilarityAxisVM[] {
  const axes: { label: string; value: number | null }[] = [
    { label: "Opening", value: rel.openingSimilarity },
    { label: "Heart", value: rel.heartSimilarity },
    { label: "Drydown", value: rel.drydownSimilarity },
    { label: "Performance", value: rel.performanceSimilarity },
  ];
  return axes.filter(
    (a): a is SimilarityAxisVM => typeof a.value === "number"
  );
}

function buildCard(
  index: KBIndex,
  rel: KBRelationship,
  /** The fragrance being explored — the price comparison anchors on it. */
  anchorId: string,
  /** The fragrance to display — the far side of the edge from the anchor. */
  otherId: string,
  rank: number
): RelationshipCardVM | null {
  const fragrance = index.fragranceById.get(otherId);
  if (!fragrance) return null;
  return {
    relationshipId: rel.id,
    rank,
    fragrance,
    image: imageFor(index, fragrance),
    presentation: presentationFor(rel.relationshipType),
    overallSimilarity: rel.overallSimilarity,
    communityConfidence: rel.communityConfidence,
    similarityAxes: buildSimilarityAxes(rel),
    whyItMatches: rel.reason,
    differences: rel.differences,
    performance: buildPerformance(rel.performanceComparison),
    price: buildPrice(index, rel, anchorId, otherId),
    verified: rel.verified,
  };
}

/** The engine's ranking: strongest scent similarity first. */
function bySimilarity(a: KBRelationship, b: KBRelationship): number {
  const av = a.overallSimilarity ?? -1;
  const bv = b.overallSimilarity ?? -1;
  if (bv !== av) return bv - av;
  const ac = a.communityConfidence ?? -1;
  const bc = b.communityConfidence ?? -1;
  return bc - ac;
}

interface Edge {
  rel: KBRelationship;
  /** The fragrance to display — the far side from the anchor. */
  otherId: string;
  direction: EdgeDirection;
}

/**
 * Group edges into the sections the page renders.
 *
 * Symmetric types (SIMILAR_DNA, COMMUNITY_ALTERNATIVE) merge across both
 * directions — "similar to" reads the same either way, and splitting them would
 * print two identical "Closest DNA" headings. Directional types stay separate so
 * "what clones this" never collapses into "what this clones".
 *
 * Ranking and truncation both use the engine's own similarity order.
 */
function buildSections(
  index: KBIndex,
  anchorId: string,
  edges: Edge[]
): RelationshipSectionVM[] {
  const buckets = new Map<string, { edges: Edge[]; direction?: EdgeDirection }>();

  for (const edge of edges) {
    const type = edge.rel.relationshipType;
    // Symmetric types share one bucket; directional types get one per direction.
    const key = isSymmetric(type) ? type : `${type}:${edge.direction}`;
    const bucket = buckets.get(key);
    if (bucket) bucket.edges.push(edge);
    else {
      buckets.set(key, {
        edges: [edge],
        direction: isSymmetric(type) ? undefined : edge.direction,
      });
    }
  }

  const sections: RelationshipSectionVM[] = [];
  for (const { edges: list, direction } of buckets.values()) {
    const first = list[0];
    if (!first) continue;
    const type = first.rel.relationshipType;
    const presentation = presentationFor(type, direction);

    const seen = new Set<string>();
    const cards = [...list]
      .sort((a, b) => bySimilarity(a.rel, b.rel))
      // One card per fragrance: a pair can be joined by more than one edge.
      .filter((e) => {
        if (seen.has(e.otherId)) return false;
        seen.add(e.otherId);
        return true;
      })
      .slice(0, sectionLimitFor(type))
      .map((e, i) => buildCard(index, e.rel, anchorId, e.otherId, i + 1))
      .filter((c): c is RelationshipCardVM => c !== null);

    if (cards.length > 0) sections.push({ presentation, cards });
  }

  return sections.sort((a, b) => a.presentation.order - b.presentation.order);
}

/**
 * Reverse discovery — "People also explored".
 *
 * Every edge touching the fragrance, in either direction, mapped to the far
 * side, de-duplicated, ranked by the engine's similarity. Nothing random.
 */
export function peopleAlsoExplored(
  index: KBIndex,
  fragranceId: string,
  limit = 6
): RelationshipCardVM[] {
  const outgoing = index.outgoingBySourceId.get(fragranceId) ?? [];
  const incoming = index.incomingByTargetId.get(fragranceId) ?? [];
  const edges: { rel: KBRelationship; otherId: string }[] = [
    ...outgoing.map((rel) => ({ rel, otherId: rel.targetFragranceId })),
    ...incoming.map((rel) => ({ rel, otherId: rel.sourceFragranceId })),
  ];

  const seen = new Set<string>([fragranceId]);
  const unique: { rel: KBRelationship; otherId: string }[] = [];
  for (const edge of [...edges].sort((a, b) => bySimilarity(a.rel, b.rel))) {
    if (seen.has(edge.otherId)) continue;
    seen.add(edge.otherId);
    unique.push(edge);
  }

  return unique
    .slice(0, limit)
    .map((e, i) => buildCard(index, e.rel, fragranceId, e.otherId, i + 1))
    .filter((c): c is RelationshipCardVM => c !== null);
}

function buildDna(
  fragrance: KBFragrance,
  hasVerifiedOrigin: boolean
): DnaBadgeVM {
  const type = dnaTypeForStatus(fragrance.dupeStatus, hasVerifiedOrigin);
  const p = presentationFor(type);
  return { type, label: p.badgeLabel, blurb: p.blurb };
}

/**
 * The adaptive headline. Which story the page leads with depends entirely on
 * what the engine returned for this fragrance.
 */
function buildHeadline(
  fragrance: KBFragrance,
  outgoing: KBRelationship[],
  incoming: KBRelationship[]
): { headline: string; summary: string } {
  const has = (rels: KBRelationship[], type: string) =>
    rels.some((r) => r.relationshipType === type);

  if (has(incoming, "VERIFIED_CLONE")) {
    return {
      headline: "Verified Matches",
      summary: `Fragrances confirmed to match ${fragrance.name}, ranked by scent similarity.`,
    };
  }
  if (has(outgoing, "VERIFIED_CLONE")) {
    return {
      headline: "Verified Match",
      summary: `${fragrance.name} is a confirmed match for the fragrance it tracks.`,
    };
  }
  if (has(outgoing, "HYBRID_DNA") || has(incoming, "HYBRID_DNA")) {
    return {
      headline: "Closest DNA",
      summary: `${fragrance.name} blends characteristics from more than one fragrance.`,
    };
  }
  if (has(outgoing, "INSPIRED_BY")) {
    return {
      headline: "Inspired By",
      summary: `${fragrance.name} takes direction from another fragrance without being an exact clone.`,
    };
  }
  if (fragrance.dupeStatus === "designer_original") {
    return {
      headline: "Original Composition",
      summary: "No verified inspiration exists — here is what smells closest.",
    };
  }
  return {
    headline: "Closest DNA",
    summary: `What shares scent DNA with ${fragrance.name}, ranked by similarity.`,
  };
}

/** Everything the relationship page needs, for one fragrance. */
export function resolveFragranceRelationships(
  index: KBIndex,
  fragranceId: string
): FragranceRelationshipsVM | null {
  const fragrance = index.fragranceById.get(fragranceId);
  if (!fragrance) return null;

  const outgoing = index.outgoingBySourceId.get(fragranceId) ?? [];
  const incoming = index.incomingByTargetId.get(fragranceId) ?? [];

  const hasVerifiedOrigin = outgoing.some(
    (r) => r.relationshipType === "VERIFIED_CLONE"
  );
  const { headline, summary } = buildHeadline(fragrance, outgoing, incoming);

  const all = [...outgoing, ...incoming];
  const topSimilarity = all.reduce<number | null>(
    (max, r) =>
      r.overallSimilarity != null && (max == null || r.overallSimilarity > max)
        ? r.overallSimilarity
        : max,
    null
  );
  const topCommunityConfidence = all.reduce<number | null>(
    (max, r) =>
      r.communityConfidence != null && (max == null || r.communityConfidence > max)
        ? r.communityConfidence
        : max,
    null
  );

  return {
    fragrance,
    image: imageFor(index, fragrance, "hero"),
    dna: buildDna(fragrance, hasVerifiedOrigin),
    headline,
    summary,
    noVerifiedInspiration: !hasVerifiedOrigin,
    topSimilarity,
    topCommunityConfidence,
    sections: buildSections(index, fragranceId, [
      // Outgoing edges point at what this fragrance came from.
      ...outgoing.map((rel) => ({
        rel,
        otherId: rel.targetFragranceId,
        direction: "outgoing" as EdgeDirection,
      })),
      // Incoming edges point at what came from this fragrance.
      ...incoming.map((rel) => ({
        rel,
        otherId: rel.sourceFragranceId,
        direction: "incoming" as EdgeDirection,
      })),
    ]),
    peopleAlsoExplored: peopleAlsoExplored(index, fragranceId),
  };
}

/** Quick-start chips: fragrances with the richest verified relationship data. */
export function getFeaturedFragrances(
  index: KBIndex,
  limit = 6
): { fragranceId: string; brand: string; name: string }[] {
  const scored: { frag: KBFragrance; score: number }[] = [];
  for (const [targetId, rels] of index.incomingByTargetId) {
    const frag = index.fragranceById.get(targetId);
    if (!frag) continue;
    const verified = rels.filter((r) => r.verified).length;
    if (verified === 0) continue;
    scored.push({ frag, score: verified });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.frag.name.localeCompare(b.frag.name))
    .slice(0, limit)
    .map(({ frag }) => ({
      fragranceId: frag.id,
      brand: frag.brand,
      name: frag.name,
    }));
}
