"""
Adapter for a community-votes CSV source (data/raw/community_votes_v1.csv).

Demonstrates the extensibility contract: a completely different file format and
a lower trust weight, wired in with zero schema changes. Its rows deliberately
overlap with the curated source (messy casing, brand aliases) so the pipeline's
normalization + dedup + multi-claim merging can be observed end-to-end.
"""
from __future__ import annotations

import csv

from .base import SourceAdapter
from ..models import IngestBatch, RawFragrance, RawClaim


class CommunityCsvSource(SourceAdapter):
    source_type = "community"
    trust_weight = 0.6            # community votes trusted less than curation

    def __init__(self, path: str):
        self.path = path
        self.source_id = "community_votes"
        self.source_name = "Community Votes (aggregated)"

    def load(self) -> IngestBatch:
        fragrances = []
        claims = []
        with open(self.path, newline="", encoding="utf-8") as fh:
            for row in csv.DictReader(fh):
                overall = _to_int(row.get("overall_match"))
                # Register both fragrances (kind unknown from a vote source;
                # the merge step keeps richer 'original'/'clone' kinds from
                # higher-trust sources).
                fragrances.append(RawFragrance(
                    brand=row["original_brand"], name=row["original_name"],
                    kind="original", category=row.get("category")))
                fragrances.append(RawFragrance(
                    brand=row["clone_brand"], name=row["clone_name"],
                    kind="clone", category=row.get("category")))
                claims.append(RawClaim(
                    original_brand=row["original_brand"], original_name=row["original_name"],
                    clone_brand=row["clone_brand"], clone_name=row["clone_name"],
                    category=row.get("category"),
                    match_opening=None, match_heart=None, match_drydown=None,
                    match_overall=overall,
                    confidence=_to_int(row.get("confidence")) or 0,
                    source_id=row.get("source_id") or self.source_id,
                    source_name=row.get("source_name") or self.source_name,
                    source_url=row.get("source_url"),
                    note=row.get("note"),
                    reported_similarity=overall,
                ))
        return IngestBatch(
            source_id=self.source_id, source_name=self.source_name,
            source_type=self.source_type, trust_weight=self.trust_weight,
            fragrances=fragrances, claims=claims,
        )


def _to_int(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None
