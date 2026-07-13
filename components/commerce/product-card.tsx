import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import type { Rarity } from "@/lib/config/site";
import { cn, formatMoney } from "@/lib/utils";
import { WishlistButton } from "@/components/commerce/wishlist-button";

/**
 * ProductCard — the catalogue's atom, pared to essentials.
 *
 * Editorial and quiet: the product image carries the card, and only the name,
 * price, and a single rarity dot sit beneath it. Brand line, compare-at price,
 * and the promotional badges were removed — the grid reads as a gallery, not a
 * spec sheet. The rarity dot is the one place a tier color appears here; the
 * color IS the data, so it stays even in the minimal layout.
 *
 * Still a Server Component: only the wishlist toggle and any `action` are client
 * leaves. The title link stretches over the whole card via `after:inset-0`, so
 * the entire tile is one correctly-labelled target; overlay controls sit above
 * it in a higher stacking context.
 */

/** Rarity token colors — kept as a single understated dot + label. */
const RARITY_TEXT: Record<Rarity, string> = {
  common: "text-rarity-common",
  rare: "text-rarity-rare",
  epic: "text-rarity-epic",
  legendary: "text-rarity-legendary",
  mythic: "text-rarity-mythic",
};

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

  return (
    <article className={cn("group/card relative flex flex-col", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-secondary/40">
        {cover && (
          <Image
            src={cover.url}
            alt={cover.altText}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className={cn(
              "object-cover transition-transform duration-500 ease-premium",
              "group-hover/card:scale-[1.03]",
              !product.availableForSale && "opacity-60"
            )}
          />
        )}

        {/* Wishlist: quiet by default, revealed on intent at pointer sizes;
            always visible on touch where there is no hover. */}
        <div
          className={cn(
            "absolute right-2 top-2 z-10",
            "lg:opacity-0 lg:transition-opacity lg:duration-200 lg:ease-premium",
            "lg:group-hover/card:opacity-100 lg:focus-within:opacity-100"
          )}
        >
          <WishlistButton handle={product.handle} title={product.title} />
        </div>

        {action && (
          <div
            className={cn(
              "absolute inset-x-3 bottom-3 z-10",
              "lg:opacity-0 lg:transition-opacity lg:duration-150 lg:ease-premium",
              "lg:focus-within:opacity-100 lg:group-hover/card:opacity-100"
            )}
          >
            {action}
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-3 pt-4">
        <div className="min-w-0">
          <h3 className="text-base leading-tight text-foreground">
            <Link
              href={`/products/${product.handle}`}
              className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none"
            >
              {product.title}
            </Link>
          </h3>
          <p className="mt-2 font-mono text-small tabular-nums text-muted-foreground">
            {price}
          </p>
        </div>

        {rarity && (
          <span
            className={cn(
              "mt-1.5 shrink-0 font-sans text-[0.7rem] font-normal uppercase tracking-[0.16em]",
              RARITY_TEXT[rarity]
            )}
          >
            {rarity}
          </span>
        )}
      </div>
    </article>
  );
}
