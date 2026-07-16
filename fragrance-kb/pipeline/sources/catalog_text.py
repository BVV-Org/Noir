"""
Adapter for a plain-text catalog listing (data/raw/catalog_expansion_v1.txt).

This source adds fragrances to the CATALOG only -- it asserts no clone
relationships. It exists so a large product list can be onboarded quickly
(brands, product names) without fabricating any "og" mapping. Relationships for
these products are added separately, and only where consensus is strong.

Format:
    # Brand Name      -> sets current brand
    Product Name      -> a fragrance under the current brand
    (blank / #comment lines ignored)
"""
from __future__ import annotations

from .base import SourceAdapter
from ..models import IngestBatch, RawFragrance


class CatalogTextSource(SourceAdapter):
    source_type = "catalog"
    trust_weight = 1.0        # trustworthy for product existence, not for claims

    def __init__(self, path: str, source_id: str = "catalog_expansion_v1"):
        self.path = path
        self.source_id = source_id
        self.source_name = "Catalog expansion (product listing)"

    def load(self) -> IngestBatch:
        fragrances = []
        brand = None
        with open(self.path, encoding="utf-8") as fh:
            for line in fh:
                text = line.strip()
                if not text:
                    continue
                if text.startswith("# "):
                    brand = text[2:].strip()
                    continue
                if text.startswith("#"):
                    continue
                if brand is None:
                    continue
                fragrances.append(RawFragrance(
                    brand=brand, name=text, kind="clone"))
        return IngestBatch(
            source_id=self.source_id, source_name=self.source_name,
            source_type=self.source_type, trust_weight=self.trust_weight,
            fragrances=fragrances, claims=[],
        )
