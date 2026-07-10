import { METAOBJECT_SUPPORT } from "@/lib/shopify/fragments/metaobject";

/**
 * Journal documents — `nv_journal_article` metaobjects (TDD §8).
 *
 * `metaobjects(type:)` has no `handle` filter, so a single article is fetched by
 * its composite `MetaobjectHandle` (`{ type, handle }`) through the singular
 * `metaobject(handle:)` field. That is the only way to read one metaobject by
 * handle in the Storefront API.
 */
export const GET_JOURNAL_ARTICLES_QUERY = /* GraphQL */ `
  ${METAOBJECT_SUPPORT}
  query GetJournalArticles($first: Int!, $after: String) {
    metaobjects(type: "nv_journal_article", first: $first, after: $after) {
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

export const GET_JOURNAL_ARTICLE_BY_HANDLE_QUERY = /* GraphQL */ `
  ${METAOBJECT_SUPPORT}
  query GetJournalArticleByHandle($handle: String!) {
    metaobject(handle: { type: "nv_journal_article", handle: $handle }) {
      ...MetaobjectParts
    }
  }
`;
