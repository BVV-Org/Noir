/**
 * Dupe Finder — types.
 *
 * The `KB*` types mirror the fragrance-kb seed schema 1:1 (see
 * fragrance-kb/schema/json_schema/*.json). Nothing here hardcodes a fragrance;
 * these only describe the *shape* the loader reads at runtime, so any fragrance
 * or relationship added to the knowledge base flows through automatically.
 *
 * The `*VM` (view-model) types are what the formatter produces for the UI, so
 * components never touch raw KB records.
 */

// ── Knowledge-base records (canonical) ────────────────────────────────────────
export type BrandKind = "original" | "clone";
export type FragranceKind = "original" | "clone" | "unknown";

export interface KBBrand {
  id: string;
  name: string;
  kind: BrandKind;
  aliases: string[];
}

export interface KBNote {
  id: string;
  name: string;
  aliases: string[];
}

export interface KBAccord {
  id: string;
  name: string;
}

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
  concentration: string | null;
  gender: string | null;
  category: string | null;
  currency: string | null;
  approxPriceINR: number | null;
  notes: KBNotePyramid;
  accords: string[];
  sourceIds: string[];
}

export interface KBMatchScores {
  opening: number;
  heart: number;
  drydown: number;
  overall: number;
}

export interface KBPerformance {
  longevityComparison?: string;
  projectionComparison?: string;
  sillageComparison?: string;
}

export interface KBPrice {
  originalApproxINR?: number;
  cloneApproxINR?: number;
}

export interface KBCloneClaim {
  sourceId: string;
  sourceName: string;
  url: string | null;
  confidence: number;
  reportedSimilarity?: number | null;
  note?: string | null;
  trustWeight?: number;
}

export interface KBFragranceRef {
  brand: string;
  name: string;
}

export interface KBCloneRelationship {
  id: string;
  original: KBFragranceRef;
  clone: KBFragranceRef;
  match: KBMatchScores;
  performance: KBPerformance;
  price: KBPrice;
  currency: string | null;
  category: string;
  confidence: number;
  whyItMatches: string[];
  differences: string[];
  sources: string[];
  verified: boolean;
  originalFragranceId: string;
  cloneFragranceId: string;
  claims: KBCloneClaim[];
}

/** The whole KB, as loaded. */
export interface KnowledgeBase {
  brands: KBBrand[];
  notes: KBNote[];
  accords: KBAccord[];
  fragrances: KBFragrance[];
  relationships: KBCloneRelationship[];
}

// ── View models (what the API/UI consume) ─────────────────────────────────────
export interface SearchSuggestion {
  fragranceId: string;
  name: string;
  brand: string;
  brandKind: BrandKind;
  fragranceKind: FragranceKind;
  /** Whether this fragrance participates in any clone relationship. */
  hasDupes: boolean;
  /** Which field the query matched, for subtle UI hinting. */
  matchedOn: "name" | "brand" | "alias";
}

export type PerformanceDirection = "stronger" | "similar" | "weaker" | "unknown";

export interface PerformanceAxisVM {
  label: string;
  direction: PerformanceDirection;
  /** Raw comparison string from the KB, e.g. "stronger". */
  raw: string | null;
}

export interface PriceComparisonVM {
  originalINR: number | null;
  cloneINR: number | null;
  savingsINR: number | null;
  savingsPct: number | null;
  originalDisplay: string | null;
  cloneDisplay: string | null;
  savingsDisplay: string | null;
}

/** One ranked clone, fully prepared for a card. */
export interface CloneCardVM {
  relationshipId: string;
  rank: number;
  clone: KBFragrance;
  confidence: number;
  confidenceLabel: string;
  match: KBMatchScores;
  category: string;
  whyItMatches: string[];
  differences: string[];
  performance: PerformanceAxisVM[];
  price: PriceComparisonVM;
  verified: boolean;
  /** Deterministic gradient stops derived from the fragrance id (no image field in KB). */
  swatch: [string, string];
}

/** A quick-start chip for the empty state — an original that has dupes. */
export interface FeaturedOriginal {
  fragranceId: string;
  brand: string;
  name: string;
}

export interface DupeResultVM {
  /** The original whose clones are shown. */
  original: KBFragrance;
  /** What the user actually searched — may be a clone that resolved to `original`. */
  searched: KBFragrance;
  searchedRole: "original" | "clone";
  /** Ranked clones. */
  clones: CloneCardVM[];
}
