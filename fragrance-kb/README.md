# Fragrance Knowledge Base — Clone / Dupe Pipeline

A scalable, provenance-first pipeline that builds a production-ready clone
("dupe") database for a luxury-fragrance Dupe Finder. It imports fragrance data
from multiple structured sources, normalizes brands / names / notes, fuzzy-
deduplicates records, and emits clean JSON that imports directly into
PostgreSQL or Supabase.

**Design rule #1: never fabricate a clone relationship.** Every relationship is
backed by at least one attributed source claim. If consensus is weak, it is
omitted rather than guessed.

---

## What's in the box

```
fragrance-kb/
├── data/raw/                     # source inputs (add more here)
│   ├── curated_v1.json           #   hand-curated, web-verified relationships
│   ├── curated_v2.json           #   Afnan/Rasasi/French Avenue verified relationships
│   ├── community_votes_v1.csv    #   CSV source — demonstrates merge/dedup
│   └── catalog_expansion_v1.txt  #   plain-text product listing (catalog-only)
├── pipeline/                     # the pipeline
│   ├── normalize.py              #   canonical brands/notes/accords/names + IDs
│   ├── models.py                 #   dataclasses (incl. CloneClaim / CloneRelationship)
│   ├── dedup.py                  #   fuzzy matching + fragrance resolver
│   ├── sources/                  #   pluggable source adapters
│   │   ├── base.py               #     SourceAdapter interface
│   │   ├── curated_json.py       #     adapter for the JSON source
│   │   ├── community_csv.py      #     adapter for the CSV source
│   │   └── __init__.py           #     ALL_SOURCES registry
│   ├── build.py                  #   orchestrator → writes seed/*.json
│   └── validate.py               #   integrity checks
├── seed/                         # GENERATED canonical output
│   ├── brands.json
│   ├── fragrances.json
│   ├── notes.json
│   ├── accords.json
│   ├── clone_relationships.json
│   └── load.sql                  #   generated idempotent upserts
├── schema/
│   ├── schema.sql                # PostgreSQL / Supabase DDL
│   └── json_schema/*.json        # JSON Schema contracts for the seed files
├── import/
│   ├── generate_sql.py           # seed JSON → seed/load.sql
│   └── import_db.py              # direct psycopg loader
└── tests/test_pipeline.py        # runnable unit tests (stdlib only)
```

---

## Quick start

```bash
cd fragrance-kb

# 1. Build the canonical seed files from all registered sources
python -m pipeline.build

# 2. Validate integrity (referential integrity, no dup/contradictory pairs,
#    provenance present, confidence gate)
python -m pipeline.validate

# 3. Run the tests
python -m unittest discover -s tests

# 4. Generate SQL and load into Postgres / Supabase
python import/generate_sql.py
psql "$DATABASE_URL" -f schema/schema.sql
psql "$DATABASE_URL" -f seed/load.sql
#   …or, with the driver installed:
#   pip install "psycopg[binary]" && DATABASE_URL=... python import/import_db.py
```

No third-party dependencies are required to build, validate, test, or generate
SQL — only standard library. `psycopg` is optional and only needed for the
direct loader.

---

## The data model

Five canonical tables / files:

| File | Entity | Notes |
|------|--------|-------|
| `brands.json` | Brand | canonical name, `kind` (`original`/`clone`), aliases |
| `notes.json` | Note | canonical note vocabulary + aliases |
| `accords.json` | Accord | canonical accord vocabulary |
| `fragrances.json` | Fragrance | brand, name, pyramid (top/heart/base notes), accords, price (INR) |
| `clone_relationships.json` | CloneRelationship | deduplicated (original, clone) pair |

### Provenance: `CloneClaim` vs `CloneRelationship`

A **`CloneClaim`** is a *single source's* assertion that a clone duplicates an
original — with its own `confidence`, `reportedSimilarity`, URL, and note.

A **`CloneRelationship`** is the deduplicated pair and **owns a list of
claims**. Its headline `confidence` and `match` scores are *aggregated* from the
claims, never invented. Because a relationship is only emitted when it has ≥ 1
claim, **provenance is structurally guaranteed** — enforced in `build.py`, in
`validate.py`, in the JSON Schema (`claims` `minItems: 1`), and by a database
trigger (`assert_relationship_has_claim`).

Each `clone_relationships.json` record matches the required record schema
exactly (`id`, `original`, `clone`, `match`, `performance`, `price`, `category`,
`confidence`, `whyItMatches`, `differences`, `sources`, `verified`) and adds
`originalFragranceId`, `cloneFragranceId`, and `claims[]` for full provenance.

---

## Adding a new source (no schema change)

This is the extensibility contract. To add a source:

1. Drop the raw file in `data/raw/`.
2. Write an adapter in `pipeline/sources/` that subclasses `SourceAdapter` and
   returns an `IngestBatch` of `RawFragrance` + `RawClaim` objects.
3. Register it in `pipeline/sources/__init__.py` → `ALL_SOURCES`.

That's it. The canonical schema, IDs, dedup logic, seed files, and SQL never
change. New spellings only need a one-line alias in `normalize.py`. Sources
carry a `trust_weight`; claims from lower-trust sources are discounted when
gating a relationship (see below).

---

## Normalization

`normalize.py` maps messy inputs to canonical values with deterministic slug
IDs:

- **Brands**: `MFK` → `Maison Francis Kurkdjian`, `ysl` → `Yves Saint Laurent`,
  `FRAGRANCE WORLD` → `Fragrance World`, etc. Each brand is tagged
  `original` or `clone`.
- **Notes**: `agarwood` → `Oud`, `cassis` → `Blackcurrant`, `frankincense` →
  `Olibanum`, and Title-Case fallback.
- **Names**: light-touch (abbreviation aliases + whitespace) so meaningful
  variants like *Sauvage* vs *Sauvage Elixir* are preserved.

## Deduplication

`dedup.py` collapses records that refer to the same real fragrance:

- Requires an **exact canonical brand match** (never merges two houses).
- Blends a sequence ratio with a token-set (Jaccard) ratio; threshold `0.88`.
- **Subset-guard**: if one name's tokens are a strict subset of the other's
  (e.g. *Sauvage* ⊂ *Sauvage Elixir*), the score is capped so they do **not**
  merge. This is verified in the test suite.

Confidence aggregation is conservative: a relationship's headline confidence is
the strongest **fully-trusted** claim's confidence; lower-trust community claims
are trust-discounted and cannot, alone, push a pair over the inclusion gate.

---

## Quality gates (enforced, not aspirational)

- **Confidence ≥ 80** to be included (spec threshold). Anything weaker is
  dropped and counted in the build report.
- **No duplicate relationships** (same pair twice).
- **No contradictory mappings** (a pair mapped in both directions).
- **No self-references**.
- **Every relationship has ≥ 1 source claim** (no fabrication).
- **Referential integrity**: every note/accord/brand/fragrance referenced
  exists in its catalog.

`validate.py` exits non-zero if any check fails, so it can gate CI/CD.

---

## Data provenance & honest caveats

- Relationships were **web-verified in July 2026** against fragrance
  communities (Fragrantica boards, ScentClones, ScentGourmand, Aroma Authority,
  Basenotes, brand/retailer comparison pages, etc.). Each claim carries the
  specific URL.
- **Prices are in INR** (`approxPriceINR`, `originalApproxINR`,
  `cloneApproxINR`), converted from USD source points at
  `USD_TO_INR = 96` (see `pipeline/config.py`). FX drifts and clone prices are
  approximate — treat all prices as indicative. Change the rate and rebuild to
  re-baseline.
- `match.*` and `performance.*` are **community-reported estimates**, not lab
  measurements.
- Weak / divided-consensus pairs were **deliberately omitted rather than
  guessed**, e.g.:
  - Rasasi Hawas is **Paco Rabanne Invictus Aqua**, *not* Creed Aventus (common
    misconception — corrected here).
  - Rasasi La Yuqawam is **Tom Ford Tuscan Leather**, *not* Amouage Reflection
    Man.
  - Lattafa Eternal Oud → MFK Grand Soir, Lattafa Qaed Al Fursan, Lattafa Maahir
    Legacy: consensus is divided/ambiguous → **catalog-only, no relationship**.
  - Tom Ford Tobacco Vanille, Nishane Hacivat, ME Ombre Nomade clones: no strong
    single-clone consensus → omitted.
- The Kilian Angels' Share → Lattafa Khamrah pair is included because the
  *recommendation* consensus is strong, but its `match.overall` is honestly set
  to ~75 to reflect that it is not a 1:1 match.

## Current dataset

**23 high-confidence relationships** across **219 fragrances / 23 brands**.

- Clone houses: Armaf, Maison Alhambra, Fragrance World, Lattafa, Al Haramain,
  Afnan, Rasasi, Rayhaan, Arabiyat Prestige, French Avenue, Aromatix ×
  French Avenue.
- Original houses: Creed, MFK, Parfums de Marly, Louis Vuitton, Initio, Dior,
  Chanel, YSL, By Kilian, Jean Paul Gaultier, Paco Rabanne, Tom Ford.

Every product from the supplied house lists (Afnan, Lattafa, Rayhaan, Rasasi,
Arabiyat Prestige, French Avenue, Aromatix) is in the **catalog**
(`fragrances.json`). A **clone→original relationship** is attached only where
community consensus is strong; the remaining catalog entries are intentionally
left without an "og" rather than fabricating one. Extend by adding sources and
rebuilding.
