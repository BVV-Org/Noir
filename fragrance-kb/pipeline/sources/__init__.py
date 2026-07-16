"""
Source adapters.

To add a NEW source of fragrance/clone data:
  1. Create a module here that subclasses `SourceAdapter` (see base.py).
  2. Implement `load() -> IngestBatch`.
  3. Register the adapter instance in `ALL_SOURCES` below.

That is the ONLY code change required. The canonical schema, IDs, dedup logic,
seed files, and SQL import never change. This is the extensibility contract.
"""
from .curated_json import CuratedJsonSource
from .community_csv import CommunityCsvSource
from .catalog_text import CatalogTextSource

# Registered sources, in ascending trust order is not required -- the pipeline
# sorts by trust_weight where it matters. List every source you want ingested.
ALL_SOURCES = [
    CuratedJsonSource("data/raw/curated_v1.json"),
    CuratedJsonSource("data/raw/curated_v2.json"),
    CuratedJsonSource("data/raw/curated_v3.json"),
    CommunityCsvSource("data/raw/community_votes_v1.csv"),
    CatalogTextSource("data/raw/catalog_expansion_v1.txt"),
]
