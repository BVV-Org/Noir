import type { Collection, Product } from "@/types";

/**
 * Scent Match — shared types.
 *
 * The quiz never scores against anything the store doesn't sell. Every product
 * is profiled from the fields the live catalogue reliably carries — family,
 * DNA, the note pyramid, mood, season, occasion and projection — so a match is
 * always a real, in-stock bottle with a real product page behind it.
 */

/** Scent directions a product (or a set of answers) can point toward. */
export type Facet =
  | "fresh"
  | "citrus"
  | "aquatic"
  | "green"
  | "aromatic"
  | "fruity"
  | "floral"
  | "sweet"
  | "amber"
  | "spicy"
  | "woody"
  | "smoky"
  | "leather"
  | "musky";

export const FACETS: readonly Facet[] = [
  "fresh",
  "citrus",
  "aquatic",
  "green",
  "aromatic",
  "fruity",
  "floral",
  "sweet",
  "amber",
  "spicy",
  "woody",
  "smoky",
  "leather",
  "musky",
];

export const FACET_LABELS: Record<Facet, string> = {
  fresh: "Fresh",
  citrus: "Citrus",
  aquatic: "Aquatic",
  green: "Green",
  aromatic: "Aromatic",
  fruity: "Fruity",
  floral: "Floral",
  sweet: "Sweet",
  amber: "Amber",
  spicy: "Spiced",
  woody: "Woody",
  smoky: "Smoked",
  leather: "Leather",
  musky: "Musk",
};

/**
 * Mood groups. The catalogue's `Mood` vocabulary is open-ended ("High-Octane",
 * "Cozy", "Seductive"…), so it is folded into six groups the answers can speak
 * to directly.
 */
export type MoodGroup =
  "fresh" | "calm" | "bold" | "playful" | "sensual" | "mysterious";

export const MOOD_GROUPS: readonly MoodGroup[] = [
  "fresh",
  "calm",
  "bold",
  "playful",
  "sensual",
  "mysterious",
];

export const MOOD_LABELS: Record<MoodGroup, string> = {
  fresh: "Fresh",
  calm: "Calm",
  bold: "Bold",
  playful: "Playful",
  sensual: "Sensual",
  mysterious: "Mysterious",
};

export type Season = "spring" | "summer" | "autumn" | "winter";
export const SEASONS: readonly Season[] = [
  "spring",
  "summer",
  "autumn",
  "winter",
];

export type Vector<K extends string> = Partial<Record<K, number>>;

/** One answer. Every weight is hidden from the quiz-taker. */
export interface QuizOption {
  id: string;
  label: string;
  facets: Vector<Facet>;
  moods: Vector<MoodGroup>;
  /** 0 = daylight, 1 = after dark. */
  night: number;
  seasons: Vector<Season>;
  /** How far the scent should travel, 0 (skin) – 100 (fills the room). */
  presence: number;
}

export interface Question {
  id: string;
  prompt: string;
  options: QuizOption[];
}

export interface Archetype {
  id: string;
  name: string;
  tagline: string;
  description: string;
  signature: Vector<MoodGroup>;
}

/** A scored, sellable product. */
export interface Match {
  product: Product;
  /** Display score, 80–99. */
  score: number;
}

/** The readable summary of what the answers point to. */
export interface ProfileSpec {
  direction: Facet[];
  hours: string;
  seasons: Season[];
  presence: string;
  moods: MoodGroup[];
}

export interface MatchResult {
  archetype: Pick<Archetype, "id" | "name" | "tagline" | "description">;
  spec: ProfileSpec;
  /** The five strongest facets of the answers, normalised so the top is 100. */
  facets: { facet: Facet; value: number }[];
  topPick: Match;
  more: Match[];
  collection: { collection: Collection; matches: number } | null;
  /** How many in-stock fragrances the answers were matched against. */
  pool: number;
}

export type Answers = Record<string, string>;
