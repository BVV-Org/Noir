# Noir Vault · Fragrance Knowledge Base — Batch 1 Report

**Batch:** 1 of 5 · **Brands:** Afnan, Lattafa · **Generated:** 2026-07-17
**Status:** production-ready, all integrity checks passing (0 failures)

---

## What was built

A brand-new, normalized knowledge base with SQLite as the canonical source of truth
(`fragrance_kb.sqlite`) plus JSON exports for every table (`/exports`). The schema is
modular and portable to PostgreSQL/Supabase without changing the public API
(INTEGER PKs → BIGSERIAL, ISO-8601 TEXT → timestamptz, 0/1 → boolean, scores are REAL in [0,1]).

Core tables: `brands`, `fragrances`, `notes`, `accords`, `fragrance_notes`,
`fragrance_accords`, `relationships`, `sources`, `relationship_sources`,
`image_assets`, `search_index`.

Every relationship stores the full required contract: `relationshipType`,
`overall/opening/heart/drydown/performance` similarity, `communityConfidence`,
`reason`, `honestDifferences`, `supportingEvidence`, `sources`, `sourceCount`,
`lastVerified`, `verified` (+ `needs_review` and `batch` for workflow).

---

## Coverage numbers

| Metric | Count |
|---|---|
| Fragrances processed (Afnan + Lattafa) | **40** |
| External reference targets added | 26 |
| Relationships created | **46** |
| — VERIFIED_CLONE | 7 |
| — INSPIRED_BY | 22 |
| — HYBRID_DNA | 6 |
| — SIMILAR_DNA | 7 |
| — ORIGINAL_DNA | 4 |
| — COMMUNITY_ALTERNATIVE | 0 |
| Cross-validated (`verified=1`, ≥2 independent sources) | 12 |
| Low-confidence relationships (`communityConfidence < 0.5`) | 14 |
| Relationships flagged for manual review | 18 |
| Notes catalogued | 114 |
| Accords catalogued | 43 |
| Sources catalogued (with provenance) | 80 |
| Duplicate records removed | 0 |
| Validation issues | 0 |

---

## Verified clones (cross-validated, ≥2 independent sources)

| Fragrance | Clone of | Overall sim. | Confidence |
|---|---|---|---|
| Afnan 9PM | Jean Paul Gaultier Ultra Male | 0.85 | 0.90 |
| Afnan Supremacy Silver | Creed Aventus | 0.82 | 0.80 |
| Afnan Supremacy Not Only Intense | Nishane Hacivat | 0.78 | 0.72 |
| Afnan Supremacy Collector's Edition | Creed Aventus Absolu | 0.75 | 0.70 |
| Lattafa Fakhar Black | YSL Y Eau de Parfum | 0.85 | 0.82 |
| Lattafa Bade'e Al Oud Oud for Glory | Initio Oud for Greatness | 0.88 | 0.85 |
| Lattafa Maahir Legacy | Parfums de Marly Sedley | 0.80 | 0.72 |

## Notable INSPIRED_BY (strong but held below "verified clone")

Lattafa Khamrah → Kilian Angels' Share · Lattafa Asad → Dior Sauvage Elixir ·
Lattafa Al Nashama Caprice → YSL La Nuit de l'Homme Bleu Electrique ·
Lattafa Liam Blue Shine → Acqua di Gio · Lattafa Liam Grey → BDK Gris Charnel ·
Afnan Supremacy In Heaven → Creed Silver Mountain Water · Afnan Historic Sahara → PdM Althair ·
Afnan Historic Olmeda → Bleu de Chanel · Afnan Modest Une → Dior Sauvage EDT ·
Lattafa Fakhar Gold Extrait → Paco Rabanne 1 Million Parfum.

## HYBRID_DNA (multi-parent)

- **Afnan 9AM Dive** = Bleu de Chanel × YSL Y
- **Lattafa Asad Zanzibar** = JPG Le Beau × Bentley for Men Intense
- **Lattafa Bade'e Al Oud Honor & Glory** = Nishane Hacivat × Nishane Ani

## ORIGINAL_DNA (no verified inspiration — closest DNA exposed)

Afnan 9AM, Afnan Turathi Blue, Afnan Portrait Abstract, Lattafa Eternal Oud.

---

## Fragrances requiring manual review (weak / single-source evidence)

Afnan 9PM Rebel, Afnan 9PM Elixir, Afnan 9PM Night Out, Afnan 9AM,
Afnan Turathi Blue, Afnan Turathi Electric, Afnan Portrait Abstract,
Lattafa Asad Elixir, Lattafa Bade'e Al Oud Sublime, Lattafa Musamam Black Intense,
Lattafa Eternal Oud.

These carry honest low confidence and `needs_review=1`. They are safe to ship
(nothing fabricated) but should be strengthened before powering high-stakes features.

---

## Honesty & methodology notes

- **Nothing was forced.** Where the community calls something a "clone" but only one
  reliable source backs it (e.g. Lattafa Asad Bourbon → Azzaro The Most Wanted), it is
  stored as INSPIRED_BY with `needs_review=1`, not VERIFIED_CLONE.
- **A wrong prior was caught by research.** "Supremacy Not Only Intense" is a Nishane
  Hacivat clone — not Ombre Nomade — confirmed by search before writing.
- **Unverifiable claims were not invented as nodes.** Turathi Blue's most-cited comparison
  ("Tygar") could not be tied to a confirmed release, so it is ORIGINAL_DNA + review flag
  rather than a fabricated edge.
- **Provenance is preserved on every edge** via `relationship_sources`, ranked by source
  tier (brand official → Parfumo → Fragrantica → Reddit → Perfume Gyan → YouTube → databases → retailers).

### Known limitations to address in later passes
- Reddit / YouTube / Perfume Gyan were used as consensus signals via aggregated search,
  not yet as individually stored primary-source rows — a deepening pass can add them.
- Two HYBRID parents (JPG Le Beau, Tom Ford Ebène Fumé) are referenced in evidence text
  but not yet added as reference nodes; they'll be created when their batches/edges need them.
- `image_assets` is intentionally empty (no licensed imagery sourced yet).

---

## Next
Say **"Proceed to Batch 2"** to continue with **Rayhaan (18) + Rasasi (28)**,
building on this exact database without repeating Batch 1 work.
