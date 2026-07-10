"use client";

import type { ProductVariant } from "@/types";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";

/**
 * AddToCartButton — one button, used by the product summary and the sticky bar.
 *
 * Its label is the truth about what will happen: "Sold out" when the selected
 * size cannot be bought, "Adding…" while the request is in flight, "Add to bag"
 * otherwise. It never reads "Add to bag" on a variant that would fail.
 *
 * Disabled while `pending` because the cart is server-owned: a second click
 * before the first response lands adds a second unit the shopper did not ask
 * for.
 */
export function AddToCartButton({
  variant,
  size = "lg",
  className,
}: {
  variant: ProductVariant | undefined;
  size?: "default" | "lg";
  className?: string;
}) {
  const { addItem, pending } = useCart();

  const soldOut = !variant?.availableForSale;
  const disabled = soldOut || pending || !variant;

  return (
    <Button
      type="button"
      size={size}
      disabled={disabled}
      className={className}
      onClick={() => variant && addItem(variant.id, 1)}
    >
      {soldOut ? "Sold out" : pending ? "Adding…" : "Add to bag"}
    </Button>
  );
}
