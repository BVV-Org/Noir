import type { Money, ShopImage } from "@/types";
import { siteConfig } from "@/lib/config/site";

/**
 * Fixture helpers.
 *
 * Money is a decimal string + ISO code because that is exactly what the
 * Storefront API returns (`types/common.ts`). Keeping the mock honest about the
 * awkward parts of Shopify's shape is the point: if a component can render
 * these, it can render live data unchanged.
 */
export const money = (amount: string): Money => ({
  amount,
  currencyCode: siteConfig.currency,
});

export const image = (
  url: string,
  altText: string,
  width: number,
  height: number
): ShopImage => ({ url, altText, width, height });

/** A fragrance's two-shot gallery: full bottle, then a cropped detail. */
export const bottleImages = (handle: string, title: string): ShopImage[] => [
  image(`/mock/products/${handle}.svg`, `${title} bottle`, 800, 1000),
  image(
    `/mock/products/${handle}-detail.svg`,
    `${title} bottle, detail`,
    800,
    1000
  ),
];
