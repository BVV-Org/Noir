"""
Fuzzy deduplication.

Two jobs:
  1. Collapse fragrance records that refer to the same real fragrance but were
     spelled slightly differently across sources (after canonicalization has
     already handled the easy cases).
  2. Provide the matcher used to decide whether an incoming (brand, name) pair
     resolves to an existing canonical fragrance.

Matching rule for fragrances: same canonical brand AND a high token-aware
similarity on the name. We deliberately require the brand to match exactly
(post-canonicalization) so we never merge two different houses' scents.

Uses difflib from the standard library (no third-party deps). A token-set ratio
is layered on top so word-order and minor token differences are tolerated while
meaningful distinctions (e.g. "Sauvage" vs "Sauvage Elixir") are preserved.
"""
from __future__ import annotations

import re
from difflib import SequenceMatcher

from .normalize import slugify

# Threshold above which two same-brand names are considered the same fragrance.
NAME_MATCH_THRESHOLD = 0.88


def _tokens(name: str) -> set:
    return set(t for t in re.split(r"[^a-z0-9]+", name.lower()) if t)


def name_similarity(a: str, b: str) -> float:
    """Blend of sequence ratio and token-set (Jaccard) ratio, range 0..1."""
    a_n, b_n = a.strip().lower(), b.strip().lower()
    if not a_n or not b_n:
        return 0.0
    if a_n == b_n:
        return 1.0
    seq = SequenceMatcher(None, a_n, b_n).ratio()
    ta, tb = _tokens(a), _tokens(b)
    jac = len(ta & tb) / len(ta | tb) if (ta | tb) else 0.0
    # If one token set is a strict subset of the other (e.g. "sauvage" vs
    # "sauvage elixir"), that is a MEANINGFUL difference -- cap the score so it
    # does not merge.
    if ta and tb and (ta < tb or tb < ta):
        return min(0.85, 0.5 * seq + 0.5 * jac)
    return 0.5 * seq + 0.5 * jac


def same_fragrance(brand_id_a: str, name_a: str, brand_id_b: str, name_b: str,
                   threshold: float = NAME_MATCH_THRESHOLD) -> bool:
    if brand_id_a != brand_id_b:
        return False
    return name_similarity(name_a, name_b) >= threshold


class FragranceResolver:
    """
    Resolves (brand_id, canonical_name) -> canonical fragrance_id, merging
    fuzzy-duplicate names within the same brand.
    """

    def __init__(self):
        # brand_id -> list of (canonical_name, fragrance_id)
        self._by_brand: dict = {}

    def resolve(self, brand_id: str, canonical_name: str, fragrance_id: str) -> str:
        """
        Return the fragrance_id to use. If a fuzzy-equivalent name already exists
        under the same brand, returns that existing id (the merge target);
        otherwise registers and returns `fragrance_id`.
        """
        existing = self._by_brand.setdefault(brand_id, [])
        for name, fid in existing:
            if name_similarity(canonical_name, name) >= NAME_MATCH_THRESHOLD:
                return fid
        existing.append((canonical_name, fragrance_id))
        return fragrance_id
