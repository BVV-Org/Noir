"use client";

import type { ProductVariant } from "@/types";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";

/**
 * BuyNowButton — skip the bag, go straight to checkout.
 *
 * Adds the selected variant, then `buyNow` redirects to Shopify's hosted
 * checkout. Rendered alongside "Add to bag" as the secondary action, and
 * disabled on a sold-out variant or while a cart request is in flight, for the
 * same reason as the add button: the cart is server-owned.
 */
export function BuyNowButton({
  variant,
  size = "lg",
  className,
}: {
  variant: ProductVariant | undefined;
  size?: "default" | "lg";
  className?: string;
}) {
  const { buyNow, pending } = useCart();

  const soldOut = !variant?.availableForSale;
  const disabled = soldOut || pending || !variant;

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      disabled={disabled}
      className={className}
      onClick={() => variant && buyNow(variant.id, 1)}
    >
      {pending ? "Processing…" : "Buy now"}
    </Button>
  );
}
