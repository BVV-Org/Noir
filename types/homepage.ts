import type { ShopImage } from "./common";

/**
 * Homepage composition — driven by ordered, toggleable `nv_homepage_section`
 * metaobjects (TDD §8). Toggling `enabled` / changing `order` reshapes the home
 * page with no deploy.
 */
export type HomepageSectionType =
  | "hero"
  | "featured_collections"
  | "best_sellers"
  | "discovery_kits"
  | "new_arrivals"
  | "journal_preview"
  | "newsletter"
  | "cta";

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  enabled: boolean;
  order: number;
  title?: string;
  subtitle?: string;
  /** Optional references resolved by the section renderer. */
  collectionHandle?: string;
  productHandles?: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  media?: ShopImage | null;
}
