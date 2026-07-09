/**
 * The wishlist hook lives with its provider so the context is never exported
 * separately and cannot be consumed unwired. Re-exported here because
 * `hooks/use-wishlist` is the path the TDD names, and the storage swap in V2
 * should not move the import site.
 */
export { useWishlist } from "@/components/providers/wishlist-provider";
