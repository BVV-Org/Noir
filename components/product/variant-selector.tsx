"use client";

import * as React from "react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { PriceTag } from "@/components/commerce/price-tag";
import { WishlistButton } from "@/components/commerce/wishlist-button";

/**
 * VariantSelector — size, and the price that follows from it.
 *
 * Native radios inside a fieldset, visually replaced by the labels. This is the
 * one control shape that gets group semantics, arrow-key navigation, and form
 * submission correct without a line of ARIA. Sold-out sizes are `disabled` and
 * say so, rather than being hidden — a shopper needs to know the 100ml exists.
 *
 * The selected variant drives the displayed price, so the number on screen is
 * always the number for the size that is chosen.
 *
 * Extension point (do not implement in V1): the "Add to bag" control mounts
 * beneath this and, on mobile, in `StickyAddToCart`. Both arrive with the
 * Storefront Cart API and `useCart` (TDD §9). Until a cart exists there is
 * nothing for the button to add to, so none is rendered.
 */
export function VariantSelector({ product }: { product: Product }) {
  // Open on a size the shopper can actually buy; fall back to the first when
  // the whole product is sold out. `findIndex` returns -1, not null.
  const firstAvailable = product.variants.findIndex((v) => v.availableForSale);
  const [selected, setSelected] = React.useState(Math.max(firstAvailable, 0));

  const variant = product.variants[selected] ?? product.variants[0];
  if (!variant) return null;

  return (
    <div className="flex flex-col gap-6">
      <PriceTag
        price={variant.price}
        compareAtPrice={
          selected === 0 ? product.compareAtPrice : variant.compareAtPrice
        }
        size="lg"
      />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 overline">Size</legend>
        <div className="flex flex-wrap gap-3">
          {product.variants.map((option, index) => {
            const id = `variant-${option.id}`;
            const disabled = !option.availableForSale;
            return (
              <div key={option.id}>
                <input
                  type="radio"
                  id={id}
                  name="variant"
                  className="peer sr-only"
                  checked={index === selected}
                  disabled={disabled}
                  onChange={() => setSelected(index)}
                />
                <label
                  htmlFor={id}
                  className={cn(
                    "inline-flex min-h-11 cursor-pointer items-center rounded-md border px-5 text-small transition-colors duration-150 ease-premium",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
                    "peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary",
                    disabled
                      ? "cursor-not-allowed border-border text-muted-foreground line-through opacity-60"
                      : "border-border text-foreground hover:border-border/80"
                  )}
                >
                  {option.title}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <WishlistButton
          handle={product.handle}
          title={product.title}
          className="border border-border bg-transparent"
        />
        <p className="text-small text-muted-foreground">
          {variant.availableForSale
            ? "In stock — save it to your wishlist."
            : "This size is sold out."}
        </p>
      </div>
    </div>
  );
}
