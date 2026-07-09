import { IMAGE_FRAGMENT, MONEY_FRAGMENT } from "./common";

/**
 * The Cart selection, shared by the cart query and all four cart mutations.
 *
 * Every mutation returns the whole cart, so the client never has to reconcile a
 * partial update against local state — the response *is* the new truth. That is
 * why `cartLinesAdd` and `cartLinesRemove` select exactly the same shape.
 *
 * Depends on: ImageParts, MoneyParts.
 */
export const CART_FRAGMENT = /* GraphQL */ `
  fragment CartParts on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        ...MoneyParts
      }
      totalAmount {
        ...MoneyParts
      }
      totalTaxAmount {
        ...MoneyParts
      }
    }
    lines(first: 100) {
      edges {
        cursor
        node {
          id
          quantity
          cost {
            totalAmount {
              ...MoneyParts
            }
            amountPerQuantity {
              ...MoneyParts
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              image {
                ...ImageParts
              }
              product {
                handle
                title
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/** `userErrors` is the only place Shopify reports a *business* failure. */
export const CART_USER_ERRORS = /* GraphQL */ `
  userErrors {
    field
    message
  }
`;

/** Everything a cart document needs, in dependency order. */
export const CART_SUPPORT = IMAGE_FRAGMENT + MONEY_FRAGMENT + CART_FRAGMENT;
