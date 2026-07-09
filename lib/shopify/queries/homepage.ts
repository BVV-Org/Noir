import { METAOBJECT_SUPPORT } from "@/lib/shopify/fragments/metaobject";

/**
 * Homepage composition — ordered, toggleable `nv_homepage_section` metaobjects.
 *
 * Shopify returns metaobjects in creation order with no `sortKey`, so ordering
 * by the section's own `order` field is the normalizer's job. Disabled sections
 * are filtered after the fetch for the same reason: `metaobjects()` cannot
 * filter on a field value.
 */
export const GET_HOMEPAGE_SECTIONS_QUERY = /* GraphQL */ `
  ${METAOBJECT_SUPPORT}
  query GetHomepageSections($first: Int!) {
    metaobjects(type: "nv_homepage_section", first: $first) {
      edges {
        cursor
        node {
          ...MetaobjectParts
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
