"""
Canonical data models for the fragrance knowledge base.

These dataclasses are the in-memory representation the pipeline builds. They map
1:1 onto the emitted seed JSON files and onto the PostgreSQL/Supabase schema in
schema/schema.sql.

Core idea for provenance:
  * A CloneClaim is a single assertion, from ONE source, that clone X is a dupe
    of original Y. It carries the source, the reported similarity, a confidence,
    and a free-text note.
  * A CloneRelationship is the deduplicated pair (original, clone). It OWNS a
    list of CloneClaims. Confidence and similarity at the relationship level are
    AGGREGATED from the claims -- never invented.

This means a relationship can never exist without at least one attributed claim,
so provenance is structurally guaranteed.
"""
from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Optional


# --------------------------------------------------------------------------- #
# Raw ingest types (what a source adapter yields, pre-normalization)
# --------------------------------------------------------------------------- #

@dataclass
class RawFragrance:
    brand: str
    name: str
    kind: str = "unknown"            # "original" | "clone" | "unknown"
    concentration: Optional[str] = None
    gender: Optional[str] = None
    category: Optional[str] = None
    approx_price_usd: Optional[float] = None
    notes_top: list = field(default_factory=list)
    notes_heart: list = field(default_factory=list)
    notes_base: list = field(default_factory=list)
    accords: list = field(default_factory=list)


@dataclass
class RawClaim:
    """One source's assertion that `clone` duplicates `original`."""
    original_brand: str
    original_name: str
    clone_brand: str
    clone_name: str
    category: Optional[str]
    # match breakdown (0-100); any may be None if a source only gives overall
    match_opening: Optional[int]
    match_heart: Optional[int]
    match_drydown: Optional[int]
    match_overall: Optional[int]
    confidence: int                  # 0-100, this source's consensus strength
    source_id: str
    source_name: str
    source_url: Optional[str]
    note: Optional[str] = None
    reported_similarity: Optional[int] = None
    # optional performance / price / prose carried by richer sources
    performance: Optional[dict] = None
    price: Optional[dict] = None
    why_it_matches: list = field(default_factory=list)
    differences: list = field(default_factory=list)


@dataclass
class IngestBatch:
    source_id: str
    source_name: str
    source_type: str
    trust_weight: float
    fragrances: list = field(default_factory=list)   # list[RawFragrance]
    claims: list = field(default_factory=list)        # list[RawClaim]


# --------------------------------------------------------------------------- #
# Canonical types (post-normalization, what gets emitted)
# --------------------------------------------------------------------------- #

@dataclass
class Brand:
    id: str
    name: str
    kind: str                        # "original" | "clone"
    aliases: list = field(default_factory=list)

    def to_json(self) -> dict:
        return {"id": self.id, "name": self.name, "kind": self.kind,
                "aliases": sorted(set(self.aliases))}


@dataclass
class Note:
    id: str
    name: str
    aliases: list = field(default_factory=list)

    def to_json(self) -> dict:
        return {"id": self.id, "name": self.name, "aliases": sorted(set(self.aliases))}


@dataclass
class Accord:
    id: str
    name: str

    def to_json(self) -> dict:
        return {"id": self.id, "name": self.name}


@dataclass
class Fragrance:
    id: str
    brand_id: str
    brand: str
    name: str
    kind: str
    concentration: Optional[str] = None
    gender: Optional[str] = None
    category: Optional[str] = None
    approx_price_inr: Optional[int] = None       # stored in INR
    notes: dict = field(default_factory=lambda: {"top": [], "heart": [], "base": []})
    accords: list = field(default_factory=list)
    source_ids: list = field(default_factory=list)
    dupe_status: str = "unknown"     # matched | designer_original | inspiration_unconfirmed

    def to_json(self) -> dict:
        return {
            "id": self.id,
            "brandId": self.brand_id,
            "brand": self.brand,
            "name": self.name,
            "kind": self.kind,
            "dupeStatus": self.dupe_status,
            "concentration": self.concentration,
            "gender": self.gender,
            "category": self.category,
            "currency": "INR",
            "approxPriceINR": self.approx_price_inr,
            "notes": {
                "top": self.notes.get("top", []),
                "heart": self.notes.get("heart", []),
                "base": self.notes.get("base", []),
            },
            "accords": self.accords,
            "sourceIds": sorted(set(self.source_ids)),
        }


@dataclass
class CloneClaim:
    source_id: str
    source_name: str
    url: Optional[str]
    confidence: int
    reported_similarity: Optional[int]
    note: Optional[str]
    trust_weight: float = 1.0

    def to_json(self) -> dict:
        return {
            "sourceId": self.source_id,
            "sourceName": self.source_name,
            "url": self.url,
            "confidence": self.confidence,
            "reportedSimilarity": self.reported_similarity,
            "note": self.note,
            "trustWeight": self.trust_weight,
        }


@dataclass
class CloneRelationship:
    id: str
    original_fragrance_id: str
    clone_fragrance_id: str
    original: dict                   # {"brand":..,"name":..}
    clone: dict
    category: Optional[str]
    match: dict                      # {"opening","heart","drydown","overall"}
    performance: dict
    price: dict
    confidence: int                  # aggregated from claims
    why_it_matches: list
    differences: list
    confidence_tier: str = "probable"            # confirmed (>=85) | probable (70-84)
    claims: list = field(default_factory=list)   # list[CloneClaim]
    verified: bool = False

    def to_json(self) -> dict:
        # This object is the record required by the spec, with provenance
        # (claims[]) added on top of the required fields.
        return {
            "id": self.id,
            "original": self.original,
            "clone": self.clone,
            "match": self.match,
            "performance": self.performance,
            "price": self.price,          # {"originalApproxINR","cloneApproxINR"}
            "currency": "INR",
            "category": self.category,
            "confidence": self.confidence,
            "confidenceTier": self.confidence_tier,
            "whyItMatches": self.why_it_matches,
            "differences": self.differences,
            "sources": [c.url for c in self.claims if c.url],
            "verified": self.verified,
            # --- provenance extension (does not break the required schema) ---
            "originalFragranceId": self.original_fragrance_id,
            "cloneFragranceId": self.clone_fragrance_id,
            "claims": [c.to_json() for c in self.claims],
        }
