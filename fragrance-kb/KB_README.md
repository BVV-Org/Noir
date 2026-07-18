# Noir Vault Fragrance Knowledge Base — README

Production, evidence-backed fragrance relationship graph. SQLite is the canonical source of
truth; JSON exports mirror every table. Designed to migrate to PostgreSQL/Supabase without
changing the public API.

## Files
- `fragrance_kb.sqlite` — the database (source of truth).
- `schema.sql` — full DDL (normalized, portable).
- `exports/*.json` — `brands`, `notes`, `accords`, `fragrances`, `relationships`, `sources`,
  `image_assets`, `search_index`, plus `coverage_report_batch{1..5}.json`.
- `build_batch1.py … build_batch5.py` — the builders. Each batch appends data; the whole DB is
  regenerated deterministically from code (single source of truth), so no batch overwrites another.
- `BATCH_{1..5}_REPORT.md` — per-batch coverage + honesty notes. Batch 5 has the final totals.

## Rebuild
```bash
python3 build_batch5.py   # rebuilds the entire cumulative KB (all 190 fragrances)
```
Each `build_batchN.py` rebuilds the KB through batch N. Builders write the DB to `$KB_WORKDIR`
(defaults to the script dir); set it to a fast local path if your filesystem blocks SQLite writes.

## Schema (tables)
- `brands` (is_house_reference flags external inspiration houses)
- `fragrances` (brand, family, style, performance, overall_profile, fingerprint, is_reference,
  batch, needs_review)
- `notes`, `accords`, `fragrance_notes` (top/heart/base), `fragrance_accords` (weight)
- `relationships` — the edges. Every edge stores: relationship_type, overall/opening/heart/
  drydown/performance similarity, community_confidence, reason, honest_differences,
  supporting_evidence, source_count, last_verified, verified, needs_review, batch.
- `sources` (url, domain, source_type, tier 1–9), `relationship_sources` (provenance join)
- `image_assets` (empty by design — no licensed imagery yet)
- `search_index` (denormalized, rebuildable: terms, accords, top_relationships JSON)

## Relationship types
`VERIFIED_CLONE` (cross-validated ≥2 sources) · `INSPIRED_BY` · `HYBRID_DNA` (multi-parent) ·
`SIMILAR_DNA` · `ORIGINAL_DNA` (no verified target; `to` is NULL, closest DNA exposed) ·
`COMMUNITY_ALTERNATIVE`.

## Trust rules baked into the data
- `VERIFIED_CLONE` ⇒ `verified=1` ⇒ ≥2 independent sources. Single-source clone claims are held at
  `INSPIRED_BY` with `needs_review=1`.
- Nothing is fabricated. Where a designer target is unconfirmed, the edge is `ORIGINAL_DNA` and the
  claimed comparison (if any) lives in `supporting_evidence` text.
- Conflicting sources are represented (both views stored, confidence lowered) rather than resolved.

## Handy queries
```sql
-- Strongest, safest edges to surface first
SELECT ff.full_name, tf.full_name, r.overall_similarity, r.community_confidence
FROM relationships r
JOIN fragrances ff ON ff.id=r.from_fragrance_id
JOIN fragrances tf ON tf.id=r.to_fragrance_id
WHERE r.verified=1 ORDER BY r.overall_similarity DESC;

-- Everything that clones/【is inspired by】a given designer
SELECT ff.full_name, r.relationship_type
FROM relationships r
JOIN fragrances ff ON ff.id=r.from_fragrance_id
JOIN fragrances tf ON tf.id=r.to_fragrance_id
WHERE tf.full_name='Creed Aventus';

-- Filter OUT anything not yet trustworthy for user-facing features
SELECT full_name FROM fragrances WHERE is_reference=0 AND needs_review=0;
```

## Migration to Postgres/Supabase
INTEGER PKs → BIGSERIAL/IDENTITY · TEXT ISO timestamps → timestamptz · 0/1 → boolean ·
REAL scores stay REAL/numeric. `search_index.top_relationships` is JSON text → jsonb. No
SQLite-only features are used.
