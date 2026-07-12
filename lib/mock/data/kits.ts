import type { Kit } from "@/types";
import { image, money } from "./media";

/**
 * Discovery Kit fixtures.
 *
 * A kit is a Shopify **Product** carrying `nv.is_kit` and `nv.kit_products`
 * (TDD §6.5), not a collection — which is why it has a price and a stock state.
 * `productHandles` mirrors the `nv.kit_products` product-reference list; the kit
 * page resolves those into full products through the provider.
 */
export const kits: Kit[] = [
  {
    id: "gid://shopify/Product/101",
    handle: "the-initiation",
    title: "The Initiation",
    tagline: "Five ways in.",
    description:
      "The starting point. Five 2ml atomisers spanning citrus, floral, wood, and musk: enough to find out which direction is yours before committing to a bottle.",
    price: money("60.00"),
    image: image(
      "/mock/kits/the-initiation.svg",
      "The Initiation kit",
      1200,
      1200
    ),
    images: [
      image("/mock/kits/the-initiation.svg", "The Initiation kit", 1200, 1200),
    ],
    availableForSale: true,
    productHandles: [
      "salt-and-cedar",
      "bitter-neroli",
      "glass-orchid",
      "paper-rain",
      "ash-vetiver",
    ],
    seo: { title: "The Initiation", description: "Five ways in." },
  },
  {
    id: "gid://shopify/Product/102",
    handle: "after-dark",
    title: "After Dark",
    tagline: "Four for the evening.",
    description:
      "Amber, spice, tobacco, and smoke in 2ml. Sampled together, the differences between a warm fragrance and a heavy one become obvious.",
    price: money("85.00"),
    image: image("/mock/kits/after-dark.svg", "After Dark kit", 1200, 1200),
    images: [image("/mock/kits/after-dark.svg", "After Dark kit", 1200, 1200)],
    availableForSale: true,
    productHandles: [
      "obsidian-bloom",
      "ember-vow",
      "gold-leaf-tobacco",
      "velvet-cipher",
    ],
    seo: { title: "After Dark", description: "Four for the evening." },
  },
  {
    id: "gid://shopify/Product/103",
    handle: "rare-air",
    title: "Rare Air",
    tagline: "Three that are difficult to find.",
    description:
      "Two limited releases and one house cornerstone. Sold at cost against the bottles, because these are the ones worth being certain about.",
    price: money("120.00"),
    image: image("/mock/kits/rare-air.svg", "Rare Air kit", 1200, 1200),
    images: [image("/mock/kits/rare-air.svg", "Rare Air kit", 1200, 1200)],
    availableForSale: false,
    productHandles: ["midnight-cartography", "crimson-oud", "velvet-cipher"],
    seo: {
      title: "Rare Air",
      description: "Three that are difficult to find.",
    },
  },
];
