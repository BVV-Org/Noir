# Noir Vault · Fragrance KB — Batch 4 Report

**Batch:** 4 of 5 · **Generated:** 2026-07-17
**Contents:** Arabiyat Prestige #31–58 (28) + French Avenue cluster 1 (18)
**Status:** production-ready, all 14 integrity checks passing (0 failures)

---

## Coverage numbers

| Metric | This batch | Cumulative |
|---|---|---|
| Target fragrances processed | 46 | **162** |
| Relationships created | 47 | **172** |
| VERIFIED_CLONE | 1 | 12 |
| INSPIRED_BY | 16 | 69 |
| HYBRID_DNA | 2 | 8 |
| SIMILAR_DNA | 4 | 15 |
| ORIGINAL_DNA | 24 | 68 |
| Cross-validated (`verified=1`) | — | 22 |
| Brands in graph | — | 36 |

French Avenue (a Fragrance World sub-brand) is a dedicated clone house, so it added
many clean INSPIRED_BY edges; Arabiyat's second half remains original-heavy.

## Highlights found this batch

| Fragrance | Relationship | Target |
|---|---|---|
| French Avenue Royal Blend | VERIFIED_CLONE | Kilian Angels' Share (~85%) |
| French Avenue Liquid Brun | INSPIRED_BY | PdM Althair (near-1:1) |
| French Avenue Aether | INSPIRED_BY | PdM Greenly |
| French Avenue Spectre Ghost | INSPIRED_BY | Nishane Ani |
| French Avenue Spectre Wraith | INSPIRED_BY | Kilian Black Phantom |
| French Avenue Azzure Oud | INSPIRED_BY | Maison Crivelli Oud Maracuja (~96%) |
| French Avenue Cocoa Morado | INSPIRED_BY | Maison Crivelli Oud Cadenza |
| French Avenue Pinnace Oryn | INSPIRED_BY | LV Afternoon Swim |
| French Avenue Pinnace Noir | INSPIRED_BY | Hugo Boss Bottled |
| Arabiyat Portrait Café Noir | HYBRID_DNA | Creed Aventus × Baccarat Rouge 540 |
| Arabiyat Nayel Oud | INSPIRED_BY | YSL Tuxedo (~98%) |
| Arabiyat Nashwa Smoke | INSPIRED_BY | Bvlgari Le Gemme Onekh |
| Arabiyat Raees Twilight Aura | INSPIRED_BY | Xerjoff Erba Pura |
| Arabiyat Safa | INSPIRED_BY | PdM Delina Exclusif |

---

## Honesty flags

- **Two list entries look like conflated names.** "Spectre Pinnace" and "Meringue Luscious"
  don't exist as single French Avenue releases — each appears to merge two real products
  (Spectre + Pinnace; Meringue + Luscious). I recorded each faithfully but set `needs_review=1`
  and documented the likely split in the evidence field. **Please confirm whether you want these
  as one product each or split into two.**
- **Portrait Azure data discrepancy:** reviewers call it a Sauvage Elixir clone, but Fragrantica's
  published pyramid (red fruits/lychee/gourmand) doesn't match Sauvage Elixir's spicy profile.
  Stored as INSPIRED_BY with the discrepancy flagged.
- **Royal Blend Vintage** names "Old Fashioned" as its target, which isn't a confirmable release;
  stored as ORIGINAL_DNA with the claim noted rather than inventing a reference node.
- Arabiyat's remaining flankers (Nashwa Noir/Oud, Nayel King/Queen, Nyla line, Ramad line, Swar
  line, Uhud, etc.) are genuinely original or undocumented and are stored as ORIGINAL_DNA /
  `needs_review`. All carry accords, so none are blank "awaiting data".
- The 9 "awaiting scent data" placeholders (7 unverified Rayhaan names + Hawas Rouge + Yanis)
  from Batch 2 are unchanged.

---

## Cumulative KB
Afnan (20) · Lattafa (20) · Rayhaan (18) · Rasasi (28) · Arabiyat Prestige (58 ✓ complete) ·
French Avenue (18 of 36) = **162 fragrances**, 172 relationships, 36 brands.

## Next
Say **"Proceed to Batch 5"** for the **final batch**: remaining French Avenue (18 — Essence,
Miraj, Moonstone, Vulcan, Zenith, Veneno lines) + all **Aromatix × French Avenue** (10).
That completes the target catalogue.
