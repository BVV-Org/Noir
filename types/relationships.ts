/**
 * Fragrance Relationship Engine — types.
 *
 * These mirror the KB's own output 1:1 (fragrance-kb/seed/*.json). The KB is a
 * stable internal package: nothing here re-derives similarity, confidence, or
 * relationship classification. The website is a presentation layer that renders
 * whatever the engine returns.
 *
 * `KB*` types are the canonical records as they sit on disk. `*VM` (view-model)
 * types are what the formatter hands to components, so components never touch
 * raw records.
 */

// ── Canonical engine records ─────────────────────────────────────────────────

/**
 * Relationship types the engine currently emits, plus the DNA classifications
 * the product speaks in. This is a *hint* union, not a gate: `RelationshipType`
 * keeps a string fallback so a type the KB starts emitting tomorrow still flows
 * through the UI (see `lib/kb/registry.ts`) without a code change here.
 */
export type KnownRelationshipType =
  | "VERIFIED_CLONE"
  | "INSPIRED_BY"
  | "HYBRID_DNA"
  | "ORIGINAL_DNA"
  | "SIMILAR_DNA"
  | "COMMUNITY_ALTERNATIVE";

export type RelationshipType = KnownRelationshipType | (string & {});

/** How the KB classifies a fragrance's own origin. Drives the DNA badge. */
export type DupeStatus =
  | "designer_original"
  | "matched"
  | "inspiration_unconfirmed"
  | (string & {});

export type FragranceKind = "original" | "clone" | "unknown" | (string & {});

export interface KBNotePyramid {
  top: string[];
  heart: string[];
  base: string[];
}

export interface KBFragrance {
  id: string;
  brandId: string;
  brand: string;
  name: string;
  kind: FragranceKind;
  dupeStatus: DupeStatus;
  concentration: string | null;
  gender: string | null;
  category: string | null;
  currency: string | null;
  approxPriceINR: number | null;
  notes: KBNotePyramid;
  accords: string[];
  sourceIds: string[];
}

/** Qualitative performance deltas, exactly as the engine words them. */
export interface KBPerformanceComparison {
  longevityComparison?: string | null;
  projectionComparison?: string | null;
  sillageComparison?: string | null;
}

/**
 * One edge from the engine. `sourceFragranceId` is the derivative (the clone /
 * inspired-by), `targetFragranceId` is the reference it points at.
 *
 * Every similarity axis is nullable: the speculative layer only scores
 * `overallSimilarity`, while the verified clone engine fills the full breakdown.
 */
export interface KBRelationship {
  id: string;
  sourceFragranceId: string;
  targetFragranceId: string;
  relationshipType: RelationshipType;
  overallSimilarity: number | null;
  openingSimilarity: number | null;
  heartSimilarity: number | null;
  drydownSimilarity: number | null;
  performanceSimilarity: number | null;
  valueSimilarity: number | null;
  /** Consensus strength — a *separate* metric from similarity. Secondary in UI. */
  communityConfidence: number | null;
  /** "Why it matches", already written by the engine. Rendered as bullets. */
  reason: string[];
  /** Honest differences, already written by the engine. */
  differences: string[];
  evidenceSources: string[];
  verified: boolean;
  performanceComparison: KBPerformanceComparison | null;
}

// ── Image assets ─────────────────────────────────────────────────────────────

export interface KBImageRendition {
  path: string;
  width: number;
  height: number;
  bytes: number;
}

export interface KBImageAsset {
  assetId: string;
  fragranceId: string;
  slug: string;
  status: string;
  format: string;
  isPlaceholder: boolean;
  dimensions: { width: number; height: number };
  renditions: Record<string, KBImageRendition | undefined>;
}

export interface KBBrand {
  id: string;
  name: string;
  kind: string;
  aliases: string[];
}

/** The whole KB, as loaded. */
export interface KnowledgeBase {
  brands: KBBrand[];
  fragrances: KBFragrance[];
  relationships: KBRelationship[];
  images: KBImageAsset[];
}

// ── View models ──────────────────────────────────────────────────────────────

/** Resolved artwork for a fragrance: a real KB rendition, or a derived swatch. */
export interface FragranceImageVM {
  /** Public URL of a ready KB rendition, or null when only a placeholder exists. */
  src: string | null;
  /** Deterministic gradient stops, used whenever `src` is null. */
  swatch: [string, string];
  alt: string;
}

export type PerformanceDirection = "stronger" | "similar" | "weaker" | "unknown";

export interface PerformanceAxisVM {
  label: string;
  direction: PerformanceDirection;
  /** The engine's own wording, e.g. "stronger". */
  raw: string | null;
  /** Position on a three-stop axis (0 weaker, 50 similar, 100 stronger). */
  position: number;
}

export interface PriceComparisonVM {
  /** The price of the fragrance being explored (the anchor). */
  originalINR: number | null;
  /** The price of the fragrance on the card. */
  relationshipINR: number | null;
  savingsINR: number | null;
  savingsPct: number | null;
  /**
   * What to call the anchor's price. Only claims "Original" when the KB puts the
   * anchor on the reference side of the edge.
   */
  originalLabel: string;
  originalDisplay: string | null;
  relationshipDisplay: string | null;
  savingsDisplay: string | null;
  /** False when either side lacks a price — the UI then omits the block. */
  hasComparison: boolean;
}

export interface SimilarityAxisVM {
  label: string;
  value: number;
}

/** How this relationship should be presented. Driven by the registry. */
export interface RelationshipPresentationVM {
  type: RelationshipType;
  /** Section title, e.g. "Verified Matches". */
  sectionTitle: string;
  /** Short badge label, e.g. "Verified Clone". */
  badgeLabel: string;
  /** One-line explanation of what this relationship means. */
  blurb: string;
  /** Ordering weight — lower sorts first. */
  order: number;
}

/** One related fragrance, fully prepared for a card. */
export interface RelationshipCardVM {
  relationshipId: string;
  rank: number;
  /** The fragrance being shown (the "other side" of the edge). */
  fragrance: KBFragrance;
  image: FragranceImageVM;
  presentation: RelationshipPresentationVM;
  /** Headline scent similarity. Never called "confidence". */
  overallSimilarity: number | null;
  /** Secondary consensus metric. */
  communityConfidence: number | null;
  /** Only the axes the engine actually scored. */
  similarityAxes: SimilarityAxisVM[];
  whyItMatches: string[];
  differences: string[];
  performance: PerformanceAxisVM[];
  price: PriceComparisonVM;
  verified: boolean;
}

/** A titled group of cards sharing one relationship type. */
export interface RelationshipSectionVM {
  presentation: RelationshipPresentationVM;
  cards: RelationshipCardVM[];
}

/** The DNA classification shown in the hero. */
export interface DnaBadgeVM {
  type: RelationshipType;
  label: string;
  blurb: string;
}

/** Everything the relationship page needs for one searched fragrance. */
export interface FragranceRelationshipsVM {
  fragrance: KBFragrance;
  image: FragranceImageVM;
  dna: DnaBadgeVM;
  /** The adaptive headline, e.g. "Verified Matches" / "Original Composition". */
  headline: string;
  /** Supporting line under the headline. */
  summary: string;
  /** True when the KB has no verified inspiration for this fragrance. */
  noVerifiedInspiration: boolean;
  /** Best similarity across all relationships, for the hero readout. */
  topSimilarity: number | null;
  topCommunityConfidence: number | null;
  /**
   * Every relationship group the engine returned, in registry order. Symmetric
   * types are merged across both edge directions; directional types keep their
   * own section per direction.
   */
  sections: RelationshipSectionVM[];
  /** Reverse discovery — co-explored fragrances from the engine. */
  peopleAlsoExplored: RelationshipCardVM[];
}

/** A quick-start chip for the empty state — derived from the KB, never curated. */
export interface FeaturedFragrance {
  fragranceId: string;
  brand: string;
  name: string;
}

export interface SearchSuggestion {
  fragranceId: string;
  name: string;
  brand: string;
  kind: FragranceKind;
  dupeStatus: DupeStatus;
  /** Whether the engine knows any relationship for this fragrance. */
  hasRelationships: boolean;
  matchedOn: "name" | "brand" | "alias" | "fuzzy";
}
