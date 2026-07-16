"""
Pipeline configuration.

Currency: the knowledge base stores and displays prices in INR. Source data may
be authored in USD (community price points are usually quoted in USD); the
pipeline converts to INR at build time using the rate below. Update USD_TO_INR
when you re-baseline prices, then rebuild -- all seeds and SQL update together.
"""
from __future__ import annotations

# USD -> INR conversion rate. Verified ~96 in mid-July 2026 (indicative; FX
# drifts, and clone prices are approximate to begin with).
USD_TO_INR = 96.0
CURRENCY = "INR"


def to_inr(usd) -> int:
    """Convert a USD price to a rounded INR integer. Empty/None -> 0."""
    if usd in (None, "", 0):
        return 0
    return int(round(float(usd) * USD_TO_INR))
