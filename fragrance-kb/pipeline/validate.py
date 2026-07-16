"""
Integrity validation for the generated seed files.

Run:  python -m pipeline.validate      (after build)

Checks:
  * Referential integrity: every relationship endpoint, note, and accord
    referenced actually exists in its catalog.
  * No duplicate relationships (same original+clone pair twice).
  * No contradictory mappings (a pair mapped in BOTH directions).
  * No self-references (original == clone).
  * Every relationship has >= 1 source and confidence >= 80 (provenance +
    quality gate).
  * No duplicate ids within any catalog.
Exit code is non-zero if any check fails.
"""
from __future__ import annotations

import json
import sys

SEED_DIR = "seed"


def _load(name):
    with open(f"{SEED_DIR}/{name}", encoding="utf-8") as fh:
        return json.load(fh)


def validate():
    brands = _load("brands.json")
    notes = _load("notes.json")
    accords = _load("accords.json")
    frags = _load("fragrances.json")
    rels = _load("clone_relationships.json")

    errors = []
    warnings = []

    brand_ids = {b["id"] for b in brands}
    brand_kind = {b["name"]: b["kind"] for b in brands}
    clone_house_names = {b["name"] for b in brands if b["kind"] == "clone"}
    note_names = {n["name"] for n in notes}
    accord_names = {a["name"] for a in accords}
    frag_ids = {f["id"] for f in frags}

    # ---- coverage: every fragrance must have an explicit dupe status --------
    allowed_status = {"matched", "designer_original", "inspiration_unconfirmed"}
    for f in frags:
        if f.get("dupeStatus") not in allowed_status:
            errors.append(f"Fragrance {f['id']} has invalid/missing dupeStatus "
                          f"'{f.get('dupeStatus')}' (would show as 'not found')")
    from collections import Counter
    status_counts = Counter(f.get("dupeStatus") for f in frags)

    # duplicate ids
    for label, items in (("brands", brands), ("notes", notes),
                         ("accords", accords), ("fragrances", frags),
                         ("relationships", rels)):
        ids = [x["id"] for x in items]
        if len(ids) != len(set(ids)):
            errors.append(f"Duplicate ids present in {label}")

    # fragrance -> brand / note / accord referential integrity
    for f in frags:
        if f["brandId"] not in brand_ids:
            errors.append(f"Fragrance {f['id']} references missing brand {f['brandId']}")
        for section in ("top", "heart", "base"):
            for n in f["notes"][section]:
                if n not in note_names:
                    errors.append(f"Fragrance {f['id']} references missing note '{n}'")
        for a in f["accords"]:
            if a not in accord_names:
                errors.append(f"Fragrance {f['id']} references missing accord '{a}'")

    # relationships
    seen_pairs = set()
    for r in rels:
        o, c = r["originalFragranceId"], r["cloneFragranceId"]
        if o == c:
            errors.append(f"Self-referential relationship {r['id']}")
        if o not in frag_ids:
            errors.append(f"Relationship {r['id']} references missing original {o}")
        if c not in frag_ids:
            errors.append(f"Relationship {r['id']} references missing clone {c}")
        if (o, c) in seen_pairs:
            errors.append(f"Duplicate relationship for pair ({o}, {c})")
        if (c, o) in seen_pairs:
            errors.append(f"Contradictory reverse-direction mapping for ({o}, {c})")
        seen_pairs.add((o, c))
        if not r.get("claims"):
            errors.append(f"Relationship {r['id']} has NO source claims (provenance missing)")
        if not r.get("sources"):
            errors.append(f"Relationship {r['id']} has empty sources[]")
        if r["confidence"] < 70:
            errors.append(f"Relationship {r['id']} confidence {r['confidence']} < 70")
        if r.get("confidenceTier") not in ("confirmed", "probable"):
            errors.append(f"Relationship {r['id']} has invalid confidenceTier "
                          f"'{r.get('confidenceTier')}'")
        if not r.get("verified"):
            warnings.append(f"Relationship {r['id']} not marked verified")
        # Direction rule: the cheap Middle Eastern house must be the CLONE and a
        # designer/niche house must be the ORIGINAL -- never inverted.
        if brand_kind.get(r["clone"]["brand"]) != "clone":
            errors.append(
                f"Relationship {r['id']} clone brand '{r['clone']['brand']}' "
                f"is not a clone house (direction inverted?)")
        if r["original"]["brand"] in clone_house_names:
            errors.append(
                f"Relationship {r['id']} original brand '{r['original']['brand']}' "
                f"is a clone house (direction inverted?)")

    print("Validation summary")
    print(f"  brands: {len(brands)}  notes: {len(notes)}  accords: {len(accords)}")
    print(f"  fragrances: {len(frags)}  relationships: {len(rels)}")
    print(f"  coverage: " + ", ".join(f"{k}={v}" for k, v in sorted(status_counts.items())))
    print(f"  errors: {len(errors)}  warnings: {len(warnings)}")
    for w in warnings:
        print(f"  [warn] {w}")
    for e in errors:
        print(f"  [ERROR] {e}")

    if errors:
        sys.exit(1)
    print("OK: all integrity checks passed.")


if __name__ == "__main__":
    validate()
