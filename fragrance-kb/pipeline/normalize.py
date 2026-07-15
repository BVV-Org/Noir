"""
Normalization layer for the fragrance knowledge base.

Turns messy, source-specific strings (brands, fragrance names, notes, accords)
into stable canonical values + deterministic IDs (slugs).

Design goals:
  * Deterministic: the same input always yields the same canonical value + ID.
  * Extensible: adding a new source never requires schema changes -- at most a
    few new alias entries here.
  * Transparent: every canonicalization is auditable via the alias maps below.

Pure standard library (no third-party deps) so the pipeline runs anywhere.
"""
from __future__ import annotations

import re
import unicodedata

# --------------------------------------------------------------------------- #
# Slugging
# --------------------------------------------------------------------------- #

def slugify(value: str) -> str:
    """lowercase, ascii-fold, collapse non-alphanumerics to single underscores."""
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "_", value)
    return value.strip("_")


def _clean(value: str) -> str:
    """Trim, collapse internal whitespace. Preserves original casing."""
    return re.sub(r"\s+", " ", (value or "").strip())


# --------------------------------------------------------------------------- #
# Brand canonicalization
# --------------------------------------------------------------------------- #
# Keys are slugified aliases -> canonical display name.
# Add new aliases here when a new source uses a different spelling; the schema
# and downstream IDs never change.

BRAND_ALIASES = {
    # --- Original / luxury houses ---
    "mfk": "Maison Francis Kurkdjian",
    "maison_francis_kurkdjian": "Maison Francis Kurkdjian",
    "francis_kurkdjian": "Maison Francis Kurkdjian",
    "ysl": "Yves Saint Laurent",
    "yves_saint_laurent": "Yves Saint Laurent",
    "yves_saint_laurent_ysl": "Yves Saint Laurent",
    "pdm": "Parfums de Marly",
    "parfums_de_marly": "Parfums de Marly",
    "lv": "Louis Vuitton",
    "louis_vuitton": "Louis Vuitton",
    "kilian": "By Kilian",
    "by_kilian": "By Kilian",
    "kilian_paris": "By Kilian",
    "jpg": "Jean Paul Gaultier",
    "jean_paul_gaultier": "Jean Paul Gaultier",
    "d_g": "Dolce & Gabbana",
    "dg": "Dolce & Gabbana",
    "dolce_gabbana": "Dolce & Gabbana",
    "dolce_and_gabbana": "Dolce & Gabbana",
    "tf": "Tom Ford",
    "tom_ford": "Tom Ford",
    "creed": "Creed",
    "dior": "Dior",
    "christian_dior": "Dior",
    "chanel": "Chanel",
    "xerjoff": "Xerjoff",
    "roja": "Roja Parfums",
    "roja_parfums": "Roja Parfums",
    "amouage": "Amouage",
    "guerlain": "Guerlain",
    "initio": "Initio",
    "initio_parfums_prives": "Initio",
    "mancera": "Mancera",
    "montale": "Montale",
    "memo": "Memo Paris",
    "memo_paris": "Memo Paris",
    "penhaligons": "Penhaligon's",
    "nishane": "Nishane",
    "bvlgari": "Bvlgari",
    "bulgari": "Bvlgari",
    "hermes": "Hermes",
    "prada": "Prada",
    "armani": "Giorgio Armani",
    "giorgio_armani": "Giorgio Armani",
    "versace": "Versace",
    "valentino": "Valentino",
    "givenchy": "Givenchy",
    # --- Clone / Middle Eastern houses ---
    "lattafa": "Lattafa",
    "lattafa_perfumes": "Lattafa",
    "maison_alhambra": "Maison Alhambra",
    "alhambra": "Maison Alhambra",
    "fragrance_world": "Fragrance World",
    "armaf": "Armaf",
    "afnan": "Afnan",
    "paris_corner": "Paris Corner",
    "al_haramain": "Al Haramain",
    "al_haramain_perfumes": "Al Haramain",
    "haramain": "Al Haramain",
    "swiss_arabian": "Swiss Arabian",
    "rasasi": "Rasasi",
    "ahmed_al_maghribi": "Ahmed Al Maghribi",
    "khadlaj": "Khadlaj",
    "ard_al_zaafaran": "Ard Al Zaafaran",
    "emir": "Emir",
    "zimaya": "Zimaya",
    "riiffs": "Riiffs",
    "pendora_scents": "Pendora Scents",
    "pendora": "Pendora Scents",
    "orientica": "Orientica",
    "rayhaan": "Rayhaan",
    "nusuk": "Nusuk",
}

# Which houses are "clone" houses vs "original/luxury" houses. Used only for
# tagging brands.json; a brand can still appear on either side of a claim.
CLONE_HOUSES = {
    "Lattafa", "Maison Alhambra", "Fragrance World", "Armaf", "Afnan",
    "Paris Corner", "Al Haramain", "Swiss Arabian", "Rasasi",
    "Ahmed Al Maghribi", "Khadlaj", "Ard Al Zaafaran", "Emir", "Zimaya",
    "Riiffs", "Pendora Scents", "Orientica", "Rayhaan", "Nusuk",
}


def canonical_brand(raw: str) -> str:
    """Return the canonical display name for a brand string."""
    cleaned = _clean(raw)
    key = slugify(cleaned)
    if key in BRAND_ALIASES:
        return BRAND_ALIASES[key]
    # Unknown brand: title-case it and keep going. Nothing breaks; it simply
    # becomes its own canonical entry. (Register an alias later if desired.)
    return cleaned


def brand_kind(canonical: str) -> str:
    return "clone" if canonical in CLONE_HOUSES else "original"


# --------------------------------------------------------------------------- #
# Note canonicalization
# --------------------------------------------------------------------------- #

NOTE_ALIASES = {
    "agarwood": "Oud",
    "oud": "Oud",
    "oudh": "Oud",
    "mandarin": "Mandarin Orange",
    "mandarin_orange": "Mandarin Orange",
    "black_currant": "Blackcurrant",
    "blackcurrant": "Blackcurrant",
    "cassis": "Blackcurrant",
    "ambrox": "Ambroxan",
    "ambroxan": "Ambroxan",
    "amberxan": "Ambroxan",
    "amber_wood": "Amberwood",
    "amberwood": "Amberwood",
    "tonka": "Tonka Bean",
    "tonka_bean": "Tonka Bean",
    "guaiac": "Guaiac Wood",
    "gaiac": "Guaiac Wood",
    "guaiac_wood": "Guaiac Wood",
    "gaiac_wood": "Guaiac Wood",
    "frankincense": "Olibanum",
    "olibanum": "Olibanum",
    "sichuan_pepper": "Sichuan Pepper",
    "szechuan_pepper": "Sichuan Pepper",
    "pink_pepper": "Pink Pepper",
    "labdanum": "Labdanum",
    "cistus": "Cistus",
    "bergamote": "Bergamot",
    "bergamot": "Bergamot",
}


def canonical_note(raw: str) -> str:
    cleaned = _clean(raw)
    key = slugify(cleaned)
    if key in NOTE_ALIASES:
        return NOTE_ALIASES[key]
    # Default: Title Case each word (keeps things like "Green Tea" tidy).
    return " ".join(w.capitalize() for w in cleaned.split())


# --------------------------------------------------------------------------- #
# Accord canonicalization
# --------------------------------------------------------------------------- #

ACCORD_ALIASES = {
    "fresh_spicy": "Fresh Spicy",
    "warm_spicy": "Warm Spicy",
    "amber": "Amber",
    "woody": "Woody",
    "sweet": "Sweet",
    "gourmand": "Gourmand",
    "citrus": "Citrus",
    "aromatic": "Aromatic",
    "chypre": "Chypre",
    "fruity": "Fruity",
    "smoky": "Smoky",
    "floral": "Floral",
    "vanilla": "Vanilla",
    "powdery": "Powdery",
    "tobacco": "Tobacco",
    "green": "Green",
    "musky": "Musky",
    "oud": "Oud",
    "tea": "Tea",
    "boozy": "Boozy",
    "spicy": "Spicy",
}


def canonical_accord(raw: str) -> str:
    cleaned = _clean(raw)
    key = slugify(cleaned)
    if key in ACCORD_ALIASES:
        return ACCORD_ALIASES[key]
    return " ".join(w.capitalize() for w in cleaned.split())


# --------------------------------------------------------------------------- #
# Fragrance name canonicalization
# --------------------------------------------------------------------------- #
# Names are trickier: we do NOT want to lose meaningful distinctions
# (e.g. "Sauvage" vs "Sauvage Elixir"). So name canonicalization is light:
# whitespace + a small alias map for well-known abbreviations. Fuzzy merging of
# near-identical names within the same brand is handled separately in dedup.py.

NAME_ALIASES = {
    ("Yves Saint Laurent", "y edp"): "Y Eau de Parfum",
    ("Yves Saint Laurent", "y eau de parfum"): "Y Eau de Parfum",
    ("Maison Francis Kurkdjian", "br540"): "Baccarat Rouge 540",
    ("Maison Francis Kurkdjian", "baccarat rouge 540"): "Baccarat Rouge 540",
    ("Lattafa", "badee al oud oud for glory"): "Bade'e Al Oud Oud for Glory",
    ("Lattafa", "bade'e al oud oud for glory"): "Bade'e Al Oud Oud for Glory",
}


def canonical_name(brand_canonical: str, raw: str) -> str:
    cleaned = _clean(raw)
    key = (brand_canonical, cleaned.lower())
    if key in NAME_ALIASES:
        return NAME_ALIASES[key]
    return cleaned


# --------------------------------------------------------------------------- #
# ID builders
# --------------------------------------------------------------------------- #

def brand_id(canonical_brand_name: str) -> str:
    return slugify(canonical_brand_name)


def fragrance_id(canonical_brand_name: str, canonical_fragrance_name: str) -> str:
    return f"{slugify(canonical_brand_name)}__{slugify(canonical_fragrance_name)}"


def note_id(canonical_note_name: str) -> str:
    return slugify(canonical_note_name)


def accord_id(canonical_accord_name: str) -> str:
    return slugify(canonical_accord_name)


def relationship_id(original_fragrance_id: str, clone_fragrance_id: str) -> str:
    return f"rel__{original_fragrance_id}__x__{clone_fragrance_id}"
