-- ============================================================================
-- NOIR VAULT · FRAGRANCE KNOWLEDGE BASE
-- Production schema (SQLite canonical source of truth)
-- Designed for clean migration to PostgreSQL / Supabase without public API change.
-- Notes on portability:
--   * All PKs are INTEGER (map to BIGSERIAL/IDENTITY in Postgres).
--   * Timestamps are ISO-8601 TEXT (map to timestamptz).
--   * Booleans are INTEGER 0/1 (map to boolean).
--   * Similarity/confidence scores are REAL in [0,1].
--   * No SQLite-only features used except AUTOINCREMENT semantics.
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ---------- BRANDS ----------------------------------------------------------
CREATE TABLE brands (
    id                  INTEGER PRIMARY KEY,
    name                TEXT    NOT NULL UNIQUE,
    slug                TEXT    NOT NULL UNIQUE,
    country             TEXT,
    -- is_house_reference = 1 for external designer/niche houses that are only
    -- referenced as inspiration targets (Chanel, Creed, Kilian, ...), not part
    -- of the Noir Vault target catalogue.
    is_house_reference  INTEGER NOT NULL DEFAULT 0,
    created_at          TEXT    NOT NULL
);

-- ---------- NOTES -----------------------------------------------------------
CREATE TABLE notes (
    id      INTEGER PRIMARY KEY,
    name    TEXT NOT NULL UNIQUE,
    slug    TEXT NOT NULL UNIQUE
);

-- ---------- ACCORDS ---------------------------------------------------------
CREATE TABLE accords (
    id      INTEGER PRIMARY KEY,
    name    TEXT NOT NULL UNIQUE,
    slug    TEXT NOT NULL UNIQUE
);

-- ---------- FRAGRANCES ------------------------------------------------------
CREATE TABLE fragrances (
    id                  INTEGER PRIMARY KEY,
    brand_id            INTEGER NOT NULL REFERENCES brands(id),
    name                TEXT    NOT NULL,
    slug                TEXT    NOT NULL UNIQUE,
    full_name           TEXT    NOT NULL,     -- "Brand Name"
    gender              TEXT,                 -- men | women | unisex
    concentration       TEXT,                 -- EDT | EDP | Extrait | Parfum
    year                INTEGER,
    fragrance_family    TEXT,
    style               TEXT,
    perf_longevity      TEXT,                 -- weak | moderate | long | very long
    perf_projection     TEXT,                 -- soft | moderate | strong | nuclear
    overall_profile     TEXT,                 -- prose scent summary
    fingerprint         TEXT,                 -- deterministic accord fingerprint
    is_reference        INTEGER NOT NULL DEFAULT 0,  -- 1 = external inspiration target
    batch               INTEGER,              -- research batch number (NULL for refs)
    needs_review        INTEGER NOT NULL DEFAULT 0,
    created_at          TEXT    NOT NULL,
    updated_at          TEXT    NOT NULL,
    UNIQUE (brand_id, name)
);

-- ---------- FRAGRANCE ⇄ NOTES (normalized pyramid) --------------------------
CREATE TABLE fragrance_notes (
    fragrance_id    INTEGER NOT NULL REFERENCES fragrances(id) ON DELETE CASCADE,
    note_id         INTEGER NOT NULL REFERENCES notes(id),
    position        TEXT    NOT NULL,         -- top | heart | base
    PRIMARY KEY (fragrance_id, note_id, position)
);

-- ---------- FRAGRANCE ⇄ ACCORDS --------------------------------------------
CREATE TABLE fragrance_accords (
    fragrance_id    INTEGER NOT NULL REFERENCES fragrances(id) ON DELETE CASCADE,
    accord_id       INTEGER NOT NULL REFERENCES accords(id),
    weight          REAL    NOT NULL DEFAULT 1.0,   -- prominence 0..1
    PRIMARY KEY (fragrance_id, accord_id)
);

-- ---------- SOURCES (provenance) --------------------------------------------
CREATE TABLE sources (
    id          INTEGER PRIMARY KEY,
    url         TEXT NOT NULL UNIQUE,
    domain      TEXT,
    title       TEXT,
    -- source_type ranks reliability per research methodology:
    -- brand_official | parfumo | fragrantica | reddit | perfumegyan |
    -- youtube | database | community | retailer
    source_type TEXT,
    tier        INTEGER,   -- 1 = highest reliability ... 9 = supporting only
    created_at  TEXT NOT NULL
);

-- ---------- RELATIONSHIPS (the graph edges) ---------------------------------
CREATE TABLE relationships (
    id                    INTEGER PRIMARY KEY,
    from_fragrance_id     INTEGER NOT NULL REFERENCES fragrances(id) ON DELETE CASCADE,
    -- to_fragrance_id is NULL for ORIGINAL_DNA (no verified inspiration target).
    to_fragrance_id       INTEGER REFERENCES fragrances(id) ON DELETE CASCADE,
    relationship_type     TEXT    NOT NULL,   -- VERIFIED_CLONE | INSPIRED_BY |
                                              -- HYBRID_DNA | SIMILAR_DNA |
                                              -- ORIGINAL_DNA | COMMUNITY_ALTERNATIVE
    overall_similarity    REAL,
    opening_similarity    REAL,
    heart_similarity      REAL,
    drydown_similarity    REAL,
    performance_similarity REAL,
    community_confidence  REAL,               -- 0..1 strength of community consensus
    reason                TEXT,
    honest_differences    TEXT,
    supporting_evidence   TEXT,
    source_count          INTEGER NOT NULL DEFAULT 0,
    last_verified         TEXT,
    verified              INTEGER NOT NULL DEFAULT 0,
    needs_review          INTEGER NOT NULL DEFAULT 0,
    batch                 INTEGER,
    created_at            TEXT NOT NULL,
    CHECK (to_fragrance_id IS NULL OR from_fragrance_id <> to_fragrance_id)
);

-- ---------- RELATIONSHIP ⇄ SOURCES -----------------------------------------
CREATE TABLE relationship_sources (
    relationship_id INTEGER NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
    source_id       INTEGER NOT NULL REFERENCES sources(id),
    PRIMARY KEY (relationship_id, source_id)
);

-- ---------- IMAGE ASSETS ----------------------------------------------------
CREATE TABLE image_assets (
    id             INTEGER PRIMARY KEY,
    fragrance_id   INTEGER NOT NULL REFERENCES fragrances(id) ON DELETE CASCADE,
    asset_type     TEXT,      -- bottle | box | macro | swatch
    url            TEXT,
    source         TEXT,
    license_status TEXT NOT NULL DEFAULT 'unverified', -- unverified | licensed | official
    created_at     TEXT NOT NULL
);

-- ---------- SEARCH INDEX (denormalized, rebuildable) ------------------------
CREATE TABLE search_index (
    fragrance_id       INTEGER PRIMARY KEY REFERENCES fragrances(id) ON DELETE CASCADE,
    brand              TEXT,
    display_name       TEXT,
    family             TEXT,
    terms              TEXT,   -- space-joined searchable tokens
    accords            TEXT,   -- comma-joined
    top_relationships  TEXT    -- JSON array of {type,target,confidence}
);

-- ---------- INDEXES ---------------------------------------------------------
CREATE INDEX idx_frag_brand         ON fragrances(brand_id);
CREATE INDEX idx_frag_family        ON fragrances(fragrance_family);
CREATE INDEX idx_frag_batch         ON fragrances(batch);
CREATE INDEX idx_rel_from           ON relationships(from_fragrance_id);
CREATE INDEX idx_rel_to             ON relationships(to_fragrance_id);
CREATE INDEX idx_rel_type           ON relationships(relationship_type);
CREATE INDEX idx_fn_note            ON fragrance_notes(note_id);
CREATE INDEX idx_fa_accord          ON fragrance_accords(accord_id);
