import { CART_SUPPORT, CART_USER_ERRORS } from "@/lib/shopify/fragments/cart";

/**
 * Cart mutations (Storefront Cart API).
 *
 * All four return the complete cart through `CartParts`, so a mutation response
 * fully replaces client state — no merging, no drift between what the browser
 * thinks is in the cart and what Shopify will charge for.
 *
 * Each also returns `userErrors`. A Storefront mutation can succeed at the HTTP
 * and GraphQL level while failing as a business operation (a variant that just
 * sold out, a quantity beyond available stock). `userErrors` is the only place
 * that is reported, and `lib/shopify/cart.ts` refuses to ignore it.
 */
export const CART_CREATE_MUTATION = /* GraphQL */ `
  ${CART_SUPPORT}
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...CartParts
      }
      ${CART_USER_ERRORS}
    }
  }
`;

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  ${CART_SUPPORT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartParts
      }
      ${CART_USER_ERRORS}
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  ${CART_SUPPORT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartParts
      }
      ${CART_USER_ERRORS}
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  ${CART_SUPPORT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartParts
      }
      ${CART_USER_ERRORS}
    }
  }
`;
