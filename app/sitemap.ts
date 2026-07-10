import type { MetadataRoute } from "next";
import { getProvider } from "@/lib/data";
import { siteConfig } from "@/lib/config/site";

/**
 * Dynamic sitemap, enumerated from the data provider (TDD §11).
 *
 * Regenerated on the same hourly cadence as the content routes, so a product
 * published in Shopify appears here without a deploy.
 *
 * Every provider read is individually guarded. A sitemap is a nice-to-have; the
 * site is not. If the Storefront API is down or a single entity type fails, we
 * still emit the static routes and whatever else resolved, rather than throwing
 * and serving a 500 to Googlebot — which is a far worse signal than a short
 * sitemap.
 */
export const revalidate = 3600;

const url = (path: string): string => new URL(path, siteConfig.url).toString();

/** Resolve, or log and yield nothing. Never rejects. */
async function safely<T>(
  label: string,
  read: () => Promise<T[]>
): Promise<T[]> {
  try {
    return await read();
  } catch (error) {
    console.error(`sitemap: could not read ${label}`, error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const provider = getProvider();
  const now = new Date();

  // Account and wishlist are deliberately absent: they are per-visitor and
  // marked `noindex`. Listing them would ask a crawler to index a private page.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: url("/shop"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: url("/collections"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: url("/discovery-kits"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: url("/journal"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: url("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: url("/contact"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const [productHandles, collections, kits, articles] = await Promise.all([
    safely("products", () => provider.getAllProductHandles()),
    safely("collections", () => provider.getCollections()),
    safely("kits", () => provider.getDiscoveryKits()),
    safely("journal", () => provider.getJournalArticles()),
  ]);

  return [
    ...staticRoutes,
    ...productHandles.map((handle) => ({
      url: url(`/products/${handle}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...collections.map((collection) => ({
      url: url(`/collections/${collection.handle}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...kits.map((kit) => ({
      url: url(`/discovery-kits/${kit.handle}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...articles.map((article) => ({
      url: url(`/journal/${article.handle}`),
      // The real publish date, not `now` — a sitemap that claims every article
      // changed today teaches crawlers to ignore `lastModified` entirely.
      lastModified: new Date(article.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
