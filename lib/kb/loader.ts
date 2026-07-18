import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  KBBrand,
  KBFragrance,
  KBImageAsset,
  KBRelationship,
  KnowledgeBase,
} from "@/types/relationships";

/**
 * loader — the single point that reads the Fragrance Knowledge Base.
 *
 * The KB is a completed, stable internal package. This module only reads and
 * indexes it; it never re-derives relationships, similarity, or confidence.
 *
 * `fragrance_relationships.json` is the *unified* engine output (verified clone
 * engine + speculative suggestion layer + co-clone alternatives), so it is the
 * only relationship source we read. The legacy `clone_relationships.json` is
 * deliberately ignored — it predates the engine and would double-count.
 *
 * Server-only (`fs`); API routes call this, the client never does.
 */
const SEED_DIR = path.join(process.cwd(), "fragrance-kb", "seed");

async function readJson<T>(file: string): Promise<T> {
  const raw = await readFile(path.join(SEED_DIR, file), "utf8");
  return JSON.parse(raw) as T;
}

/** The engine files wrap their payload in an envelope. */
interface RelationshipsFile {
  version: number;
  note?: string;
  count: number;
  relationships: KBRelationship[];
}
interface ImageAssetsFile {
  version: number;
  count: number;
  assets: KBImageAsset[];
}

/** Indexed, ready-to-query view over the KB. */
export interface KBIndex {
  kb: KnowledgeBase;
  fragranceById: Map<string, KBFragrance>;
  brandById: Map<string, KBBrand>;
  imageByFragranceId: Map<string, KBImageAsset>;
  /** Edges where the fragrance is the derivative (what it comes from). */
  outgoingBySourceId: Map<string, KBRelationship[]>;
  /** Edges where the fragrance is the reference (what comes from it). */
  incomingByTargetId: Map<string, KBRelationship[]>;
  /** Every fragrance id touched by at least one relationship. */
  fragranceIdsWithRelationships: Set<string>;
}

function push<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}

function buildIndex(kb: KnowledgeBase): KBIndex {
  const fragranceById = new Map(kb.fragrances.map((f) => [f.id, f]));
  const brandById = new Map(kb.brands.map((b) => [b.id, b]));
  const imageByFragranceId = new Map(kb.images.map((a) => [a.fragranceId, a]));
  const outgoingBySourceId = new Map<string, KBRelationship[]>();
  const incomingByTargetId = new Map<string, KBRelationship[]>();
  const fragranceIdsWithRelationships = new Set<string>();

  for (const rel of kb.relationships) {
    // Drop edges pointing at fragrances the KB doesn't define, so a partial
    // export can never render a card with no fragrance behind it.
    if (
      !fragranceById.has(rel.sourceFragranceId) ||
      !fragranceById.has(rel.targetFragranceId)
    ) {
      continue;
    }
    push(outgoingBySourceId, rel.sourceFragranceId, rel);
    push(incomingByTargetId, rel.targetFragranceId, rel);
    fragranceIdsWithRelationships.add(rel.sourceFragranceId);
    fragranceIdsWithRelationships.add(rel.targetFragranceId);
  }

  return {
    kb,
    fragranceById,
    brandById,
    imageByFragranceId,
    outgoingBySourceId,
    incomingByTargetId,
    fragranceIdsWithRelationships,
  };
}

async function loadFresh(): Promise<KBIndex> {
  const [brands, fragrances, relFile, imgFile] = await Promise.all([
    readJson<KBBrand[]>("brands.json"),
    readJson<KBFragrance[]>("fragrances.json"),
    readJson<RelationshipsFile>("fragrance_relationships.json"),
    readJson<ImageAssetsFile>("image_assets.json"),
  ]);

  const kb: KnowledgeBase = {
    brands,
    fragrances,
    relationships: relFile.relationships,
    images: imgFile.assets,
  };
  return buildIndex(kb);
}

// Memoised for the life of the server process. Set KB_NO_CACHE=1 to re-read on
// every request while iterating on the KB.
let cache: Promise<KBIndex> | null = null;

export function getKB(): Promise<KBIndex> {
  if (process.env.KB_NO_CACHE === "1") return loadFresh();
  if (!cache) cache = loadFresh();
  return cache;
}

/** Test/ops hook — drop the memoised KB so the next `getKB()` re-reads disk. */
export function invalidateKB(): void {
  cache = null;
}
