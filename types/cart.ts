import type { Money, ShopImage } from "./common";

/** A single line in the cart (a variant + quantity). */
export interface CartLine {
  id: string;
  merchandiseId: string; // variant id
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  image?: ShopImage | null;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
}

/** Money summary for a cart. */
export interface CartCost {
  subtotal: Money;
  total: Money;
  totalTax?: Money | null;
}

/** Normalized cart (Storefront Cart API). `checkoutUrl` hands off to Shopify. */
export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLine[];
  cost: CartCost;
}

/** Input for adding/updating cart lines. */
export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface CartLineUpdateInput {
  id: string;
  quantity: number;
}
