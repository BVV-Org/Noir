import {
  COLLECTION_METAFIELD_KEYS,
  PRODUCT_METAFIELD_KEYS,
} from "@/lib/shopify/metafields";
import { productMetafieldsSelection } from "./common";

/**
 * The canonical Product selection.
 *
 * One fragment, used by every product-shaped read: the grid, the product page,
 * search, collection contents, and discovery kits. A kit *is* a product, so it
 * comes back through this same fragment and normalizes with the same code.
 *
 * `variants(first: 20)` — a fragrance has two or three sizes; twenty is
 * generous. `images(first: 10)` covers the gallery without paginating media.
 *
 * Depends on: ImageParts, MoneyParts, SeoParts, MetafieldParts.
 */
export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductParts on Product {
    id
    handle
    title
    description
    descriptionHtml
    vendor
    availableForSale
    tags
    seo {
      ...SeoParts
    }
    featuredImage {
      ...ImageParts
    }
    images(first: 10) {
      nodes {
        ...ImageParts
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyParts
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyParts
      }
    }
    variants(first: 20) {
      nodes {
        id
        title
        availableForSale
        quantityAvailable
        price {
          ...MoneyParts
        }
        compareAtPrice {
          ...MoneyParts
        }
        selectedOptions {
          name
          value
        }
      }
    }
    ${productMetafieldsSelection(PRODUCT_METAFIELD_KEYS)}
  }
`;

/** Depends on: ImageParts, SeoParts, MetafieldParts. */
export const COLLECTION_FRAGMENT = /* GraphQL */ `
  fragment CollectionParts on Collection {
    id
    handle
    title
    description
    seo {
      ...SeoParts
    }
    image {
      ...ImageParts
    }
    ${productMetafieldsSelection(COLLECTION_METAFIELD_KEYS)}
  }
`;
