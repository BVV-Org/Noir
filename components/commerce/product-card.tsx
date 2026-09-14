import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { RARITY_LABELS } from "@/lib/config/site";
import { cn, formatMoney } from "@/lib/utils";
import { Badge, RarityBadge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/commerce/wishlist-button";

/**
 * ProductCard — the catalogue's atom.
 *
 * A white card on a hairline, holding the photograph in an inset well. The
 * inset (8px) is what makes it read as an object rather than a cropped image:
 * the bottle sits inside a frame the way it would in a display case. The well's
 * radius is the card radius minus the inset (24 − 8 = 16px), so the two curves
 * stay concentric.
 *
 * On intent the card lifts two pixels, its shadow deepens, and the photo drifts
 * in by 3% over 700ms. Nothing flashes and nothing changes color — the motion
 * is slow enough to read as weight.
 *
 * ## Why the frame is a padding-top sizer
 *
 * `padding-top` percentages resolve against WIDTH, so the 4:5 portrait crop
 * holds at every column count instead of letterboxing at 2-up.
 *
 * Still a Server Component: the wishlist toggle and any `action` are the only
 * client leaves. The title link stretches over the whole tile via
 * `after:inset-0`; overlay controls sit above it in a higher stacking context.
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
  const price = formatMoney(product.price.amount, product.price.currencyCode);

  const wasDiscounted =
    product.compareAtPrice &&
    Number.parseFloat(product.compareAtPrice.amount) >
      Number.parseFloat(product.price.amount);
  const previousPrice = wasDiscounted
    ? formatMoney(
        product.compareAtPrice!.amount,
        product.compareAtPrice!.currencyCode
      )
    : null;

  return (
    <article
      className={cn(
        "group/card relative flex flex-col rounded-xl border border-border bg-card p-2 shadow-card",
        "transition-[transform,box-shadow] duration-300 ease-premium",
        "hover:-translate-y-0.5 hover:shadow-lift focus-within:shadow-lift",
        className
      )}
    >
      <div className="relative w-full pt-[125%]">
        <div className="absolute inset-0 overflow-hidden rounded-[16px] bg-secondary">
          {cover && (
            <Image
              src={cover.url}
              alt={cover.altText}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              className={cn(
                "object-cover transition-transform duration-700 ease-premium group-hover/card:scale-[1.03]",
                !product.availableForSale && "opacity-50 grayscale"
              )}
            />
          )}

          {/* Sold-out outranks the tier: it changes whether you can buy at all. */}
          <div className="absolute left-2.5 top-2.5 z-20">
            {!product.availableForSale ? (
              <Badge variant="outline" className="backdrop-blur-sm">
                Sold out
              </Badge>
            ) : (
              rarity && (
                <RarityBadge rarity={rarity} label={RARITY_LABELS[rarity]} />
              )
            )}
          </div>

          {/* Wishlist: quiet by default, revealed on intent at pointer sizes;
              always visible on touch where there is no hover. */}
          <div
            className={cn(
              "absolute right-2 top-2 z-20",
              "lg:opacity-0 lg:transition-opacity lg:duration-200 lg:ease-premium",
              "lg:group-hover/card:opacity-100 lg:focus-within:opacity-100"
            )}
          >
            <WishlistButton handle={product.handle} title={product.title} />
          </div>

          {/* The action (Quick View) rises from the well's bottom edge on hover.
              Parked in place below `lg`, where there is no hover. */}
          {action && (
            <div
              className={cn(
                "absolute inset-x-2.5 bottom-2.5 z-20",
                "lg:translate-y-2 lg:opacity-0 lg:transition-[opacity,transform] lg:duration-300 lg:ease-premium",
                "lg:group-hover/card:translate-y-0 lg:group-hover/card:opacity-100",
                "lg:focus-within:translate-y-0 lg:focus-within:opacity-100"
              )}
            >
              {action}
            </div>
          )}
        </div>
      </div>

      <div className="flex min-w-0 items-start justify-between gap-3 px-2 pb-1.5 pt-3">
        <div className="min-w-0">
          {/* One line each, so a long name can't push the price out of
              alignment with the neighbouring cards in the row. */}
          <h3 className="truncate text-small font-medium tracking-[-0.01em] text-foreground">
            <Link
              href={`/products/${product.handle}`}
              className="rounded-sm after:absolute after:inset-0 after:z-10 after:rounded-xl focus-visible:outline-none"
            >
              {product.title}
            </Link>
          </h3>
          {product.brand && (
            <p className="mt-0.5 truncate text-caption text-muted-foreground">
              {product.brand}
            </p>
          )}
        </div>

        <p
          className="flex shrink-0 flex-col items-end"
          aria-label={
            previousPrice ? `${price}, reduced from ${previousPrice}` : undefined
          }
        >
          <span
            aria-hidden={Boolean(previousPrice)}
            className="tabular text-small font-semibold text-foreground"
          >
            {price}
          </span>
          {previousPrice && (
            <s aria-hidden className="tabular text-caption text-muted-foreground">
              {previousPrice}
            </s>
          )}
        </p>
      </div>
    </article>
  );
}
