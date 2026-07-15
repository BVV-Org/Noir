import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  KBAccord,
  KBBrand,
  KBCloneRelationship,
  KBFragrance,
  KBNote,
  KnowledgeBase,
} from "@/types/dupes";

/**
 * loader — the single point that reads the fragrance knowledge base.
 *
 * Data is read from `fragrance-kb/seed/*.json` at runtime, then memoised for the
 * life of the server process. Nothing is hardcoded: every brand, fragrance, and
 * relationship comes from these files, so anything added to the KB (and a
 * server reload) surfaces with no code change.
 *
 * Server-only (`fs`); the API routes call this, the client never does.
 */
const SEED_DIR = path.join(process.cwd(), "fragrance-kb", "seed");

async function readJson<T>(file: string): Promise<T> {
  const raw = await readFile(path.join(SEED_DIR, file), "utf8");
  return JSON.parse(raw) as T;
}

/** Indexed, ready-to-query view over the KB. */
export interface KBIndex {
  kb: KnowledgeBase;
  fragranceById: Map<string, KBFragrance>;
  brandById: Map<string, KBBrand>;
  /** original fragrance id → its clone relationships. */
  relationshipsByOriginalId: Map<string, KBCloneRelationship[]>;
  /** clone fragrance id → the relationship it appears in. */
  relationshipByCloneId: Map<string, KBCloneRelationship>;
  /** Every fragrance id that participates in at least one relationship. */
  fragranceIdsWithDupes: Set<string>;
}

function buildIndex(kb: KnowledgeBase): KBIndex {
  const fragranceById = new Map(kb.fragrances.map((f) => [f.id, f]));
  const brandById = new Map(kb.brands.map((b) => [b.id, b]));
  const relationshipsByOriginalId = new Map<string, KBCloneRelationship[]>();
  const relationshipByCloneId = new Map<string, KBCloneRelationship>();
  const fragranceIdsWithDupes = new Set<string>();

  for (const rel of kb.relationships) {
    const list = relationshipsByOriginalId.get(rel.originalFragranceId) ?? [];
    list.push(rel);
    relationshipsByOriginalId.set(rel.originalFragranceId, list);
    relationshipByCloneId.set(rel.cloneFragranceId, rel);
    fragranceIdsWithDupes.add(rel.originalFragranceId);
    fragranceIdsWithDupes.add(rel.cloneFragranceId);
  }

  return {
    kb,
    fragranceById,
    brandById,
    relationshipsByOriginalId,
    relationshipByCloneId,
    fragranceIdsWithDupes,
  };
}

async function loadFresh(): Promise<KBIndex> {
  const [brands, notes, accords, fragrances, relationships] = await Promise.all(
    [
      readJson<KBBrand[]>("brands.json"),
      readJson<KBNote[]>("notes.json"),
      readJson<KBAccord[]>("accords.json"),
      readJson<KBFragrance[]>("fragrances.json"),
      readJson<KBCloneRelationship[]>("clone_relationships.json"),
    ]
  );

  const kb: KnowledgeBase = { brands, notes, accords, fragrances, relationships };
  return buildIndex(kb);
}

// Memoise the load. In dev, Next re-imports modules on change, so edits to the
// KB during `next dev` are picked up on the next request boundary; in prod the
// cache lives for the process. Set DUPE_KB_NO_CACHE=1 to always re-read.
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
