"use client";

import type { Product, ProductVariant } from "@/types";
import { cn, formatMoney } from "@/lib/utils";
import { useScrolled } from "@/hooks/use-scrolled";
import { AddToCartButton } from "@/components/product/add-to-cart-button";

/**
 * StickyAddToCart — the mobile purchase bar (TDD §14).
 *
 * Appears once the real "Add to bag" button has scrolled away, so the shopper is
 * never looking at two of them. It is hidden from `lg` up, where the summary
 * column stays on screen anyway.
 *
 * It sits *above* the `MobileBottomNav`, offset by the bar's height plus the
 * home-indicator inset — two fixed elements sharing the bottom edge would
 * otherwise overlap. It reuses `AddToCartButton`, so there is no second code
 * path deciding when a variant is buyable.
 *
 * `aria-hidden` while off-screen: the same button is already in the tab order
 * further up the page, and a screen-reader user should not meet it twice.
 */
export function StickyAddToCart({
  product,
  variant,
}: {
  product: Product;
  variant: ProductVariant | undefined;
}) {
  const scrolled = useScrolled(600);

  return (
    <div
      aria-hidden={!scrolled}
      inert={!scrolled ? true : undefined}
      className={cn(
        "fixed inset-x-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur-md lg:hidden",
        "bottom-[calc(3.5rem+env(safe-area-inset-bottom))]",
        "transition-[opacity,transform] duration-150 ease-premium",
        scrolled
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      )}
    >
      <div className="flex items-center gap-4 px-5 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-small font-medium text-foreground">
            {product.title}
          </p>
          <p className="text-caption tabular-nums text-muted-foreground">
            {variant
              ? `${variant.title} · ${formatMoney(variant.price.amount, variant.price.currencyCode)}`
              : formatMoney(product.price.amount, product.price.currencyCode)}
          </p>
        </div>

        <AddToCartButton
          variant={variant}
          size="default"
          className="shrink-0"
        />
      </div>
    </div>
  );
}
