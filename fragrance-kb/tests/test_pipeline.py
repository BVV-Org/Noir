"""
Runnable test suite (standard library unittest, no deps).

Run:  python -m unittest discover -s tests    (from fragrance-kb/)

Covers the behaviours that most protect data quality:
  * brand / note / name canonicalization
  * fuzzy dedup DOES merge trivial variants but does NOT merge meaningful
    distinctions (Sauvage vs Sauvage Elixir)
  * the built KB never emits a relationship without provenance
  * confidence gate (>= 80) is enforced
  * no duplicate or contradictory relationships
"""
import json
import os
import unittest

from pipeline import normalize as N
from pipeline.dedup import name_similarity, same_fragrance
from pipeline.build import KnowledgeBaseBuilder

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class TestNormalization(unittest.TestCase):
    def test_brand_aliases(self):
        self.assertEqual(N.canonical_brand("MFK"), "Maison Francis Kurkdjian")
        self.assertEqual(N.canonical_brand("ysl"), "Yves Saint Laurent")
        self.assertEqual(N.canonical_brand("FRAGRANCE WORLD"), "Fragrance World")
        self.assertEqual(N.canonical_brand("  armaf "), "Armaf")

    def test_note_aliases(self):
        self.assertEqual(N.canonical_note("agarwood"), "Oud")
        self.assertEqual(N.canonical_note("cassis"), "Blackcurrant")
        self.assertEqual(N.canonical_note("frankincense"), "Olibanum")
        self.assertEqual(N.canonical_note("green tea"), "Green Tea")

    def test_brand_kind(self):
        self.assertEqual(N.brand_kind("Lattafa"), "clone")
        self.assertEqual(N.brand_kind("Creed"), "original")

    def test_ids_are_deterministic(self):
        a = N.fragrance_id("Creed", "Aventus")
        b = N.fragrance_id("Creed", "Aventus")
        self.assertEqual(a, b)
        self.assertEqual(a, "creed__aventus")


class TestFuzzyDedup(unittest.TestCase):
    def test_merges_trivial_variants(self):
        self.assertTrue(same_fragrance("armaf", "Club de Nuit Intense Man",
                                       "armaf", "club de nuit intense man"))

    def test_preserves_meaningful_distinction(self):
        # Sauvage vs Sauvage Elixir must NOT merge.
        self.assertFalse(same_fragrance("dior", "Sauvage", "dior", "Sauvage Elixir"))
        self.assertLess(name_similarity("Sauvage", "Sauvage Elixir"), 0.88)

    def test_different_brands_never_merge(self):
        self.assertFalse(same_fragrance("armaf", "Aventus", "creed", "Aventus"))


class TestBuiltKnowledgeBase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        os.chdir(ROOT)
        cls.builder = KnowledgeBaseBuilder()
        cls.rels = cls.builder.build()

    def test_every_relationship_has_provenance(self):
        for r in self.rels:
            self.assertTrue(r.claims, f"{r.id} has no claims")
            self.assertTrue(any(c.url for c in r.claims),
                            f"{r.id} has no source URL")

    def test_confidence_gate(self):
        for r in self.rels:
            self.assertGreaterEqual(r.confidence, 80)

    def test_no_duplicate_or_contradictory_pairs(self):
        seen = set()
        for r in self.rels:
            pair = (r.original_fragrance_id, r.clone_fragrance_id)
            self.assertNotIn(pair, seen, f"duplicate {pair}")
            self.assertNotIn((pair[1], pair[0]), seen, f"contradictory {pair}")
            seen.add(pair)

    def test_multi_source_merge(self):
        # BR540 -> Barakkat should aggregate >1 source after ingest+dedup.
        target = [r for r in self.rels
                  if r.clone["name"] == "Barakkat Rouge 540"]
        self.assertEqual(len(target), 1)
        self.assertGreaterEqual(len(target[0].claims), 2)

    def test_clone_side_is_a_clone_house(self):
        clone_brands = {b.name for b in self.builder.brands.values()
                        if b.kind == "clone"}
        for r in self.rels:
            self.assertIn(r.clone["brand"], clone_brands,
                          f"{r.id} clone brand not a clone house")


if __name__ == "__main__":
    unittest.main(verbosity=2)
