import type { PerformanceProfile } from "@/types";

/**
 * The `nv` performance metrics V1 surfaces, in the order the product page shows
 * them: how long it lasts, how far it travels, then what that adds up to.
 *
 * This lives in `lib/config` rather than beside `PerformanceBar` because that
 * component is a client module, and a value exported across the client → server
 * boundary arrives as a reference proxy rather than the value itself.
 *
 * The remaining `PerformanceProfile` fields (citrus, smokiness, femininity…) are
 * stored on every product and intentionally unsurfaced — they feed the DNA radar
 * planned in TDD §7.
 */
export const CORE_METRICS: readonly (readonly [
  keyof PerformanceProfile,
  string,
])[] = [
  ["longevity", "Longevity"],
  ["projection", "Projection"],
  ["sillage", "Sillage"],
  ["versatility", "Versatility"],
  ["uniqueness", "Uniqueness"],
  ["complimentFactor", "Compliment factor"],
] as const;
