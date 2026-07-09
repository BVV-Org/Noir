import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";

/**
 * Metadata construction (TDD §11).
 *
 * One builder, used by every route, so a page cannot ship with an OpenGraph
 * title that disagrees with its `<title>` or a canonical that points at the
 * wrong origin. Routes pass what is specific to them; everything else is
 * inherited from `siteConfig`.
 *
 * ## Canonicals
 *
 * `alternates.canonical` is a *path*, not an absolute URL. Next resolves it
 * against `metadataBase` (set once in the root layout), so a preview deployment
 * cannot emit canonicals pointing at production and quietly hand it the ranking.
 *
 * ## Indexing
 *
 * Only production is indexable. Vercel sets `VERCEL_ENV` to `preview` on every
 * branch deploy; without this guard, preview URLs compete with production for
 * the same content and split its authority.
 */
export const IS_PRODUCTION = process.env.VERCEL_ENV === "production";

/** OG images must be absolute — crawlers do not resolve relative paths. */
export function absoluteImage(path: string | undefined): string {
  if (!path) return new URL(siteConfig.ogImage, siteConfig.url).toString();
  if (path.startsWith("http")) return path;
  return new URL(path, siteConfig.url).toString();
}

export interface BuildMetadataArgs {
  title?: string;
  description?: string;
  /** Route path, e.g. `/products/crimson-oud`. Becomes the canonical. */
  path?: string;
  image?: string | null;
  /** `article` for journal posts; `website` otherwise. */
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
  /** Account and wishlist pages: private, never indexed. */
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description = siteConfig.description,
  path,
  image,
  type = "website",
  publishedTime,
  authors,
  noIndex = false,
}: BuildMetadataArgs = {}): Metadata {
  const resolvedTitle = title
    ? `${title} — ${siteConfig.name}`
    : `${siteConfig.name} — ${siteConfig.tagline}`;

  // When a route has real imagery — a bottle, a hero, an article — it wins.
  // When it does not, `images` is omitted entirely and Next fills it from the
  // `app/opengraph-image.tsx` file convention. Hardcoding a fallback URL here
  // would shadow that generated card.
  const ogImage = image ? absoluteImage(image) : undefined;

  return {
    title: title ?? undefined,
    description,
    alternates: path ? { canonical: path } : undefined,
    robots: noIndex
      ? { index: false, follow: false }
      : { index: IS_PRODUCTION, follow: IS_PRODUCTION },
    openGraph: {
      type,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      url: path ?? siteConfig.url,
      title: resolvedTitle,
      description,
      ...(ogImage
        ? {
            images: [
              { url: ogImage, width: 1200, height: 630, alt: resolvedTitle },
            ],
          }
        : {}),
      ...(type === "article" ? { publishedTime, authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
