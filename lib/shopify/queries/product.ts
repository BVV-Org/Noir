import {
  METAFIELD_SUPPORT,
  MONEY_FRAGMENT,
  SEO_FRAGMENT,
} from "@/lib/shopify/fragments/common";
import { PRODUCT_FRAGMENT } from "@/lib/shopify/fragments/product";

/**
 * Product documents.
 *
 * `PRODUCT_SUPPORT` bundles every fragment `ProductParts` depends on, in
 * dependency order, so a document is always `SUPPORT + PRODUCT_FRAGMENT + query`.
 * Composing this way is what keeps the selection identical across the grid, the
 * product page, search, and kits — there is exactly one place a product's shape
 * is described.
 */
const PRODUCT_SUPPORT =
  METAFIELD_SUPPORT + MONEY_FRAGMENT + SEO_FRAGMENT + PRODUCT_FRAGMENT;

/** Paginated catalogue read. `query` comes from `buildProductQuery`. */
export const GET_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_SUPPORT}
  query GetProducts(
    $first: Int!
    $after: String
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) {
    products(
      first: $first
      after: $after
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
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

export const GET_PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${PRODUCT_SUPPORT}
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductParts
    }
  }
`;

/**
 * Handles only — for `generateStaticParams`.
 *
 * Deliberately does not reuse `ProductParts`: pulling every metafield for every
 * product just to read `handle` would be a multi-megabyte response at build
 * time. Kits are excluded here too, since they have their own route.
 */
export const GET_ALL_PRODUCT_HANDLES_QUERY = /* GraphQL */ `
  query GetAllProductHandles($first: Int!, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query) {
      edges {
        cursor
        node {
          handle
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Search. Structurally identical to `GetProducts` — Shopify has no separate
 * search endpoint for products; relevance comes from `sortKey: RELEVANCE`
 * combined with a free-text `query`.
 */
export const SEARCH_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_SUPPORT}
  query SearchProducts(
    $first: Int!
    $after: String
    $query: String!
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) {
    products(
      first: $first
      after: $after
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
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
