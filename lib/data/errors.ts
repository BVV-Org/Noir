/**
 * The error both providers speak.
 *
 * A commerce operation can fail for a reason the shopper can act on — a variant
 * sold out between render and click, a quantity beyond available stock. Shopify
 * reports these through `userErrors`; the mock provider must report them the
 * same way, or the cart route learns two different failure vocabularies and the
 * mock stops being a faithful rehearsal of production.
 *
 * `ShopifyError` extends this, so `/api/cart` catches one type and maps it to a
 * 409. Anything else is an infrastructure failure and becomes a 502.
 *
 * This module deliberately has no `server-only` marker and no imports: it sits
 * beneath both providers.
 */
export class CommerceError extends Error {
  constructor(
    message: string,
    readonly details?: unknown
  ) {
    super(message);
    this.name = "CommerceError";
  }
}
