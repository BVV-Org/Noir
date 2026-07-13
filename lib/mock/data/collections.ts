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
  // SEO merchandising hubs — the commercial landing pages the Journal links
  // into. Membership resolves by product tag, so tagging a bottle in Admin
  // (e.g. "Freshie", "Gourmand", "Oud", "Elixir") lists it here automatically.
  "beast-mode-freshies": "Freshie",
  "boozy-gourmands": "Gourmand",
  "smoked-ouds": "Oud",
  "sauvage-elixir-alternatives": "Elixir",
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
  {
    id: "gid://shopify/Collection/5",
    handle: "beast-mode-freshies",
    title: "Beast-Mode Freshies",
    tagline: "Fruity, smoky, and built to project.",
    description:
      "Pineapple, blackcurrant, and birch smoke over ambergris — the fresh-but-loud signature made famous by Creed Aventus, in Dubai's most convincing tributes. Rasasi Hawas, Armaf Club de Nuit Intense Man, and more.",
    image: image(
      "/mock/collections/blue-kingdom.svg",
      "Beast-Mode Freshies collection",
      1600,
      1000
    ),
    theme: "accent",
    seo: {
      title: "Beast-Mode Freshies — Fresh Fruity Fragrances Inspired by Aventus",
      description:
        "Pineapple, birch smoke, and ambergris. The best long-lasting fresh fragrances inspired by Creed Aventus — sample first, then commit.",
    },
  },
  {
    id: "gid://shopify/Collection/6",
    handle: "boozy-gourmands",
    title: "Boozy Gourmands",
    tagline: "Dates, cognac, praline, coffee.",
    description:
      "Rich dessert orientals with a boozy edge — cinnamon and dates over vanilla, tonka, and akigalawood. Dubai's answer to niche Kilian, led by Lattafa Khamrah and Khamrah Qahwa.",
    image: image(
      "/mock/collections/night-shift.svg",
      "Boozy Gourmands collection",
      1600,
      1000
    ),
    theme: "gold",
    seo: {
      title: "Boozy Gourmands — Date & Cognac Fragrances Inspired by Kilian",
      description:
        "Cinnamon, dates, praline, and vanilla. The best boozy gourmand fragrances inspired by Kilian Angels' Share. Try a decant first.",
    },
  },
  {
    id: "gid://shopify/Collection/7",
    handle: "smoked-ouds",
    title: "Smoked Ouds",
    tagline: "Saffron, agarwood, and ash.",
    description:
      "Dark, smoky agarwood tuned the Arabian way — saffron and nutmeg over resinous oud and woods. Affordable answers to niche houses, led by Lattafa Bade'e Al Oud and Oud for Glory.",
    image: image(
      "/mock/collections/the-rare-room.svg",
      "Smoked Ouds collection",
      1600,
      1000
    ),
    theme: "mythic",
    seo: {
      title: "Smoked Ouds — Affordable Oud Fragrances Inspired by Niche Houses",
      description:
        "Saffron, agarwood, and smoky woods. The best affordable oud fragrances inspired by Initio Oud for Greatness. Sample before you scale up.",
    },
  },
  {
    id: "gid://shopify/Collection/8",
    handle: "sauvage-elixir-alternatives",
    title: "Sauvage Elixir Alternatives",
    tagline: "Spiced amber, decoded.",
    description:
      "Grapefruit, cinnamon, and black pepper over amberwood and vanilla — the spicy-amber signature of Dior Sauvage Elixir, re-tuned and led by Lattafa Asad.",
    image: image(
      "/mock/collections/first-light.svg",
      "Sauvage Elixir Alternatives collection",
      1600,
      1000
    ),
    theme: "accent",
    seo: {
      title: "Sauvage Elixir Alternatives — Spicy Amber Fragrances Like Dior",
      description:
        "Cinnamon, cardamom, and amberwood. The best affordable alternatives to Dior Sauvage Elixir, led by Lattafa Asad. Decants available.",
    },
  },
];
