import type {
  Cart,
  CartLine,
  CartLineInput,
  CartLineUpdateInput,
  Product,
  ProductVariant,
} from "@/types";
import { products } from "@/lib/mock/data";
import { money } from "@/lib/mock/data/media";
import { CommerceError } from "@/lib/data/errors";

/**
 * An in-memory Storefront Cart API.
 *
 * Mock parity extends to the cart: without this, the drawer, the quantity
 * steppers, and the line-removal flow would be untestable until real credentials
 * existed, and every bug in them would surface for the first time in production.
 *
 * Two honest limitations, both surfaced in the UI rather than hidden:
 *
 *  1. **Per-process, not persistent.** Carts live in a module-level `Map`. They
 *     survive navigation and refresh (the id is in an httpOnly cookie) but not a
 *     server restart, and they are not shared across serverless instances. Real
 *     carts live in Shopify.
 *  2. **No checkout.** `checkoutUrl` is empty, because there is no Shopify
 *     checkout to redirect to. The drawer disables the button and says so
 *     instead of sending anyone to a dead link.
 */
const carts = new Map<string, Cart>();

/** Money as integer cents — floats accumulate error across a cart's lines. */
const toCents = (amount: string): number =>
  Math.round(Number.parseFloat(amount) * 100);

const fromCents = (cents: number): string => (cents / 100).toFixed(2);

interface Resolved {
  product: Product;
  variant: ProductVariant;
}

/** Find the product/variant a merchandise id refers to. */
function resolveMerchandise(merchandiseId: string): Resolved | null {
  for (const product of products) {
    const variant = product.variants.find((v) => v.id === merchandiseId);
    if (variant) return { product, variant };
  }
  return null;
}

function buildLine(
  lineId: string,
  resolved: Resolved,
  quantity: number
): CartLine {
  const unitCents = toCents(resolved.variant.price.amount);
  return {
    id: lineId,
    merchandiseId: resolved.variant.id,
    productHandle: resolved.product.handle,
    productTitle: resolved.product.title,
    variantTitle: resolved.variant.title,
    image: resolved.product.images[0] ?? null,
    quantity,
    unitPrice: money(fromCents(unitCents)),
    lineTotal: money(fromCents(unitCents * quantity)),
  };
}

/** Recompute totals from the lines. The cart's cost is never stored, only derived. */
function recost(cart: Cart): Cart {
  const subtotalCents = cart.lines.reduce(
    (total, line) => total + toCents(line.lineTotal.amount),
    0
  );

  return {
    ...cart,
    totalQuantity: cart.lines.reduce((total, line) => total + line.quantity, 0),
    cost: {
      subtotal: money(fromCents(subtotalCents)),
      total: money(fromCents(subtotalCents)),
      totalTax: money("0.00"),
    },
  };
}

const emptyCart = (id: string): Cart => ({
  id,
  // Deliberately empty: there is no Shopify checkout behind the mock provider.
  checkoutUrl: "",
  totalQuantity: 0,
  lines: [],
  cost: {
    subtotal: money("0.00"),
    total: money("0.00"),
    totalTax: money("0.00"),
  },
});

let sequence = 0;
const nextId = (prefix: string): string => {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${sequence}`;
};

export function createMockCart(): Cart {
  const cart = emptyCart(nextId("mock-cart"));
  carts.set(cart.id, cart);
  return cart;
}

/** `null` for an unknown id, mirroring `cart(id:)` on an expired cart. */
export function getMockCart(cartId: string): Cart | null {
  return carts.get(cartId) ?? null;
}

export function addToMockCart(cartId: string, lines: CartLineInput[]): Cart {
  const cart = carts.get(cartId) ?? emptyCart(cartId);
  const next = [...cart.lines];

  for (const input of lines) {
    if (input.quantity <= 0) continue;

    const resolved = resolveMerchandise(input.merchandiseId);
    // Shopify answers an unknown merchandise id with a `userErrors` entry, not
    // a silently dropped line. Match that, or the client shows a success toast
    // for a cart that did not change.
    if (!resolved) {
      throw new CommerceError("That product is no longer available.");
    }

    // The same check Shopify performs. The UI disables the button on a sold-out
    // variant, but the API is a separate trust boundary and enforces it too —
    // stock can run out between the render and the click.
    if (!resolved.variant.availableForSale) {
      throw new CommerceError(
        `${resolved.product.title} ${resolved.variant.title} is sold out.`
      );
    }

    // Shopify merges an add of an existing merchandise id into its line.
    const existingIndex = next.findIndex(
      (line) => line.merchandiseId === input.merchandiseId
    );

    if (existingIndex >= 0) {
      const existing = next[existingIndex]!;
      next[existingIndex] = buildLine(
        existing.id,
        resolved,
        existing.quantity + input.quantity
      );
    } else {
      next.push(buildLine(nextId("mock-line"), resolved, input.quantity));
    }
  }

  const updated = recost({ ...cart, lines: next });
  carts.set(cartId, updated);
  return updated;
}

export function updateMockCart(
  cartId: string,
  updates: CartLineUpdateInput[]
): Cart {
  const cart = carts.get(cartId) ?? emptyCart(cartId);
  let next = [...cart.lines];

  for (const update of updates) {
    const index = next.findIndex((line) => line.id === update.id);
    if (index < 0) continue;

    // Quantity 0 removes the line — the Storefront API's own semantics.
    if (update.quantity <= 0) {
      next = next.filter((line) => line.id !== update.id);
      continue;
    }

    const existing = next[index]!;
    const resolved = resolveMerchandise(existing.merchandiseId);
    if (!resolved) continue;
    next[index] = buildLine(existing.id, resolved, update.quantity);
  }

  const updated = recost({ ...cart, lines: next });
  carts.set(cartId, updated);
  return updated;
}

export function removeFromMockCart(cartId: string, lineIds: string[]): Cart {
  const cart = carts.get(cartId) ?? emptyCart(cartId);
  const remove = new Set(lineIds);
  const updated = recost({
    ...cart,
    lines: cart.lines.filter((line) => !remove.has(line.id)),
  });
  carts.set(cartId, updated);
  return updated;
}
