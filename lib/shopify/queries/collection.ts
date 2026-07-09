import {
  METAFIELD_SUPPORT,
  MONEY_FRAGMENT,
  SEO_FRAGMENT,
} from "@/lib/shopify/fragments/common";
import {
  COLLECTION_FRAGMENT,
  PRODUCT_FRAGMENT,
} from "@/lib/shopify/fragments/product";

/**
 * Collection documents.
 *
 * Collections are **automated (smart) collections** keyed on tags (TDD §6.5), so
 * membership is Shopify's problem, not ours: we ask for the collection's
 * products and Shopify applies the rule. Nothing here enumerates handles.
 */
const COLLECTION_SUPPORT =
  METAFIELD_SUPPORT + SEO_FRAGMENT + COLLECTION_FRAGMENT;

/** Index. No products — the cards show a count, and counting is cheaper. */
export const GET_COLLECTIONS_QUERY = /* GraphQL */ `
  ${COLLECTION_SUPPORT}
  query GetCollections($first: Int!) {
    collections(first: $first, sortKey: TITLE) {
      edges {
        cursor
        node {
          ...CollectionParts
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
 * A single collection with its products.
 *
 * `sortKey` here is `ProductCollectionSortKeys`, a *different* enum from
 * `ProductSortKeys` — it has no `RELEVANCE` and uses `COLLECTION_DEFAULT`
 * instead. Passing the product enum silently fails, so the provider maps it.
 */
export const GET_COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  ${COLLECTION_SUPPORT}
  ${MONEY_FRAGMENT}
  ${PRODUCT_FRAGMENT}
  query GetCollectionByHandle(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) {
    collection(handle: $handle) {
      ...CollectionParts
      products(
        first: $first
        after: $after
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
  }
`;

/** Handles only, for `generateStaticParams`. */
export const GET_ALL_COLLECTION_HANDLES_QUERY = /* GraphQL */ `
  query GetAllCollectionHandles($first: Int!) {
    collections(first: $first) {
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
