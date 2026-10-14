import type { Product } from "@/types";
import {
  FACETS,
  MOOD_GROUPS,
  SEASONS,
  type Facet,
  type MoodGroup,
  type QuizOption,
  type Season,
  type Vector,
} from "./types";

/**
 * profile — turns a product, or a set of answers, into comparable vectors.
 *
 * Products are read from the fields the live catalogue reliably fills in:
 * family, DNA, the note pyramid, mood, season, occasion and projection. The
 * extended `nv` scent axes (citrus, woody…) are folded in when present but are
 * never relied on — on the live store most products don't carry them.
 */

/**
 * Note and descriptor → facet weights. Matched as phrases, longest first, and
 * each match is consumed so it can't be read twice: "pineapple" must not also
 * score as "apple", nor "ambergris" as "amber", nor "rosemary" as "rose".
 */
const LEXICON: [string, Vector<Facet>][] = (
  [
    // Ambers, resins and smoke
    ["ambergris", { aquatic: 0.6, musky: 0.6 }],
    ["amberwood", { woody: 0.6, amber: 0.6 }],
    ["amber", { amber: 1 }],
    ["benzoin", { amber: 0.8, sweet: 0.3 }],
    ["labdanum", { amber: 0.8 }],
    ["myrrh", { smoky: 0.6, amber: 0.5 }],
    ["olibanum", { smoky: 0.9 }],
    ["frankincense", { smoky: 0.9 }],
    ["incense", { smoky: 1 }],
    ["elemi", { smoky: 0.4, citrus: 0.4 }],
    ["birch", { smoky: 0.9, leather: 0.4 }],
    ["smoky", { smoky: 1 }],
    ["smoked", { smoky: 1 }],
    ["smoke", { smoky: 1 }],
    ["tobacco", { smoky: 0.6, sweet: 0.5 }],
    ["hay", { sweet: 0.3, green: 0.3 }],
    ["leather", { leather: 1 }],
    ["suede", { leather: 0.8, musky: 0.3 }],
    ["oud", { woody: 0.7, smoky: 0.5, amber: 0.3 }],
    ["agarwood", { woody: 0.7, smoky: 0.5, amber: 0.3 }],
    // Woods and mosses
    ["sandalwood", { woody: 0.9, musky: 0.2 }],
    ["driftwood", { woody: 0.6, aquatic: 0.5 }],
    ["cashmeran", { woody: 0.6, musky: 0.6 }],
    ["cedar", { woody: 1 }],
    ["vetiver", { woody: 0.7, green: 0.5 }],
    ["cypress", { woody: 0.6, green: 0.5 }],
    ["patchouli", { woody: 0.7, amber: 0.2 }],
    ["oakmoss", { green: 0.8, woody: 0.3 }],
    ["moss", { green: 0.7 }],
    ["woody", { woody: 1 }],
    ["woods", { woody: 1 }],
    ["wood", { woody: 1 }],
    ["chypre", { green: 0.5, woody: 0.4 }],
    // Citrus
    ["orange blossom", { floral: 1 }],
    ["bergamot", { citrus: 1, fresh: 0.3 }],
    ["grapefruit", { citrus: 1, fresh: 0.3 }],
    ["lemon", { citrus: 1, fresh: 0.3 }],
    ["mandarin", { citrus: 1 }],
    ["orange", { citrus: 0.9 }],
    ["lime", { citrus: 1 }],
    ["yuzu", { citrus: 1 }],
    ["citrus", { citrus: 1, fresh: 0.3 }],
    ["zesty", { citrus: 0.7, fresh: 0.5 }],
    // Water, air, cold
    ["coconut water", { fruity: 0.7, fresh: 0.5, aquatic: 0.2 }],
    ["sea salt", { aquatic: 1 }],
    ["salty", { aquatic: 0.7 }],
    ["salt", { aquatic: 0.7 }],
    ["aquatic", { aquatic: 1, fresh: 0.3 }],
    ["marine", { aquatic: 1, fresh: 0.3 }],
    ["ocean", { aquatic: 1 }],
    ["ice-cold", { fresh: 1 }],
    ["frozen", { fresh: 1 }],
    ["icy", { fresh: 1 }],
    ["ice", { fresh: 1 }],
    ["cold", { fresh: 0.8 }],
    ["crisp", { fresh: 0.6 }],
    ["clean", { fresh: 0.5, musky: 0.5 }],
    ["refreshing", { fresh: 1 }],
    ["fresh", { fresh: 1 }],
    // Herbs and greens
    ["lily-of-the-valley", { floral: 0.9, fresh: 0.3 }],
    ["fig leaf", { green: 1, fruity: 0.2 }],
    ["star anise", { spicy: 0.5, aromatic: 0.5 }],
    ["rosemary", { aromatic: 0.9, green: 0.3 }],
    ["lavender", { aromatic: 1 }],
    ["minty", { aromatic: 1, fresh: 0.6 }],
    ["mint", { aromatic: 1, fresh: 0.6 }],
    ["sage", { aromatic: 0.8, green: 0.4 }],
    ["juniper", { aromatic: 0.6, green: 0.5 }],
    ["geranium", { floral: 0.5, aromatic: 0.5 }],
    ["aromatic", { aromatic: 1 }],
    ["green", { green: 1 }],
    ["tea", { green: 0.7 }],
    ["basil", { aromatic: 0.7, green: 0.4 }],
    // Fruit
    ["pineapple", { fruity: 1 }],
    ["blackcurrant", { fruity: 1 }],
    ["apple", { fruity: 1, fresh: 0.2 }],
    ["mirabelle", { fruity: 0.8 }],
    ["plum", { fruity: 0.8, sweet: 0.3 }],
    ["coconut", { fruity: 0.8, sweet: 0.3 }],
    ["pear", { fruity: 0.8 }],
    ["berries", { fruity: 0.8 }],
    ["berry", { fruity: 0.8 }],
    ["fig", { fruity: 0.6, green: 0.4 }],
    ["tropical", { fruity: 0.8, fresh: 0.3 }],
    ["juicy", { fruity: 0.6 }],
    ["fruity", { fruity: 1 }],
    // Flowers
    ["white flowers", { floral: 1 }],
    ["tuberose", { floral: 1 }],
    ["jasmine", { floral: 1 }],
    ["violet", { floral: 0.8 }],
    ["orris", { floral: 0.7, musky: 0.4 }],
    ["iris", { floral: 0.7, musky: 0.4 }],
    ["lily", { floral: 0.9 }],
    ["rose", { floral: 1 }],
    ["floral", { floral: 1 }],
    ["powdery", { musky: 0.6, floral: 0.3 }],
    // Sweet and gourmand
    ["vanilla", { sweet: 1, amber: 0.2 }],
    ["tonka", { sweet: 0.8, amber: 0.3 }],
    ["toffee", { sweet: 1 }],
    ["caramel", { sweet: 1 }],
    ["praline", { sweet: 1 }],
    ["honey", { sweet: 0.8 }],
    ["cacao", { sweet: 0.8, smoky: 0.2 }],
    ["cocoa", { sweet: 0.8, smoky: 0.2 }],
    ["coffee", { sweet: 0.5, smoky: 0.3 }],
    ["gourmand", { sweet: 1 }],
    ["sweet", { sweet: 1 }],
    ["warm", { amber: 0.4, sweet: 0.2 }],
    // Spice
    ["pink pepper", { spicy: 0.7, fresh: 0.2 }],
    ["black pepper", { spicy: 1 }],
    ["pepper", { spicy: 0.9 }],
    ["cinnamon", { spicy: 1, sweet: 0.3 }],
    ["clove", { spicy: 1 }],
    ["cardamom", { spicy: 0.8, aromatic: 0.3 }],
    ["ginger", { spicy: 0.7, fresh: 0.3 }],
    ["saffron", { spicy: 0.8, leather: 0.3 }],
    ["nutmeg", { spicy: 0.8 }],
    ["spices", { spicy: 1 }],
    ["spiced", { spicy: 1 }],
    ["spicy", { spicy: 1 }],
    ["spice", { spicy: 1 }],
    // Musk
    ["ambrette", { musky: 0.8 }],
    ["musk", { musky: 1 }],
  ] as [string, Vector<Facet>][]
).sort((a, b) => b[0].length - a[0].length);

/**
 * Whole-word patterns, so "ice" can't fire inside "office" or "oud" inside
 * "loud". Hyphens count as word breaks, which is what "ice-cold" needs.
 */
const PATTERNS: [RegExp, Vector<Facet>][] = LEXICON.map(([phrase, facets]) => [
  new RegExp(
    `(^|[^a-z])${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=[^a-z]|$)`,
    "g"
  ),
  facets,
]);

/** Read every lexicon phrase out of one piece of text into `into`. */
function readPhrases(text: string, weight: number, into: Vector<Facet>) {
  let rest = text.toLowerCase();
  for (const [pattern, facets] of PATTERNS) {
    pattern.lastIndex = 0;
    if (!pattern.test(rest)) continue;
    // Consume the phrase so a shorter entry can't match inside it again.
    rest = rest.replace(pattern, "$1 ");
    for (const facet of FACETS) {
      const v = facets[facet];
      if (v) into[facet] = (into[facet] ?? 0) + v * weight;
    }
  }
}

/** Extended `nv` axes, when the store has them, map straight onto facets. */
const AXIS_FACETS: [keyof Product["performance"], Facet][] = [
  ["freshness", "fresh"],
  ["citrus", "citrus"],
  ["aquatic", "aquatic"],
  ["green", "green"],
  ["floral", "floral"],
  ["woody", "woody"],
  ["smokiness", "smoky"],
  ["spice", "spicy"],
  ["sweetness", "sweet"],
  ["vanilla", "sweet"],
  ["musk", "musky"],
];

/** The catalogue's open Mood vocabulary, folded into the six groups. */
const MOOD_WORDS: Record<string, Vector<MoodGroup>> = {
  fresh: { fresh: 1 },
  refreshing: { fresh: 1 },
  clean: { fresh: 0.6, calm: 0.5 },
  vibrant: { fresh: 0.5, playful: 0.6 },
  calm: { calm: 1 },
  cozy: { calm: 0.6, sensual: 0.5 },
  relaxed: { calm: 1 },
  bold: { bold: 1 },
  "high-octane": { bold: 1, playful: 0.4 },
  energetic: { bold: 0.6, playful: 0.6 },
  confident: { bold: 0.8 },
  playful: { playful: 1 },
  fun: { playful: 1 },
  sensual: { sensual: 1 },
  seductive: { sensual: 1, bold: 0.3 },
  warm: { sensual: 0.7, calm: 0.3 },
  romantic: { sensual: 0.9 },
  mysterious: { mysterious: 1 },
  dark: { mysterious: 0.9 },
  sophisticated: { mysterious: 0.5, calm: 0.5 },
  elegant: { calm: 0.6, mysterious: 0.4 },
};

const NIGHT_OCCASIONS = [
  "evening",
  "night",
  "clubbing",
  "date",
  "special",
  "party",
  "winter wear",
];
const DAY_OCCASIONS = ["daily", "office", "gym", "casual", "work", "day"];

export interface ProductProfile {
  facets: Vector<Facet>;
  moods: Vector<MoodGroup> | null;
  /** Share of the product's occasions that are after dark, 0–1. */
  night: number | null;
  seasons: Season[] | null;
  /** 0–100, from projection (and sillage when the store has it). */
  presence: number | null;
}

export function profileProduct(product: Product): ProductProfile {
  const c = product.classification;
  const facets: Vector<Facet> = {};

  // The family and DNA are the store's own one-line summary of the scent, so
  // they count for more than any single note.
  if (c.fragranceFamily) readPhrases(c.fragranceFamily, 1.5, facets);
  if (c.dna) readPhrases(c.dna, 1.5, facets);
  for (const note of product.notes.top) readPhrases(note, 0.8, facets);
  for (const note of product.notes.heart) readPhrases(note, 1, facets);
  for (const note of product.notes.base) readPhrases(note, 1, facets);

  for (const [axis, facet] of AXIS_FACETS) {
    const v = product.performance[axis];
    if (typeof v === "number") {
      facets[facet] = (facets[facet] ?? 0) + (v / 100) * 1.2;
    }
  }

  let moods: Vector<MoodGroup> | null = null;
  for (const word of c.mood ?? []) {
    const groups = MOOD_WORDS[word.trim().toLowerCase()];
    if (!groups) continue;
    moods ??= {};
    for (const g of MOOD_GROUPS) {
      const v = groups[g];
      if (v) moods[g] = (moods[g] ?? 0) + v;
    }
  }

  let night: number | null = null;
  const occasions = (c.occasion ?? []).map((o) => o.toLowerCase());
  const nights = occasions.filter((o) =>
    NIGHT_OCCASIONS.some((n) => o.includes(n))
  ).length;
  const days = occasions.filter((o) =>
    DAY_OCCASIONS.some((d) => o.includes(d))
  ).length;
  if (nights + days > 0) night = nights / (nights + days);

  const seasons = (c.season ?? [])
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is Season => (SEASONS as readonly string[]).includes(s));

  const { projection, sillage } = product.performance;
  const presence =
    typeof projection === "number" && typeof sillage === "number"
      ? projection * 0.7 + sillage * 0.3
      : typeof projection === "number"
        ? projection
        : typeof sillage === "number"
          ? sillage
          : null;

  return {
    facets,
    moods,
    night,
    seasons: seasons.length > 0 ? seasons : null,
    presence,
  };
}

export interface AnswerProfile {
  facets: Vector<Facet>;
  moods: Vector<MoodGroup>;
  night: number;
  /** Each season's share of the answers' seasonal pull, summing to 1. */
  seasons: Vector<Season>;
  presence: number;
}

/** Sum the chosen answers into one profile. */
export function profileAnswers(options: QuizOption[]): AnswerProfile {
  const facets: Vector<Facet> = {};
  const moods: Vector<MoodGroup> = {};
  const seasonPull: Vector<Season> = {};
  let night = 0;
  let presence = 0;

  for (const opt of options) {
    for (const f of FACETS) {
      const v = opt.facets[f];
      if (v) facets[f] = (facets[f] ?? 0) + v;
    }
    for (const g of MOOD_GROUPS) {
      const v = opt.moods[g];
      if (v) moods[g] = (moods[g] ?? 0) + v;
    }
    for (const s of SEASONS) {
      const v = opt.seasons[s];
      if (v) seasonPull[s] = (seasonPull[s] ?? 0) + v;
    }
    night += opt.night;
    presence += opt.presence;
  }

  const n = Math.max(1, options.length);
  const pullTotal = SEASONS.reduce((sum, s) => sum + (seasonPull[s] ?? 0), 0);
  const seasons: Vector<Season> = {};
  for (const s of SEASONS) {
    seasons[s] = pullTotal > 0 ? (seasonPull[s] ?? 0) / pullTotal : 0.25;
  }

  return { facets, moods, night: night / n, seasons, presence: presence / n };
}
