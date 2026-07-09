/**
 * Feature flags — the primary rollout seam for V2–V4 (technical-rules.md:
 * "Document extension points for future features but do not implement them").
 *
 * Every future surface (XP, achievements, leaderboards, quiz, AI, community)
 * is gated here so it can be built behind a flag and switched on safely. V1
 * ships with all future flags OFF; nothing downstream should read a flag that
 * isn't defined here.
 */
export const features = {
  // --- Live in V1 ---
  wishlist: true, // localStorage-backed; syncs to a customer metafield in V2
  newsletter: true,

  // --- Reserved for future versions (defined, not implemented) ---
  xp: false, // V2 — Supabase-backed
  achievements: false, // V2
  leaderboards: false, // V2
  quiz: false, // V3
  recommendations: false, // V3 — consumes stored DNA/similar-fragrance data
  aiAssistant: false, // V4
  community: false, // V4
} as const;

export type FeatureFlag = keyof typeof features;

/** Guard any future surface behind its flag. */
export function isEnabled(flag: FeatureFlag): boolean {
  return features[flag];
}
