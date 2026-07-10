import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";

/**
 * Environment-aware robots.txt (TDD §11).
 *
 * **This file is the only indexing gate.** Preview deployments disallow
 * everything: Vercel gives every branch a public URL, and without this, preview
 * builds get crawled, duplicate the production catalogue, and compete with it in
 * the index.
 *
 * `force-dynamic` is load-bearing. Without it Next prerenders `robots.txt` at
 * build time, freezing the build machine's `VERCEL_ENV` into the response — a
 * production deploy built from a prebuilt artifact would then serve
 * `Disallow: /` forever. Evaluating per request costs one trivial function call
 * and removes an entire class of silent SEO failure.
 *
 * In production, the private surfaces are excluded by path. `/api/` is blocked
 * because a crawler following a link into `/api/cart` accomplishes nothing and
 * spends crawl budget. `/shop?*` is *not* blocked — faceted URLs are the point
 * of the shop, and canonical tags already resolve the duplication.
 */
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  // Read inside the handler, not from a module constant. A module constant is
  // evaluated once when the module is first imported — which, in a prerendered
  // build, is the build itself.
  const isProduction = process.env.VERCEL_ENV === "production";

  if (!isProduction) {
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
