import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  KBBrand,
  KBCloneRelationship,
  KBFragrance,
  KnowledgeBase,
} from "@/types/dupes";

/**
 * loader — the single point that reads the fragrance knowledge base.
 *
 * The KB is a completed, stable internal package. This module is an *adapter*:
 * it reads the KB's export files (`fragrance-kb/exports/*.json`) and maps them
 * onto the view-model shapes the Dupe Finder already renders. It re-derives
 * nothing — every similarity, confidence, reason, and difference is read
 * straight off the KB record.
 *
 * Two schema facts the mapping absorbs so the rest of the app stays unchanged:
 *   • fragrance/relationship ids are integers → keyed here by the stable slug.
 *   • similarity/confidence ship as 0–1 floats → surfaced as 0–100 for the UI.
 *
 * Relationships are directional (`from` derives from `to`) but indexed BOTH
 * ways, so every relationship a fragrance participates in is reachable from its
 * own page — not just the ones where it is the reference.
 *
 * Server-only (`fs`); the API routes call this, the client never does.
 */
const EXPORT_DIR = path.join(process.cwd(), "fragrance-kb", "exports");

async function readJson<T>(file: string): Promise<T> {
  const raw = await readFile(path.join(EXPORT_DIR, file), "utf8");
  return JSON.parse(raw) as T;
}

// ── Raw export record shapes (only the fields we read) ───────────────────────
interface RawBrand {
  id: number;
  name: string;
  slug: string;
}
interface RawFragrance {
  id: number;
  brand_id: number;
  brand: string;
  name: string;
  slug: string;
  gender: string | null;
  concentration: string | null;
  fragrance_family: string | null;
  is_reference: number;
  notes: { top?: string[]; heart?: string[]; base?: string[] } | null;
  accords: string[] | null;
}
interface RawRelationship {
  id: number;
  from_fragrance_id: number;
  to_fragrance_id: number | null;
  relationship_type: string;
  overall_similarity: number | null;
  opening_similarity: number | null;
  heart_similarity: number | null;
  drydown_similarity: number | null;
  performance_similarity: number | null;
  community_confidence: number | null;
  reason: string | null;
  honest_differences: string | null;
  verified: number;
}

const pct = (v: number | null | undefined): number | null =>
  v == null ? null : Math.round(v * 100);

const GENDER: Record<string, string> = {
  men: "Men",
  women: "Women",
  unisex: "Unisex",
};

/** "VERIFIED_CLONE" → "Verified Clone", "HYBRID_DNA" → "Hybrid DNA". */
function humanizeType(type: string): string {
  return type
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) =>
      w.toUpperCase() === "DNA"
        ? "DNA"
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(" ");
}

/**
 * Split a KB prose field into card bullets on sentence boundaries. The KB writes
 * `reason`/`honest_differences` as a paragraph; the card shows a list. Falls
 * back to the whole string so a single-sentence value still renders one bullet.
 */
function toBullets(text: string | null): string[] {
  if (!text) return [];
  const parts = text
    .split(/(?<=[.;])\s+(?=[A-Z0-9"'‘“])/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [text.trim()];
}

/**
 * Similarity axes are a property of the relationship, so they read the same from
 * either fragrance. `overall` backfills any phase the KB left null.
 */
function toMatch(r: RawRelationship) {
  const overall = pct(r.overall_similarity) ?? 0;
  return {
    opening: pct(r.opening_similarity) ?? overall,
    heart: pct(r.heart_similarity) ?? overall,
    drydown: pct(r.drydown_similarity) ?? overall,
    overall,
  };
}

// ── Indexed, ready-to-query view over the KB ─────────────────────────────────
export interface KBIndex {
  kb: KnowledgeBase;
  fragranceById: Map<string, KBFragrance>;
  brandById: Map<string, KBBrand>;
  /** reference id → relationships in which it is the reference (`to`). */
  relationshipsByOriginalId: Map<string, KBCloneRelationship[]>;
  /** derivative id → the relationship it is the derivative (`from`) of. */
  relationshipByCloneId: Map<string, KBCloneRelationship>;
  /** Any fragrance id → every relationship it touches, in either direction. */
  relationshipsByFragranceId: Map<string, KBCloneRelationship[]>;
  /** Every fragrance id that participates in at least one relationship. */
  fragranceIdsWithDupes: Set<string>;
}

function push<V>(map: Map<string, V[]>, key: string, value: V): void {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}

async function loadFresh(): Promise<KBIndex> {
  const [rawBrands, rawFragrances, rawRels] = await Promise.all([
    readJson<RawBrand[]>("brands.json"),
    readJson<RawFragrance[]>("fragrances.json"),
    readJson<RawRelationship[]>("relationships.json"),
  ]);

  // Integer ids are internal; the slug is the stable public id.
  const slugByNumId = new Map<number, string>(
    rawFragrances.map((f) => [f.id, f.slug])
  );
  const fragByNumId = new Map<number, RawFragrance>(
    rawFragrances.map((f) => [f.id, f])
  );
  const brandSlugById = new Map<number, string>(
    rawBrands.map((b) => [b.id, b.slug])
  );

  const brands: KBBrand[] = rawBrands.map((b) => ({
    id: b.slug,
    name: b.name,
    kind: "original",
    aliases: [],
  }));

  const fragrances: KBFragrance[] = rawFragrances.map((f) => ({
    id: f.slug,
    brandId: brandSlugById.get(f.brand_id) ?? String(f.brand_id),
    brand: f.brand,
    name: f.name,
    kind: f.is_reference ? "original" : "clone",
    concentration: f.concentration,
    gender: f.gender ? (GENDER[f.gender] ?? f.gender) : null,
    category: f.fragrance_family,
    currency: null,
    approxPriceINR: null,
    notes: {
      top: f.notes?.top ?? [],
      heart: f.notes?.heart ?? [],
      base: f.notes?.base ?? [],
    },
    accords: f.accords ?? [],
    sourceIds: [],
  }));

  // Only relationships that connect two known fragrances become cards.
  // ORIGINAL_DNA edges have a null `to` (they mark "no known inspiration") and
  // are intentionally skipped — there is no second fragrance to show.
  const relationships: KBCloneRelationship[] = [];
  for (const r of rawRels) {
    if (r.to_fragrance_id == null) continue;
    const fromSlug = slugByNumId.get(r.from_fragrance_id);
    const toSlug = slugByNumId.get(r.to_fragrance_id);
    const fromFrag = fragByNumId.get(r.from_fragrance_id);
    const toFrag = fragByNumId.get(r.to_fragrance_id);
    if (!fromSlug || !toSlug || !fromFrag || !toFrag) continue;

    relationships.push({
      id: String(r.id),
      // `to` is the reference (the "original"); `from` is the derivative.
      original: { brand: toFrag.brand, name: toFrag.name },
      clone: { brand: fromFrag.brand, name: fromFrag.name },
      match: toMatch(r),
      performance: {},
      price: {},
      currency: null,
      category: humanizeType(r.relationship_type),
      confidence: pct(r.community_confidence) ?? pct(r.overall_similarity) ?? 0,
      whyItMatches: toBullets(r.reason),
      differences: toBullets(r.honest_differences),
      // No sources on the site — Verdict by Noir only.
      sources: [],
      verified: r.verified === 1,
      originalFragranceId: toSlug,
      cloneFragranceId: fromSlug,
      claims: [],
    });
  }

  const kb: KnowledgeBase = {
    brands,
    notes: [],
    accords: [],
    fragrances,
    relationships,
  };
  return buildIndex(kb);
}

function buildIndex(kb: KnowledgeBase): KBIndex {
  const fragranceById = new Map(kb.fragrances.map((f) => [f.id, f]));
  const brandById = new Map(kb.brands.map((b) => [b.id, b]));
  const relationshipsByOriginalId = new Map<string, KBCloneRelationship[]>();
  const relationshipByCloneId = new Map<string, KBCloneRelationship>();
  const relationshipsByFragranceId = new Map<string, KBCloneRelationship[]>();
  const fragranceIdsWithDupes = new Set<string>();

  for (const rel of kb.relationships) {
    push(relationshipsByOriginalId, rel.originalFragranceId, rel);
    relationshipByCloneId.set(rel.cloneFragranceId, rel);
    // Both endpoints see the relationship, so every edge is reachable from
    // either fragrance's page.
    push(relationshipsByFragranceId, rel.originalFragranceId, rel);
    push(relationshipsByFragranceId, rel.cloneFragranceId, rel);
    fragranceIdsWithDupes.add(rel.originalFragranceId);
    fragranceIdsWithDupes.add(rel.cloneFragranceId);
  }

  return {
    kb,
    fragranceById,
    brandById,
    relationshipsByOriginalId,
    relationshipByCloneId,
    relationshipsByFragranceId,
    fragranceIdsWithDupes,
  };
}

// Memoise the load for the process. Set DUPE_KB_NO_CACHE=1 to always re-read
// while iterating on the KB.
let cache: Promise<KBIndex> | null = null;

export function getKB(): Promise<KBIndex> {
  if (process.env.DUPE_KB_NO_CACHE === "1") return loadFresh();
  if (!cache) cache = loadFresh();
  return cache;
}

/** Test/ops hook — drop the memoised KB so the next `getKB()` re-reads disk. */
export function invalidateKB(): void {
  cache = null;
}
