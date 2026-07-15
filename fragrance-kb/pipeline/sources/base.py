"""Abstract source adapter."""
from __future__ import annotations

import abc

from ..models import IngestBatch


class SourceAdapter(abc.ABC):
    """A source of fragrance + clone-claim data.

    Implementations parse whatever native format the source uses (JSON, CSV,
    scraped rows, an API response, ...) and return a normalized `IngestBatch`.
    They must NOT fabricate relationships: only emit claims the source actually
    asserts, and always attach source attribution.
    """

    source_id: str
    source_name: str
    source_type: str
    trust_weight: float = 1.0

    @abc.abstractmethod
    def load(self) -> IngestBatch:  # pragma: no cover - interface
        raise NotImplementedError
