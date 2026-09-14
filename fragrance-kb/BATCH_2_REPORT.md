# Noir Vault · Fragrance KB — Batch 2 Report

**Batch:** 2 of 5 · **New brands:** Rayhaan, Rasasi · **Generated:** 2026-07-17
**Status:** production-ready, all 13 integrity checks passing (0 failures)
**Also in this batch:** user-confirmed correction — **Afnan Turathi Blue → Bvlgari Le Gemme Tygar** (was ORIGINAL_DNA, now a cross-validated INSPIRED_BY).

---

## Engine change (why this was safe)

The Batch 1 builder was refactored into a reusable engine (`build_kb`) inside `build_batch1.py`.
Batch 2 (`build_batch2.py`) calls it with the Rayhaan + Rasasi data appended, so the whole DB
is regenerated deterministically **from code**. Because code is the single source of truth,
every validated Batch 1 relationship is preserved exactly — nothing is silently overwritten,
and re-running is idempotent.

---

## Coverage numbers

| Metric | This batch | Cumulative |
|---|---|---|
| Target fragrances processed | 46 (18 Rayhaan + 28 Rasasi) | **86** |
| Relationships created | 48 | **94** |
| Reference targets in graph | +18 | 44 |
| VERIFIED_CLONE | 5 | 11 |
| INSPIRED_BY | 20 | 44 |
| HYBRID_DNA | 0 | 6 |
| SIMILAR_DNA | 2 | 9 |
| ORIGINAL_DNA | 21 | 24 |
| Cross-validated (`verified=1`) | — | 21 |
| Brands in graph | — | 30 (4 target + 26 reference houses) |
| Notes / accords catalogued | — | see exports |

---

## Batch 2 verified clones (cross-validated, ≥2 sources)

| Fragrance | Clone of | Overall | Confidence |
|---|---|---|---|
| Rayhaan Pacific Aura | Louis Vuitton Pacific Chill | 0.86 | 0.80 |
| Rayhaan Corium | Emporio Armani Stronger With You Leather | 0.85 | 0.75 |
| Rasasi Hawas Black | Nishane Hacivat | 0.76 | 0.68 |
| Rasasi La Yuqawam Homme | Tom Ford Tuscan Leather | 0.80 | 0.75 |
| Rasasi La Yuqawam Ambergris Showers | Memo Paris Irish Leather | 0.85 | 0.70 |

## Notable INSPIRED_BY

Rasasi Hawas for Him → **Paco Rabanne Invictus** (see myth note below) · Hawas Ice → Invictus Aqua ·
Hawas Eclat → PdM Delina · Hawas Chrome → Xerjoff Erba Pura · Rayhaan Imperia → Creed Aventus ·
Rayhaan Lion → JPG Ultra Male · Rayhaan Tiger → Nishane Halfeti · Rayhaan Crimson → Creed Centaurus ·
Rayhaan Elixir → JPG Le Male Elixir (conflicts with Spicebomb — flagged) · Daarej → Valentino V pour Homme ·
Fattan → Terre d'Hermès · Al Wisam Day → Creed Silver Mountain Water · La Yuqawam Tobacco Blaze → Tuscan Leather.

## ORIGINAL_DNA / no verified target (closest DNA exposed)

Rasasi: Hawas Elixir, Hawas Tropical, Hawas Viper, Hawas Pink, Hawas Exotic, Hawas Lava Gold,
Hawas Glitz, Hawas Highness, Hawas Addiction, Al Wisam Evening, Shuhrah Pour Homme.
Rayhaan: Ocean Rush.

---

## Honesty flags — read before shipping

**The Hawas–Aventus myth, corrected.** Community shorthand calls Rasasi Hawas an "Aventus clone."
It is not — Hawas is a Paco Rabanne **Invictus**-profile aquatic-fruity (different fragrance family).
The KB records Invictus as the inspiration and states the Aventus label is a myth in `honest_differences`.

**9 catalogue entries could not be verified as real releases / have no scent data** and are stored as
flagged placeholders (family "Unverified", no accords, `needs_review=1`, confidence ≤0.10). They must
NOT be surfaced in user-facing features until confirmed:
Rayhaan Panther, Rayhaan Cobra, Rayhaan Black, Rayhaan Ruby, Rayhaan Sapphire, Rayhaan Topaze, Rayhaan Noor,
Rasasi Hawas Rouge, Rasasi Yanis 12:01 AM.

  - None of the seven Rayhaan gemstone/animal names (Panther/Cobra/Black/Ruby/Sapphire/Topaze/Noor)
    appear in Fragrantica/Parfumo. Verified Rayhaan releases in this space use different names
    (Lion, Tiger, Wolf, Obsidian, Terra, Italia, Aquatica, Pharaoh, Divine). **Please confirm these
    seven product identities** — they may be regional names, mislabels, or belong to another brand.

**Conflicting evidence, represented not resolved.** Rayhaan Elixir is INSPIRED_BY JPG Le Male Elixir
(note-supported) but several roundups call it a Spicebomb take — confidence is held low with both views
recorded. Rayhaan Pacific (2022) is dated before its supposed target LV Pacific Chill (2023); flagged.

**Unconfirmed target houses** (comparison named by reviewers but house not pinned down): Hawas Tropical
("Paradise Garden"), Hawas Viper ("Terroni / OP"). Stored as ORIGINAL_DNA with the claim in evidence text.

---

## Cumulative KB now covers
Afnan (20) · Lattafa (20) · Rayhaan (18) · Rasasi (28) = **86 fragrances**, 94 relationships,
against 26 external reference houses, all provenance-tracked.

## Next
Say **"Proceed to Batch 3"** to continue with **Arabiyat Prestige** (large list — I'll split it
sensibly across Batches 3–4), building on this same database.
