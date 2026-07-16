-- ==========================================================================
-- Fragrance Knowledge Base -- canonical schema (PostgreSQL / Supabase)
-- ==========================================================================
-- Design principles:
--   * Stable text slugs as primary keys (match the ids in the seed JSON), so
--     re-imports are idempotent and cross-source references are human-readable.
--   * A clone relationship is the deduplicated (original, clone) pair.
--   * Provenance lives in clone_claim: MULTIPLE claims per relationship, each
--     with its own source + confidence. A relationship cannot exist without at
--     least one claim (enforced by a trigger + application-level guarantee).
--   * Adding a new source never changes this schema -- you only insert new
--     `source` and `clone_claim` rows.
-- ==========================================================================

begin;

-- ---- reference vocabularies ---------------------------------------------- --

create table if not exists brand (
    id          text primary key,
    name        text not null unique,
    kind        text not null check (kind in ('original', 'clone')),
    aliases     text[] not null default '{}'
);

create table if not exists note (
    id          text primary key,
    name        text not null unique,
    aliases     text[] not null default '{}'
);

create table if not exists accord (
    id          text primary key,
    name        text not null unique
);

-- ---- fragrances ---------------------------------------------------------- --

create table if not exists fragrance (
    id                  text primary key,
    brand_id            text not null references brand(id) on delete restrict,
    name                text not null,
    kind                text not null default 'unknown'
                        check (kind in ('original', 'clone', 'unknown')),
    concentration       text,
    gender              text,
    category            text,
    approx_price_inr    integer,            -- prices stored in INR
    unique (brand_id, name)
);

-- fragrance <-> note (with pyramid layer) and fragrance <-> accord
create table if not exists fragrance_note (
    fragrance_id    text not null references fragrance(id) on delete cascade,
    note_id         text not null references note(id) on delete restrict,
    layer           text not null check (layer in ('top', 'heart', 'base')),
    primary key (fragrance_id, note_id, layer)
);

create table if not exists fragrance_accord (
    fragrance_id    text not null references fragrance(id) on delete cascade,
    accord_id       text not null references accord(id) on delete restrict,
    primary key (fragrance_id, accord_id)
);

-- ---- sources ------------------------------------------------------------- --

create table if not exists source (
    id              text primary key,
    name            text not null,
    type            text,                       -- curated | community | api ...
    trust_weight    numeric(3,2) not null default 1.0,
    url             text
);

-- ---- clone relationships (deduplicated pairs) ---------------------------- --

create table if not exists clone_relationship (
    id                      text primary key,
    original_fragrance_id   text not null references fragrance(id) on delete cascade,
    clone_fragrance_id      text not null references fragrance(id) on delete cascade,
    category                text,
    -- match breakdown 0..100
    match_opening           smallint check (match_opening between 0 and 100),
    match_heart             smallint check (match_heart between 0 and 100),
    match_drydown           smallint check (match_drydown between 0 and 100),
    match_overall           smallint check (match_overall between 0 and 100),
    -- performance comparison (clone relative to original)
    longevity_comparison    text,
    projection_comparison   text,
    sillage_comparison      text,
    -- price snapshot (approximate, INR)
    original_approx_inr      integer,
    clone_approx_inr         integer,
    -- aggregated confidence 0..100 (>= 80 by policy)
    confidence               smallint not null check (confidence between 0 and 100),
    why_it_matches           text[] not null default '{}',
    differences              text[] not null default '{}',
    verified                 boolean not null default false,
    created_at               timestamptz not null default now(),
    check (original_fragrance_id <> clone_fragrance_id),
    unique (original_fragrance_id, clone_fragrance_id)
);

-- ---- clone claims (provenance; many per relationship) -------------------- --

create table if not exists clone_claim (
    id                      bigint generated always as identity primary key,
    relationship_id         text not null references clone_relationship(id) on delete cascade,
    source_id               text not null references source(id) on delete restrict,
    url                     text,
    confidence              smallint not null check (confidence between 0 and 100),
    reported_similarity     smallint check (reported_similarity between 0 and 100),
    note                    text,
    trust_weight            numeric(3,2) not null default 1.0,
    unique (relationship_id, source_id, url)
);

-- ---- integrity: no relationship without a claim -------------------------- --
-- Enforced at the end of a transaction so bulk loads can insert the
-- relationship then its claims.

create or replace function assert_relationship_has_claim()
returns trigger language plpgsql as $$
begin
    if not exists (
        select 1 from clone_claim c where c.relationship_id = new.id
    ) then
        raise exception
            'clone_relationship % has no clone_claim (provenance required)', new.id;
    end if;
    return null;
end $$;

drop trigger if exists trg_relationship_requires_claim on clone_relationship;
create constraint trigger trg_relationship_requires_claim
    after insert or update on clone_relationship
    deferrable initially deferred
    for each row execute function assert_relationship_has_claim();

-- ---- helpful indexes ----------------------------------------------------- --

create index if not exists idx_fragrance_brand   on fragrance(brand_id);
create index if not exists idx_fragrance_kind    on fragrance(kind);
create index if not exists idx_rel_original      on clone_relationship(original_fragrance_id);
create index if not exists idx_rel_clone         on clone_relationship(clone_fragrance_id);
create index if not exists idx_rel_confidence    on clone_relationship(confidence desc);
create index if not exists idx_claim_rel         on clone_claim(relationship_id);
create index if not exists idx_claim_source      on clone_claim(source_id);

-- ---- convenience view for the Dupe Finder UI ----------------------------- --

create or replace view v_dupe_finder as
select
    r.id                     as relationship_id,
    ob.name                  as original_brand,
    o.name                   as original_name,
    o.approx_price_inr       as original_price_inr,
    cb.name                  as clone_brand,
    c.name                   as clone_name,
    c.approx_price_inr       as clone_price_inr,
    r.category,
    r.match_overall,
    r.confidence,
    r.clone_approx_inr,
    r.original_approx_inr,
    r.verified,
    count(cl.*)              as source_count
from clone_relationship r
join fragrance o  on o.id = r.original_fragrance_id
join brand     ob on ob.id = o.brand_id
join fragrance c  on c.id = r.clone_fragrance_id
join brand     cb on cb.id = c.brand_id
left join clone_claim cl on cl.relationship_id = r.id
group by r.id, ob.name, o.name, o.approx_price_inr, cb.name, c.name,
         c.approx_price_inr, r.category, r.match_overall, r.confidence,
         r.clone_approx_inr, r.original_approx_inr, r.verified;

commit;
