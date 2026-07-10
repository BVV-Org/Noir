import type { Money, ShopImage, Seo } from "./common";
import type { Product } from "./product";

/**
 * Discovery Kit — a Shopify Product flagged `nv.is_kit`, whose `nv.kit_products`
 * references the fragrances it contains (TDD §6.5). The kit page renders those.
 */
export interface Kit {
  id: string;
  handle: string;
  title: string;
  description: string;
  tagline?: string;
  price: Money;
  image?: ShopImage | null;
  images: ShopImage[];
  availableForSale: boolean;
  /** Handles of the fragrances included in the kit. */
  productHandles: string[];
  /** Resolved products, populated when a single kit is fetched. */
  products?: Product[];
  seo?: Seo;
}
