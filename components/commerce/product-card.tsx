import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { RARITY_LABELS } from "@/lib/config/site";
import { Card } from "@/components/ui/card";
import { RarityBadge } from "@/components/ui/badge";
import { PriceTag } from "@/components/commerce/price-tag";
import { ProductBadge } from "@/components/commerce/product-badge";
import { WishlistButton } from "@/components/commerce/wishlist-button";

/**
 * ProductCard — the catalogue's atom.
 *
 * A Server Component: only the wishlist toggle and whatever `action` supplies
 * are client leaves, so a grid of twenty-four cards ships almost no JavaScript.
 *
 * The title link is stretched over the whole card with `after:inset-0`, giving a
 * card-sized click target from a single, correctly-labelled anchor rather than
 * wrapping the card and swallowing the buttons inside it. The overlay controls
 * sit in a higher stacking context so they stay clickable above it.
 *
 * `sizes` is not optional in a responsive grid — without it `next/image`
 * downloads a viewport-width source for a quarter-width slot.
 */
export function ProductCard({
  product,
  priority = false,
  action,
  className,
}: {
  product: Product;
  /** Set on the first row above the fold only — this is the LCP candidate. */
  priority?: boolean;
  /** Overlay slot, e.g. the shop's Quick View trigger. */
  action?: React.ReactNode;
  className?: string;
}) {
  const cover = product.images[0];
  const rarity = product.classification.rarity;

  return (
    <Card
      as="article"
      interactive
      className={cn("relative flex flex-col overflow-hidden", className)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-background">
        {cover && (
          <Image
            src={cover.url}
            alt={cover.altText}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className={cn(
              "object-cover transition-transform duration-150 ease-premium",
              // Gentle scale, capped at 1.02 per animation-guidelines.md.
              "group-hover/card:scale-[1.02]",
              !product.availableForSale && "opacity-60"
            )}
          />
        )}

        <div className="absolute right-3 top-3 z-10">
          <WishlistButton
            handle={product.handle}
            title={product.title}
            className="-mr-2 -mt-2"
          />
        </div>

        {action && (
          <div
            className={cn(
              "absolute inset-x-3 bottom-3 z-10",
              // Always reachable on touch, revealed on intent at pointer sizes.
              "lg:opacity-0 lg:transition-opacity lg:duration-150 lg:ease-premium",
              "lg:focus-within:opacity-100 lg:group-hover/card:opacity-100"
            )}
          >
            {action}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {product.brand && <p className="overline">{product.brand}</p>}
            <h3 className="mt-2 text-h6 font-semibold text-foreground">
              <Link
                href={`/products/${product.handle}`}
                className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none"
              >
                {product.title}
              </Link>
            </h3>
          </div>
          {rarity && (
            <RarityBadge
              rarity={rarity}
              label={RARITY_LABELS[rarity]}
              className="shrink-0"
            />
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <PriceTag
            price={product.price}
            compareAtPrice={product.compareAtPrice}
          />
          <ProductBadge product={product} />
        </div>
      </div>
    </Card>
  );
}
