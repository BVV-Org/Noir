import type { ShopImage, Seo } from "./common";
import type { Product } from "./product";

/**
 * Collection — a Shopify automated (smart) collection plus editorial metafields.
 * `products` is populated only when a single collection is fetched with items.
 */
export interface Collection {
  id: string;
  handle: string;
  title: string;
  description?: string;
  tagline?: string;
  image?: ShopImage | null;
  /** Optional accent theme sourced from collection metafields. */
  theme?: string;
  productCount?: number;
  products?: Product[];
  seo?: Seo;
}
