import type { Money, ShopImage, Seo } from "./common";
import type { Rarity } from "@/lib/config/site";

/**
 * Product (fragrance) — the normalized domain type. Maps from a Shopify Product
 * plus its `nv` metafields and media (TDD §7). The UI only ever sees this shape.
 */

/** A purchasable size/variant of a fragrance. */
export interface ProductVariant {
  id: string;
  title: string; // e.g. "50ml"
  price: Money;
  compareAtPrice?: Money | null;
  availableForSale: boolean;
  quantityAvailable?: number;
  selectedOptions?: { name: string; value: string }[];
}

/**
 * Performance & scent profile — `nv.*` integers (0–100) that power progress
 * bars. The core set is surfaced prominently in V1; the rest are stored for
 * future "DNA radar" visualizations.
 */
export interface PerformanceProfile {
  longevity?: number;
  projection?: number;
  sillage?: number;
  freshness?: number;
  sweetness?: number;
  versatility?: number;
  uniqueness?: number;
  complimentFactor?: number;
  // Extended (stored, surfaced later)
  citrus?: number;
  spice?: number;
  smokiness?: number;
  creaminess?: number;
  green?: number;
  aquatic?: number;
  floral?: number;
  woody?: number;
  musk?: number;
  vanilla?: number;
  masculinity?: number;
  femininity?: number;
}

/** Classification metadata (`nv.*`). */
export interface Classification {
  fragranceFamily?: string;
  season?: string[];
  occasion?: string[];
  class?: string;
  dna?: string;
  mood?: string[];
  vibe?: string[];
  rarity?: Rarity;
}

/** The fragrance note pyramid. */
export interface ProductNotes {
  top: string[];
  heart: string[];
  base: string[];
}

/** Boolean merchandising flags (`nv.*`). */
export interface ProductFlags {
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  editorsPick?: boolean;
  limitedDrop?: boolean;
  staffFavorite?: boolean;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  brand?: string;
  releaseYear?: number;
  tagline?: string;
  price: Money;
  compareAtPrice?: Money | null;
  availableForSale: boolean;
  images: ShopImage[];
  heroVideoUrl?: string | null;
  variants: ProductVariant[];
  performance: PerformanceProfile;
  classification: Classification;
  notes: ProductNotes;
  tags: string[];
  flags: ProductFlags;
  /** Handles of related products/similar fragrances (resolved on demand). */
  similarFragranceHandles: string[];
  relatedProductHandles: string[];
  seo?: Seo;
}
