import {
  METAFIELD_SUPPORT,
  MONEY_FRAGMENT,
  SEO_FRAGMENT,
} from "@/lib/shopify/fragments/common";
import { PRODUCT_FRAGMENT } from "@/lib/shopify/fragments/product";

/**
 * Discovery kit documents.
 *
 * A kit is a Product (TDD §6.5), so there is no `KitParts` fragment — it reuses
 * `ProductParts` and the normalizer projects it into a `Kit`. The only thing
 * that distinguishes a kit is the `discovery-kit` tag (for findability) and
 * `nv.is_kit` (for meaning).
 *
 * `nv.kit_products` is a `list.product_reference`. It resolves through the
 * `references` selection already present in `MetafieldParts` — but references
 * come back as bare handles, so the provider re-fetches each referenced product
 * to render it as a card. One extra round trip on a page that is cached for an
 * hour is the right trade against a recursive product fragment, which GraphQL
 * forbids anyway.
 */
const KIT_SUPPORT =
  METAFIELD_SUPPORT + MONEY_FRAGMENT + SEO_FRAGMENT + PRODUCT_FRAGMENT;

export const GET_KITS_QUERY = /* GraphQL */ `
  ${KIT_SUPPORT}
  query GetDiscoveryKits($first: Int!, $query: String!) {
    products(first: $first, query: $query) {
      edges {
        cursor
        node {
          ...ProductParts
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_KIT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${KIT_SUPPORT}
  query GetKitByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductParts
    }
  }
`;
