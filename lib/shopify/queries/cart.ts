import { CART_SUPPORT } from "@/lib/shopify/fragments/cart";

/**
 * Reading a cart.
 *
 * A cart id can be stale: Shopify expires abandoned carts, and a customer who
 * completes checkout leaves the old id behind in the cookie. `cart(id:)` returns
 * `null` for both cases rather than erroring, so the provider treats null as
 * "start a new cart" instead of a failure.
 */
export const GET_CART_QUERY = /* GraphQL */ `
  ${CART_SUPPORT}
  query GetCart($id: ID!) {
    cart(id: $id) {
      ...CartParts
    }
  }
`;
