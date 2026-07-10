import "server-only";
import type { Cart, CartLineInput, CartLineUpdateInput } from "@/types";
import { ShopifyError, shopifyFetch } from "./client";
import { normalizeCart } from "./normalize";
import { GET_CART_QUERY } from "./queries/cart";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
} from "./mutations/cart";
import type {
  CartCreateResponse,
  CartLinesAddResponse,
  CartLinesRemoveResponse,
  CartLinesUpdateResponse,
  CartResponse,
  ShopifyCartMutationPayload,
} from "./raw-types";

/**
 * Storefront Cart API operations.
 *
 * Cart reads and writes are **never cached**. A cached cart is a wrong cart, and
 * Next's default `fetch` caching would happily serve one visitor's cart to the
 * next. Every call here passes `cache: "no-store"`.
 */
const noStore = { cache: "no-store" as RequestCache };

/**
 * Unwrap a mutation payload.
 *
 * A Storefront cart mutation can return HTTP 200 with no GraphQL errors and
 * still have failed: `userErrors` carries out-of-stock, quantity-exceeded, and
 * invalid-merchandise failures. Treating those as success is how a storefront
 * ends up showing an item that checkout will reject.
 */
function unwrap(payload: ShopifyCartMutationPayload, operation: string): Cart {
  if (payload.userErrors.length > 0) {
    const [first] = payload.userErrors;
    throw new ShopifyError(
      first?.message ?? `${operation} failed`,
      undefined,
      payload.userErrors
    );
  }
  if (!payload.cart) {
    throw new ShopifyError(`${operation} returned no cart`);
  }
  return normalizeCart(payload.cart);
}

export async function createCart(lines: CartLineInput[] = []): Promise<Cart> {
  const data = await shopifyFetch<CartCreateResponse>({
    query: CART_CREATE_MUTATION,
    variables: { lines },
    ...noStore,
  });
  return unwrap(data.cartCreate, "cartCreate");
}

/**
 * `null` for an expired, completed, or unknown cart id. Shopify returns null
 * rather than erroring, and the caller's correct response is to start a new
 * cart — not to surface a failure the visitor cannot act on.
 */
export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<CartResponse, { id: string }>({
    query: GET_CART_QUERY,
    variables: { id: cartId },
    ...noStore,
  });
  return data.cart ? normalizeCart(data.cart) : null;
}

export async function addToCart(
  cartId: string,
  lines: CartLineInput[]
): Promise<Cart> {
  const data = await shopifyFetch<CartLinesAddResponse>({
    query: CART_LINES_ADD_MUTATION,
    variables: { cartId, lines },
    ...noStore,
  });
  return unwrap(data.cartLinesAdd, "cartLinesAdd");
}

export async function updateCart(
  cartId: string,
  lines: CartLineUpdateInput[]
): Promise<Cart> {
  const data = await shopifyFetch<CartLinesUpdateResponse>({
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId, lines },
    ...noStore,
  });
  return unwrap(data.cartLinesUpdate, "cartLinesUpdate");
}

export async function removeFromCart(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  const data = await shopifyFetch<CartLinesRemoveResponse>({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds },
    ...noStore,
  });
  return unwrap(data.cartLinesRemove, "cartLinesRemove");
}
