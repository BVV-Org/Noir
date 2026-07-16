"""
Pipeline orchestrator: sources -> normalize -> dedup -> aggregate -> seed JSON.

Run:  python -m pipeline.build            (from the fragrance-kb/ directory)

Emits into seed/:
  brands.json, notes.json, accords.json, fragrances.json, clone_relationships.json

Guarantees enforced here:
  * A clone relationship is emitted ONLY if it is backed by >= 1 attributed
    claim. Nothing is fabricated.
  * Confidence and match figures are AGGREGATED from claims, never invented.
  * Relationships below MIN_CONFIDENCE are dropped (spec: below 80 => omit).
"""
from __future__ import annotations

import json
import os
from collections import defaultdict

from . import normalize as N
from . import config
from .dedup import FragranceResolver
from .models import (Brand, Note, Accord, Fragrance, CloneClaim, CloneRelationship)
from .sources import ALL_SOURCES

MIN_CONFIDENCE = 80          # spec: omit anything below 80
SEED_DIR = "seed"


# --------------------------------------------------------------------------- #

class KnowledgeBaseBuilder:
    def __init__(self, sources=None):
        self.sources = sources if sources is not None else ALL_SOURCES
        self.brands: dict = {}          # brand_id -> Brand
        self.notes: dict = {}           # note_id -> Note
        self.accords: dict = {}         # accord_id -> Accord
        self.fragrances: dict = {}      # fragrance_id -> Fragrance
        self.resolver = FragranceResolver()
        self._source_trust: dict = {}   # source_id -> trust_weight
        # relationship_key (orig_fid, clone_fid) -> aggregation dict
        self._rel_acc: dict = {}
        self.report = defaultdict(int)

    # ---- brand / note / accord registration -------------------------------- #

    def _register_brand(self, raw_brand: str) -> Brand:
        canonical = N.canonical_brand(raw_brand)
        bid = N.brand_id(canonical)
        brand = self.brands.get(bid)
        if brand is None:
            brand = Brand(id=bid, name=canonical, kind=N.brand_kind(canonical))
            self.brands[bid] = brand
        if raw_brand.strip() and raw_brand.strip() != canonical:
            brand.aliases.append(raw_brand.strip())
        return brand

    def _register_note(self, raw_note: str) -> str:
        canonical = N.canonical_note(raw_note)
        nid = N.note_id(canonical)
        note = self.notes.get(nid)
        if note is None:
            self.notes[nid] = Note(id=nid, name=canonical)
        if raw_note.strip() and raw_note.strip() != canonical:
            self.notes[nid].aliases.append(raw_note.strip())
        return canonical

    def _register_accord(self, raw_accord: str) -> str:
        canonical = N.canonical_accord(raw_accord)
        aid = N.accord_id(canonical)
        if aid not in self.accords:
            self.accords[aid] = Accord(id=aid, name=canonical)
        return canonical

    # ---- fragrance registration + fuzzy dedup ------------------------------ #

    def _register_fragrance(self, raw, source_id: str) -> str:
        brand = self._register_brand(raw.brand)
        cname = N.canonical_name(brand.name, raw.name)
        tentative_id = N.fragrance_id(brand.name, cname)
        fid = self.resolver.resolve(brand.id, cname, tentative_id)

        frag = self.fragrances.get(fid)
        top = [self._register_note(n) for n in raw.notes_top]
        heart = [self._register_note(n) for n in raw.notes_heart]
        base = [self._register_note(n) for n in raw.notes_base]
        accords = [self._register_accord(a) for a in raw.accords]

        if frag is None:
            frag = Fragrance(
                id=fid, brand_id=brand.id, brand=brand.name, name=cname,
                kind=raw.kind or "unknown", concentration=raw.concentration,
                gender=raw.gender, category=raw.category,
                approx_price_inr=config.to_inr(raw.approx_price_usd) or None,
                notes={"top": top, "heart": heart, "base": base},
                accords=accords, source_ids=[source_id],
            )
            self.fragrances[fid] = frag
        else:
            # Enrich existing record: prefer to FILL empties, never overwrite a
            # known 'original'/'clone' kind with 'unknown' from a weaker source.
            frag.source_ids.append(source_id)
            if frag.kind in (None, "unknown") and raw.kind not in (None, "unknown"):
                frag.kind = raw.kind
            for attr, val in (("concentration", raw.concentration),
                              ("gender", raw.gender),
                              ("category", raw.category),
                              ("approx_price_inr", config.to_inr(raw.approx_price_usd))):
                if getattr(frag, attr) in (None, "", 0) and val not in (None, "", 0):
                    setattr(frag, attr, val)
            if not frag.notes["top"] and top:
                frag.notes["top"] = top
            if not frag.notes["heart"] and heart:
                frag.notes["heart"] = heart
            if not frag.notes["base"] and base:
                frag.notes["base"] = base
            if not frag.accords and accords:
                frag.accords = accords
        return fid

    # ---- claim aggregation ------------------------------------------------- #

    def _add_claim(self, raw_claim, orig_fid, clone_fid, trust_weight):
        key = (orig_fid, clone_fid)
        acc = self._rel_acc.get(key)
        if acc is None:
            acc = {
                "orig_fid": orig_fid, "clone_fid": clone_fid,
                "category": raw_claim.category,
                "claims": [], "seen_sources": set(),
                "match": {"opening": [], "heart": [], "drydown": [], "overall": []},
                "performance": None, "price": None,
                "why": [], "diff": [],
            }
            self._rel_acc[key] = acc

        # De-duplicate identical (source_id, url) claims across ingest batches.
        sig = (raw_claim.source_id, raw_claim.source_url)
        if sig in acc["seen_sources"]:
            self.report["duplicate_claims_skipped"] += 1
            return
        acc["seen_sources"].add(sig)

        acc["claims"].append(CloneClaim(
            source_id=raw_claim.source_id, source_name=raw_claim.source_name,
            url=raw_claim.source_url, confidence=raw_claim.confidence,
            reported_similarity=raw_claim.reported_similarity, note=raw_claim.note,
            trust_weight=trust_weight,
        ))
        for k in ("opening", "heart", "drydown", "overall"):
            v = getattr(raw_claim, f"match_{k}")
            if v is not None:
                acc["match"][k].append((v, trust_weight))
        if raw_claim.performance and acc["performance"] is None:
            acc["performance"] = raw_claim.performance
        if raw_claim.price and acc["price"] is None:
            acc["price"] = raw_claim.price
        if raw_claim.why_it_matches and not acc["why"]:
            acc["why"] = raw_claim.why_it_matches
        if raw_claim.differences and not acc["diff"]:
            acc["diff"] = raw_claim.differences
        if acc["category"] is None:
            acc["category"] = raw_claim.category

    # ---- run --------------------------------------------------------------- #

    def build(self):
        for source in self.sources:
            batch = source.load()
            self._source_trust[batch.source_id] = batch.trust_weight
            self.report["sources_loaded"] += 1
            for raw in batch.fragrances:
                self._register_fragrance(raw, batch.source_id)
            for claim in batch.claims:
                # resolve both endpoints to canonical fragrance ids (fuzzy)
                ob = self._register_brand(claim.original_brand)
                cb = self._register_brand(claim.clone_brand)
                oname = N.canonical_name(ob.name, claim.original_name)
                cname = N.canonical_name(cb.name, claim.clone_name)
                o_tent = N.fragrance_id(ob.name, oname)
                c_tent = N.fragrance_id(cb.name, cname)
                orig_fid = self.resolver.resolve(ob.id, oname, o_tent)
                clone_fid = self.resolver.resolve(cb.id, cname, c_tent)
                self._add_claim(claim, orig_fid, clone_fid,
                                self._source_trust[batch.source_id])
                self.report["claims_ingested"] += 1

        relationships = self._finalize_relationships()
        return relationships

    def _finalize_relationships(self):
        rels = []
        for (okey, ckey), acc in self._rel_acc.items():
            claims = acc["claims"]
            # Aggregate confidence: trust-weighted max is conservative and
            # defensible -- the relationship is as strong as its strongest
            # attributed source, discounted by that source's trust weight.
            confidence = max(
                int(round(c.confidence)) for c in claims
            )
            weighted_conf = max(
                int(round(c.confidence * c.trust_weight)) for c in claims
            )
            # Use the trust-discounted value as the gate but report the headline
            # confidence from the strongest fully-trusted claim if present.
            fully_trusted = [c for c in claims if c.trust_weight >= 0.999]
            headline = max((c.confidence for c in fully_trusted), default=weighted_conf)

            if headline < MIN_CONFIDENCE:
                self.report["relationships_dropped_low_confidence"] += 1
                continue

            match = {k: _weighted_avg(acc["match"][k])
                     for k in ("opening", "heart", "drydown", "overall")}
            orig = self.fragrances[acc["orig_fid"]]
            clone = self.fragrances[acc["clone_fid"]]
            perf = acc["performance"] or {
                "longevityComparison": "", "projectionComparison": "",
                "sillageComparison": ""}
            # Price is derived from the (already INR-converted) fragrance prices,
            # so the relationship price and the fragrance catalog never disagree.
            price = {
                "originalApproxINR": orig.approx_price_inr or 0,
                "cloneApproxINR": clone.approx_price_inr or 0}

            rel = CloneRelationship(
                id=N.relationship_id(acc["orig_fid"], acc["clone_fid"]),
                original_fragrance_id=acc["orig_fid"],
                clone_fragrance_id=acc["clone_fid"],
                original={"brand": orig.brand, "name": orig.name},
                clone={"brand": clone.brand, "name": clone.name},
                category=acc["category"] or orig.category,
                match=match, performance=perf, price=price,
                confidence=headline, why_it_matches=acc["why"],
                differences=acc["diff"],
                claims=sorted(claims, key=lambda c: -c.confidence),
                verified=True,      # every emitted rel is source-backed
            )
            rels.append(rel)
            self.report["relationships_emitted"] += 1
        rels.sort(key=lambda r: (-r.confidence, r.original["brand"], r.original["name"]))
        return rels

    # ---- output ------------------------------------------------------------ #

    def write_seeds(self, relationships, out_dir=SEED_DIR):
        os.makedirs(out_dir, exist_ok=True)
        _dump(os.path.join(out_dir, "brands.json"),
              [b.to_json() for b in _sorted(self.brands, key=lambda b: b.name)])
        _dump(os.path.join(out_dir, "notes.json"),
              [n.to_json() for n in _sorted(self.notes, key=lambda n: n.name)])
        _dump(os.path.join(out_dir, "accords.json"),
              [a.to_json() for a in _sorted(self.accords, key=lambda a: a.name)])
        _dump(os.path.join(out_dir, "fragrances.json"),
              [f.to_json() for f in _sorted(self.fragrances,
                                            key=lambda f: (f.brand, f.name))])
        _dump(os.path.join(out_dir, "clone_relationships.json"),
              [r.to_json() for r in relationships])


def _weighted_avg(pairs):
    if not pairs:
        return 0
    num = sum(v * w for v, w in pairs)
    den = sum(w for _, w in pairs)
    return int(round(num / den)) if den else 0


def _sorted(d, key):
    return sorted(d.values(), key=key)


def _dump(path, obj):
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, ensure_ascii=False, indent=2)
        fh.write("\n")


def main():
    builder = KnowledgeBaseBuilder()
    rels = builder.build()
    builder.write_seeds(rels)
    print("Build report:")
    for k in sorted(builder.report):
        print(f"  {k}: {builder.report[k]}")
    print(f"  brands: {len(builder.brands)}")
    print(f"  fragrances: {len(builder.fragrances)}")
    print(f"  notes: {len(builder.notes)}")
    print(f"  accords: {len(builder.accords)}")
    print(f"  relationships: {len(rels)}")


if __name__ == "__main__":
    main()
