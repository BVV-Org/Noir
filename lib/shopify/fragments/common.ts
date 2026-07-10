import { metafieldIdentifiers } from "@/lib/shopify/metafields";

/**
 * The leaf fragments every other document is built from.
 *
 * GraphQL requires a fragment to be defined exactly once per document, so
 * fragments are composed by string concatenation at module load and each query
 * lists its dependencies once. Duplicating a fragment into a document is a
 * server-side error, not a style problem — hence the strict layering here.
 */

export const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment ImageParts on Image {
    url
    altText
    width
    height
  }
`;

export const MONEY_FRAGMENT = /* GraphQL */ `
  fragment MoneyParts on MoneyV2 {
    amount
    currencyCode
  }
`;

export const SEO_FRAGMENT = /* GraphQL */ `
  fragment SeoParts on SEO {
    title
    description
  }
`;

/**
 * A metafield's resolved reference.
 *
 * `Video` covers `nv.hero_video`; `MediaImage` covers `nv.rotation_360` frames;
 * `Product` covers the similar/related/kit reference lists; `Metaobject` covers
 * optional `nv_note` / `nv_brand` promotion. Anything else falls through to
 * `__typename` and is ignored by the normalizer rather than crashing it.
 *
 * Depends on: ImageParts.
 */
export const METAFIELD_REFERENCE_FRAGMENT = /* GraphQL */ `
  fragment MetafieldReferenceParts on MetafieldReference {
    __typename
    ... on Product {
      handle
      title
    }
    ... on Video {
      sources {
        url
        mimeType
      }
    }
    ... on MediaImage {
      image {
        ...ImageParts
      }
    }
    ... on Metaobject {
      type
      handle
      fields {
        key
        value
      }
    }
  }
`;

/** Depends on: MetafieldReferenceParts, ImageParts. */
export const METAFIELD_FRAGMENT = /* GraphQL */ `
  fragment MetafieldParts on Metafield {
    key
    namespace
    type
    value
    reference {
      ...MetafieldReferenceParts
    }
    references(first: 12) {
      nodes {
        ...MetafieldReferenceParts
      }
    }
  }
`;

/** The `metafields(identifiers:)` selection, built from the key registry. */
export const productMetafieldsSelection = (
  keys: readonly string[]
): string => /* GraphQL */ `
    metafields(identifiers: [${metafieldIdentifiers(keys)}]) {
      ...MetafieldParts
    }
`;

/** Everything a metafield selection needs, in dependency order. */
export const METAFIELD_SUPPORT =
  IMAGE_FRAGMENT + METAFIELD_REFERENCE_FRAGMENT + METAFIELD_FRAGMENT;
