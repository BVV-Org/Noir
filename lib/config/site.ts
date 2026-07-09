/**
 * Site-wide configuration and shared brand vocabulary.
 * Non-commerce constants live here; commerce data always comes from Shopify.
 */
export const siteConfig = {
  name: "Noir Vault",
  tagline: "Enter The Vault. Level Up Your Scent.",
  description:
    "A premium fragrance discovery platform. Explore, collect, and level up your scent.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://noirvault.com",
  ogImage: "/og-default.jpg",
  locale: "en_US",
  currency: "USD",
} as const;

/**
 * The signature rarity progression (Common → Rare → Epic → Legendary → Mythic).
 * A first-class token set — each tier maps to a `--rarity-*` color and reads
 * identically everywhere via <RarityBadge />.
 */
export const RARITIES = [
  "common",
  "rare",
  "epic",
  "legendary",
  "mythic",
] as const;

export type Rarity = (typeof RARITIES)[number];

/** Display labels for each rarity tier. */
export const RARITY_LABELS: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  mythic: "Mythic",
};
