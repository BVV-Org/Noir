import { IMAGE_FRAGMENT } from "./common";

/**
 * Metaobject selection — journal articles, authors, and homepage sections.
 *
 * A metaobject's fields are a flat `[{ key, value }]` list rather than a typed
 * object, so one fragment serves every metaobject type and the normalizer picks
 * the keys it wants. `reference`/`references` resolve the typed fields: the
 * article's author and hero image, the section's collection and product lists.
 *
 * `MetaobjectReferenceParts` is separate from the metafield version because a
 * metaobject field's reference union includes `Collection`, which a product
 * metafield reference never does.
 *
 * Depends on: ImageParts.
 */
export const METAOBJECT_REFERENCE_FRAGMENT = /* GraphQL */ `
  fragment MetaobjectReferenceParts on MetafieldReference {
    __typename
    ... on Product {
      handle
      title
    }
    ... on Collection {
      handle
      title
    }
    ... on MediaImage {
      image {
        ...ImageParts
      }
    }
    ... on Video {
      sources {
        url
        mimeType
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

/** Depends on: MetaobjectReferenceParts, ImageParts. */
export const METAOBJECT_FRAGMENT = /* GraphQL */ `
  fragment MetaobjectParts on Metaobject {
    id
    handle
    type
    fields {
      key
      value
      reference {
        ...MetaobjectReferenceParts
      }
      references(first: 12) {
        nodes {
          ...MetaobjectReferenceParts
        }
      }
    }
  }
`;

export const METAOBJECT_SUPPORT =
  IMAGE_FRAGMENT + METAOBJECT_REFERENCE_FRAGMENT + METAOBJECT_FRAGMENT;
