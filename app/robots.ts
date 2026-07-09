import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";
import { IS_PRODUCTION } from "@/lib/seo/metadata";

/**
 * Environment-aware robots.txt (TDD §11).
 *
 * Preview deployments disallow everything. Vercel gives every branch a public
 * URL; without this, preview builds get crawled, duplicate the production
 * catalogue, and compete with it in the index.
 *
 * In production, the private surfaces are excluded by path. `/api/` is blocked
 * because a crawler following a link into `/api/cart` accomplishes nothing and
 * spends crawl budget. `/shop?*` is *not* blocked — faceted URLs are the point
 * of the shop, and canonical tags already resolve the duplication.
 */
export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/account", "/account/", "/wishlist"],
      },
    ],
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
    host: siteConfig.url,
  };
}
