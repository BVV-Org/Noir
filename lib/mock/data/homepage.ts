import type { HomepageSection } from "@/types";
import { image } from "./media";

/**
 * Homepage composition — ordered, toggleable `nv_homepage_section` metaobjects
 * (TDD §8).
 *
 * The page renders whatever this array says, in `order`, skipping anything with
 * `enabled: false`. Reordering or hiding a section is a data change, never a
 * code change — so this fixture is deliberately *unsorted* and contains a
 * disabled entry, to prove the renderer honours both rules rather than getting
 * the right answer by accident.
 */
export const homepageSections: HomepageSection[] = [
  {
    id: "gid://shopify/Metaobject/hs-hero",
    type: "hero",
    enabled: true,
    order: 1,
    title: "Enter The Vault",
    subtitle:
      "A fragrance is a decision you wear. We stock the ones worth deciding on.",
    ctaLabel: "Browse the vault",
    ctaUrl: "/shop",
    media: image(
      "/mock/products/midnight-cartography.svg",
      "Midnight Cartography",
      800,
      1000
    ),
    productHandles: ["midnight-cartography"],
  },
  {
    id: "gid://shopify/Metaobject/hs-best",
    type: "best_sellers",
    enabled: true,
    order: 3,
    title: "Most collected",
    subtitle: "What leaves the vault fastest.",
    ctaLabel: "View all",
    ctaUrl: "/shop?sort=best-selling",
  },
  {
    id: "gid://shopify/Metaobject/hs-collections",
    type: "featured_collections",
    enabled: true,
    order: 2,
    title: "Enter by door",
    subtitle: "Four ways through the same catalogue.",
    ctaLabel: "All collections",
    ctaUrl: "/collections",
  },
  {
    id: "gid://shopify/Metaobject/hs-kits",
    type: "discovery_kits",
    enabled: true,
    order: 4,
    title: "Start with samples",
    subtitle:
      "Nobody should buy a bottle they have worn for ninety seconds at a counter.",
    ctaLabel: "All kits",
    ctaUrl: "/discovery-kits",
  },
  {
    id: "gid://shopify/Metaobject/hs-new",
    type: "new_arrivals",
    enabled: true,
    order: 5,
    title: "Newly vaulted",
    subtitle: "Recent additions, in the order they arrived.",
    ctaLabel: "View all",
    ctaUrl: "/shop?sort=newest",
  },
  {
    id: "gid://shopify/Metaobject/hs-journal",
    type: "journal_preview",
    enabled: true,
    order: 6,
    title: "From the Journal",
    subtitle: "Reading that makes the catalogue easier to navigate.",
    ctaLabel: "All articles",
    ctaUrl: "/journal",
  },
  {
    id: "gid://shopify/Metaobject/hs-cta",
    type: "cta",
    enabled: true,
    order: 7,
    title: "Not sure where to begin?",
    subtitle:
      "The Initiation covers citrus, floral, wood, and musk in five 2ml atomisers.",
    ctaLabel: "See The Initiation",
    ctaUrl: "/discovery-kits/the-initiation",
  },
  {
    id: "gid://shopify/Metaobject/hs-newsletter",
    type: "newsletter",
    enabled: true,
    order: 8,
    title: "First access",
    subtitle:
      "Limited releases are announced to this list before they reach the shop.",
    ctaLabel: "Subscribe",
  },
  {
    // Disabled in Shopify. Present in the payload, absent from the page.
    id: "gid://shopify/Metaobject/hs-archive",
    type: "cta",
    enabled: false,
    order: 9,
    title: "The Archive",
    subtitle: "Sold-out releases, kept for reference.",
    ctaLabel: "Browse the archive",
    ctaUrl: "/collections/the-rare-room",
  },
];
