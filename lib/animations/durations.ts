/**
 * Motion timing tokens (animation-guidelines.md).
 *
 * All durations in seconds (Framer Motion's unit). Never hand-roll timings in
 * components — import from here so motion stays consistent and restrained.
 *   hover 150ms · page transitions 250–350ms · reveals ~450ms
 */
export const duration = {
  fast: 0.15, // hover / micro-interactions
  base: 0.25, // default transitions
  page: 0.35, // route / page transitions
  reveal: 0.45, // on-scroll reveals
} as const;

/** Premium ease-out — "expensive without being slow". Matches `ease-premium`. */
export const easePremium: [number, number, number, number] = [0.16, 1, 0.3, 1];

export type Duration = keyof typeof duration;
