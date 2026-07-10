/**
 * The cart hook lives with its provider so the context is never exported
 * separately and cannot be consumed unwired. Re-exported here because
 * `hooks/use-cart` is the path the TDD names — swapping the transport beneath
 * it (Storefront proxy today, server actions tomorrow) must not move the import
 * site of every component that adds to a cart.
 */
export { useCart } from "@/components/providers/cart-provider";
