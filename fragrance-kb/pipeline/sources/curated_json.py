"""Adapter for the curated JSON source (data/raw/curated_v1.json)."""
from __future__ import annotations

import json

from .base import SourceAdapter
from ..models import IngestBatch, RawFragrance, RawClaim


class CuratedJsonSource(SourceAdapter):
    source_type = "curated"

    def __init__(self, path: str):
        self.path = path

    def load(self) -> IngestBatch:
        with open(self.path, "r", encoding="utf-8") as fh:
            raw = json.load(fh)

        meta = raw["source_meta"]
        self.source_id = meta["source_id"]
        self.source_name = meta["source_name"]
        self.source_type = meta.get("source_type", "curated")
        self.trust_weight = float(meta.get("trust_weight", 1.0))

        frags_by_key = raw["fragrances"]

        fragrances = []
        for key, f in frags_by_key.items():
            notes = f.get("notes", {})
            fragrances.append(RawFragrance(
                brand=f["brand"], name=f["name"], kind=f.get("kind", "unknown"),
                concentration=f.get("concentration"), gender=f.get("gender"),
                category=f.get("category"), approx_price_usd=f.get("approxPriceUSD"),
                notes_top=notes.get("top", []), notes_heart=notes.get("heart", []),
                notes_base=notes.get("base", []), accords=f.get("accords", []),
            ))

        claims = []
        for rel in raw["relationships"]:
            o = frags_by_key[rel["original"]]
            c = frags_by_key[rel["clone"]]
            match = rel.get("match", {})
            price = {
                "originalApproxUSD": o.get("approxPriceUSD", 0),
                "cloneApproxUSD": c.get("approxPriceUSD", 0),
            }
            for claim in rel["claims"]:
                claims.append(RawClaim(
                    original_brand=o["brand"], original_name=o["name"],
                    clone_brand=c["brand"], clone_name=c["name"],
                    category=rel.get("category"),
                    match_opening=match.get("opening"), match_heart=match.get("heart"),
                    match_drydown=match.get("drydown"), match_overall=match.get("overall"),
                    confidence=int(claim["confidence"]),
                    source_id=claim["source_id"], source_name=claim["source_name"],
                    source_url=claim.get("url"), note=claim.get("note"),
                    reported_similarity=claim.get("reported_similarity"),
                    performance=rel.get("performance"), price=price,
                    why_it_matches=rel.get("whyItMatches", []),
                    differences=rel.get("differences", []),
                ))

        return IngestBatch(
            source_id=self.source_id, source_name=self.source_name,
            source_type=self.source_type, trust_weight=self.trust_weight,
            fragrances=fragrances, claims=claims,
        )
