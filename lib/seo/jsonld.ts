import type { Collection, JournalArticle, Kit, Product } from "@/types";
import { siteConfig } from "@/lib/config/site";
import { absoluteImage } from "./metadata";

/**
 * JSON-LD builders (TDD §11).
 *
 * Structured data is a *claim to a search engine*, so these builders only ever
 * emit what the data supports. In particular there is no `aggregateRating`
 * anywhere: no review provider is connected, and a fabricated rating is both a
 * lie to shoppers and a Google structured-data violation that can earn a manual
 * penalty. The field arrives with the review provider (TDD §20.2).
 *
 * Return type is `JsonLdObject`, not `any` — strict TypeScript is a project rule,
 * and the `<JsonLd>` component serializes whatever it is handed.
 */
export type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdObject
  | JsonLdValue[];

export interface JsonLdObject {
  [key: string]: JsonLdValue | undefined;
}

const url = (path: string): string => new URL(path, siteConfig.url).toString();

/** Site-wide identity. Rendered once, in the root layout. */
export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: absoluteImage(siteConfig.ogImage),
    slogan: siteConfig.tagline,
  };
}

/**
 * `WebSite` with a `SearchAction`, which is what lets Google render a sitelinks
 * search box. The target must match a real, crawlable search URL — ours is
 * `/shop?q=`, which the shop reads server-side.
 */
export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: url("/shop?q={search_term_string}"),
      },
      // Not a typo: schema.org requires this exact string, unquoted.
      "query-input": "required name=search_term_string",
    },
  };
}

export interface Crumb {
  name: string;
  path?: string;
}

/**
 * BreadcrumbList. The final crumb is the current page and carries no `item`,
 * matching the visual breadcrumb where the last entry is not a link.
 */
export function breadcrumbJsonLd(crumbs: Crumb[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(crumb.path ? { item: url(crumb.path) } : {}),
    })),
  };
}

/** Availability, in the vocabulary Google expects. */
const availability = (inStock: boolean): string =>
  inStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

/**
 * Product + Offer.
 *
 * One `Offer` per variant, because a 50ml and a 100ml are different purchasable
 * things at different prices. `priceValidUntil` is omitted rather than invented;
 * Google treats a past date as an expired offer.
 */
export function productJsonLd(product: Product, path: string): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    sku: product.handle,
    url: url(path),
    image: product.images.map((image) => absoluteImage(image.url)),
    ...(product.brand
      ? { brand: { "@type": "Brand", name: product.brand } }
      : {}),
    ...(product.classification.fragranceFamily
      ? { category: product.classification.fragranceFamily }
      : {}),
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      name: variant.title,
      price: variant.price.amount,
      priceCurrency: variant.price.currencyCode,
      availability: availability(variant.availableForSale),
      url: url(path),
      itemCondition: "https://schema.org/NewCondition",
    })),
    // `aggregateRating` is deliberately absent — see the file header.
  };
}

/** A kit is a Product upstream, and is one here too. */
export function kitJsonLd(kit: Kit, path: string): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: kit.title,
    description: kit.description,
    sku: kit.handle,
    url: url(path),
    image: kit.images.map((image) => absoluteImage(image.url)),
    offers: {
      "@type": "Offer",
      price: kit.price.amount,
      priceCurrency: kit.price.currencyCode,
      availability: availability(kit.availableForSale),
      url: url(path),
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

/** CollectionPage + ItemList, so the collection's members are discoverable. */
export function collectionJsonLd(
  collection: Collection,
  path: string
): JsonLdObject {
  const products = collection.products ?? [];

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    description: collection.description ?? collection.tagline ?? "",
    url: url(path),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: url(`/products/${product.handle}`),
        name: product.title,
      })),
    },
  };
}

export function articleJsonLd(
  article: JournalArticle,
  path: string
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    url: url(path),
    datePublished: article.publishedAt,
    // No `dateModified` field exists upstream. Claiming the publish date is a
    // modification date would be a guess, so it is left off.
    ...(article.heroImage
      ? { image: [absoluteImage(article.heroImage.url)] }
      : {}),
    ...(article.author
      ? { author: { "@type": "Person", name: article.author.name } }
      : {}),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteImage(siteConfig.ogImage),
      },
    },
    ...(article.readingTime
      ? { timeRequired: `PT${article.readingTime}M` }
      : {}),
  };
}
