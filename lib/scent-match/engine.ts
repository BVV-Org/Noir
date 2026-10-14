import type { Collection, Product } from "@/types";
import { ARCHETYPES, QUESTIONS } from "./questions";
import { profileAnswers, profileProduct, type AnswerProfile } from "./profile";
import {
  FACETS,
  MOOD_GROUPS,
  SEASONS,
  type Answers,
  type Archetype,
  type Facet,
  type Match,
  type MatchResult,
  type MoodGroup,
  type ProfileSpec,
  type QuizOption,
  type Season,
  type Vector,
} from "./types";

/**
 * engine — pure scoring. No fetching, no framework.
 *
 * Takes the answers plus the sellable catalogue and returns the full result.
 * Everything is deterministic: the same answers against the same catalogue
 * always produce the same bottles.
 */

/** Cosine similarity of two non-negative vectors, 0–1. */
function cosine<K extends string>(
  keys: readonly K[],
  a: Vector<K>,
  b: Vector<K>
): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const k of keys) {
    const x = a[k] ?? 0;
    const y = b[k] ?? 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  return na === 0 || nb === 0 ? 0 : dot / Math.sqrt(na * nb);
}

/**
 * How well one product fits the answers, 0–1.
 *
 * Scent direction carries the most weight; mood, hours, season and presence
 * refine it. A signal the product doesn't carry is left out and the remaining
 * weights are rescaled, rather than counted as a mismatch — a missing Season
 * field says nothing about whether a scent suits summer.
 */
function affinity(answers: AnswerProfile, product: Product): number {
  const p = profileProduct(product);
  const parts: [number, number][] = [
    [cosine(FACETS, answers.facets, p.facets), 0.45],
  ];

  if (p.moods) parts.push([cosine(MOOD_GROUPS, answers.moods, p.moods), 0.22]);
  if (p.night !== null)
    parts.push([1 - Math.abs(answers.night - p.night), 0.15]);
  if (p.seasons) {
    const seasons = p.seasons;
    const fit = SEASONS.reduce(
      (sum, s) => sum + (seasons.includes(s) ? (answers.seasons[s] ?? 0) : 0),
      0
    );
    parts.push([fit, 0.09]);
  }
  if (p.presence !== null) {
    parts.push([1 - Math.abs(answers.presence - p.presence) / 100, 0.1]);
  }

  const weight = parts.reduce((sum, [, w]) => sum + w, 0);
  return parts.reduce((sum, [v, w]) => sum + v * w, 0) / weight;
}

/**
 * Raw affinities onto the 80–99 band the page shows.
 *
 * The band is calibrated to absolute fit, so a weak catalogue match reads lower
 * than a strong one. The whole cohort is then lifted, if needed, so the top
 * pick never shows under 86 — rank order is untouched.
 */
function toDisplayScores(raws: number[]): number[] {
  const base = raws.map(
    (r) => 80 + 19 * Math.min(1, Math.max(0, (r - 0.4) / 0.45))
  );
  const lift = Math.max(0, 86 - (base[0] ?? 86));
  return base.map((b) => Math.min(99, Math.round(b + lift)));
}

function pickArchetype(moods: Vector<MoodGroup>): Archetype {
  let best: Archetype | undefined;
  let bestScore = -1;
  for (const a of ARCHETYPES) {
    const s = cosine(MOOD_GROUPS, moods, a.signature);
    if (s > bestScore) {
      bestScore = s;
      best = a;
    }
  }
  if (!best) throw new Error("scent-match: no archetypes defined");
  return best;
}

function topKeys<K extends string>(
  keys: readonly K[],
  v: Vector<K>,
  n: number
) {
  return [...keys]
    .filter((k) => (v[k] ?? 0) > 0)
    .sort((a, b) => (v[b] ?? 0) - (v[a] ?? 0))
    .slice(0, n);
}

function describe(answers: AnswerProfile): ProfileSpec {
  const hours =
    answers.night >= 0.65
      ? "After dark"
      : answers.night <= 0.35
        ? "Daylight"
        : "Day into night";

  const presence =
    answers.presence >= 82
      ? "Fills the room"
      : answers.presence >= 64
        ? "Leaves a trail"
        : answers.presence >= 45
          ? "Arm's length"
          : "Skin close";

  return {
    direction: topKeys(FACETS, answers.facets, 3),
    hours,
    seasons: topKeys(SEASONS, answers.seasons, 2) as Season[],
    presence,
    moods: topKeys(MOOD_GROUPS, answers.moods, 2),
  };
}

/** Resolve submitted answer ids to options, ignoring anything unrecognised. */
export function resolveAnswers(answers: Answers): QuizOption[] {
  const chosen: QuizOption[] = [];
  for (const q of QUESTIONS) {
    const id = answers[q.id];
    const option = q.options.find((o) => o.id === id);
    if (option) chosen.push(option);
  }
  return chosen;
}

/**
 * The result. `products` must already be limited to what the store is selling
 * (in stock); `collections` must carry their member products.
 */
export function computeMatch(
  options: QuizOption[],
  products: Product[],
  collections: Collection[]
): MatchResult | null {
  if (products.length === 0) return null;

  const answers = profileAnswers(options);

  const ranked = products
    .map((product) => ({ product, raw: affinity(answers, product) }))
    .sort((a, b) => b.raw - a.raw);
  const scores = toDisplayScores(ranked.map((r) => r.raw));
  const matches: Match[] = ranked.map((r, i) => ({
    product: r.product,
    score: scores[i] ?? 80,
  }));

  const [topPick, ...rest] = matches;
  if (!topPick) return null;
  const more = rest.slice(0, 5);

  // The collection: the one whose in-stock members fit best, judged on its
  // strongest member and the depth behind it, with a nudge toward the
  // collection the top pick actually lives in.
  const rawByHandle = new Map(ranked.map((r) => [r.product.handle, r.raw]));
  const shown = new Set([topPick, ...more].map((m) => m.product.handle));
  let collection: MatchResult["collection"] = null;
  let bestCollection = -1;

  for (const c of collections) {
    const members = (c.products ?? [])
      .map((p) => rawByHandle.get(p.handle))
      .filter((r): r is number => typeof r === "number")
      .sort((a, b) => b - a);
    const [first, second] = members;
    if (first === undefined) continue;

    const holdsTopPick = (c.products ?? []).some(
      (p) => p.handle === topPick.product.handle
    );
    const score =
      first * 0.6 + (second ?? first) * 0.4 + (holdsTopPick ? 0.05 : 0);

    if (score > bestCollection) {
      bestCollection = score;
      collection = {
        // The member list is only needed for scoring; don't ship it.
        collection: { ...c, products: undefined },
        matches: (c.products ?? []).filter((p) => shown.has(p.handle)).length,
      };
    }
  }

  const archetype = pickArchetype(answers.moods);
  const strongest = Math.max(
    ...FACETS.map((f) => answers.facets[f] ?? 0),
    0.0001
  );

  return {
    archetype: {
      id: archetype.id,
      name: archetype.name,
      tagline: archetype.tagline,
      description: archetype.description,
    },
    spec: describe(answers),
    facets: topKeys(FACETS, answers.facets, 5).map((facet: Facet) => ({
      facet,
      value: Math.round(((answers.facets[facet] ?? 0) / strongest) * 100),
    })),
    topPick,
    more,
    collection,
    pool: products.length,
  };
}
