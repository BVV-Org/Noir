import type { Collection } from "@/types";
import { image } from "./media";

/**
 * Collection fixtures — Shopify **automated (smart) collections** (TDD §6.5).
 *
 * Membership is never hand-listed. Each collection owns a tag rule, and the
 * provider resolves members by matching product tags — so tagging a product in
 * Admin makes it appear here with no code change, which is the behaviour the
 * live store must have. `collectionTagRules` is the mock's stand-in for the
 * smart-collection rule stored on the Shopify object.
 */
export const collectionTagRules: Record<string, string> = {
  "blue-kingdom": "Summer",
  "night-shift": "Evening",
  "the-rare-room": "Niche",
  "first-light": "Fresh",
};

export const collections: Collection[] = [
  {
    id: "gid://shopify/Collection/1",
    handle: "blue-kingdom",
    title: "Blue Kingdom",
    tagline: "Salt, stone, and open water.",
    description:
      "Fragrances built around cold minerals and sea air. Worn best when the light is hard and the day is long.",
    image: image(
      "/mock/collections/blue-kingdom.svg",
      "Blue Kingdom collection",
      1600,
      1000
    ),
    theme: "accent",
    seo: { title: "Blue Kingdom", description: "Salt, stone, and open water." },
  },
  {
    id: "gid://shopify/Collection/2",
    handle: "night-shift",
    title: "Night Shift",
    tagline: "For the hours after the room empties.",
    description:
      "Amber, tobacco, oud, and smoke. Heavier compositions that reward proximity and outlast the evening.",
    image: image(
      "/mock/collections/night-shift.svg",
      "Night Shift collection",
      1600,
      1000
    ),
    theme: "mythic",
    seo: {
      title: "Night Shift",
      description: "For the hours after the room empties.",
    },
  },
  {
    id: "gid://shopify/Collection/3",
    handle: "the-rare-room",
    title: "The Rare Room",
    tagline: "Small houses. Smaller runs.",
    description:
      "Independent perfumery and limited releases. What ships here is what remains. Nothing is reissued.",
    image: image(
      "/mock/collections/the-rare-room.svg",
      "The Rare Room collection",
      1600,
      1000
    ),
    theme: "gold",
    seo: { title: "The Rare Room", description: "Small houses. Smaller runs." },
  },
  {
    id: "gid://shopify/Collection/4",
    handle: "first-light",
    title: "First Light",
    tagline: "Citrus, green, and cold air.",
    description:
      "Bright openings that stay legible through the afternoon. The easiest place to start a collection.",
    image: image(
      "/mock/collections/first-light.svg",
      "First Light collection",
      1600,
      1000
    ),
    theme: "primary",
    seo: { title: "First Light", description: "Citrus, green, and cold air." },
  },
];
