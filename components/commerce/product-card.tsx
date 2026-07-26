import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import type { Rarity } from "@/lib/config/site";
import { cn, formatMoney } from "@/lib/utils";
import { WishlistButton } from "@/components/commerce/wishlist-button";

/**
 * ProductCard — the catalogue's atom.
 *
 * The tile is a closed box that opens on intent: the image gives up height on
 * hover and the CTA that was clipped below the fold rises into the space it
 * vacates. Nothing fades in — the card's own geometry does the reveal, so the
 * motion reads as mechanical rather than decorative.
 *
 * ## The heights are load-bearing
 *
 * The reveal is `overflow-hidden` plus arithmetic, not a transform, so the
 * numbers have to agree. Measured from the card's top edge:
 *
 *   CTA top at rest = 16 (pad) + 240 (image) + 12 (gap) + 48 (text) + 12 (its
 *                     own margin) = 328 = the card's height → flush, unseen.
 *   On hover the image gives up 44px and the CTA drops its 12px margin, so the
 *   CTA rises 56px to 272 and ends at 312 — clearing the 16px bottom padding
 *   exactly.
 *
 * Which is why the title is clamped to a single line: a second line would push
 * the CTA into view at rest and the box would never look closed. Changing any
 * one of these means re-deriving the others.
 *
 * Still a Server Component: the wishlist toggle and any `action` are the only
 * client leaves. The title link stretches over the whole tile via
 * `after:inset-0`, so the CTA is a `<span>` rather than a button — a real
 * control there would nest one interactive element inside another. Overlay
 * controls sit above the link in a higher stacking context.
 */

/** Rarity token colors. The color IS the data, so the tier tints its own pill. */
const RARITY_TAG: Record<Rarity, string> = {
  common: "bg-rarity-common",
  rare: "bg-rarity-rare",
  epic: "bg-rarity-epic",
  legendary: "bg-rarity-legendary",
  mythic: "bg-rarity-mythic",
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
        "group/card relative flex h-[328px] flex-col overflow-hidden rounded-lg p-4",
        "bg-secondary/40 transition-colors duration-300 ease-premium hover:bg-card",
        className
      )}
    >
      <div
        className={cn(
          "relative w-full shrink-0 overflow-hidden rounded-md bg-secondary/40",
          "h-[240px] transition-[height] duration-300 ease-premium",
          "group-hover/card:h-[196px]"
        )}
      >
        {cover && (
          <Image
            src={cover.url}
            alt={cover.altText}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className={cn(
              "object-cover",
              !product.availableForSale && "opacity-60"
            )}
          />
        )}

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

        {action && (
          <div
            className={cn(
              "absolute inset-x-3 bottom-3 z-20",
              "lg:opacity-0 lg:transition-opacity lg:duration-150 lg:ease-premium",
              "lg:focus-within:opacity-100 lg:group-hover/card:opacity-100"
            )}
          >
            {action}
          </div>
        )}
      </div>

      {/* The tag rides the card, not the image, so it holds its place while the
          image collapses underneath it. Sold-out outranks the tier: it changes
          whether you can buy at all. */}
      {!product.availableForSale ? (
        <span className="absolute left-3 top-3 z-20 rounded-full bg-background/85 px-3 py-1 font-sans text-[0.7rem] font-medium uppercase tracking-[0.12em] text-foreground backdrop-blur-sm">
          Sold out
        </span>
      ) : (
        rarity && (
          <span
            className={cn(
              "absolute left-3 top-3 z-20 rounded-full px-3 py-1",
              "font-sans text-[0.7rem] font-medium uppercase tracking-[0.12em] text-black",
              RARITY_TAG[rarity]
            )}
          >
            {rarity}
          </span>
        )
      )}

      <div className="mt-3 min-w-0">
        {/* One line, always — see the height arithmetic above. */}
        <h3 className="truncate font-sans text-[0.72rem] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          <Link
            href={`/products/${product.handle}`}
            className="rounded-sm after:absolute after:inset-0 after:z-10 focus-visible:outline-none"
          >
            {product.title}
          </Link>
        </h3>

        {/*
          Money in the platform default grotesque (`font-system`), not the mono
          telemetry face and not the branded body face: mono's even advances
          flatten the price into metadata, and the reference card this follows
          declares no font-family at all, so its numerals render native.
          `tabular-nums` is kept so digits still align down a column of cards.
        */}
        <p
          className="mt-1 flex items-baseline gap-2"
          aria-label={
            previousPrice ? `${price}, reduced from ${previousPrice}` : undefined
          }
        >
          <span
            aria-hidden={Boolean(previousPrice)}
            className="font-system text-base font-bold tabular-nums text-foreground"
          >
            {price}
          </span>
          {previousPrice && (
            <s
              aria-hidden
              className="font-system text-[0.8rem] font-normal tabular-nums text-muted-foreground"
            >
              {previousPrice}
            </s>
          )}
        </p>
      </div>

      {/* Clipped at rest, lifted into the image's vacated height on hover. A
          span, not a button: the stretched title link already owns this area. */}
      <span
        aria-hidden
        className={cn(
          "mt-3 flex h-10 w-full shrink-0 items-center justify-center rounded-full",
          "bg-foreground font-sans text-[0.8rem] font-medium text-background",
          "transition-[margin,background-color,color] duration-300 ease-premium",
          // The accent lands on card hover rather than on the CTA's own hover:
          // the stretched link's `after:inset-0` sits over this span, so pointer
          // events never reach it and a `hover:` here would be dead styling.
          "group-hover/card:mt-0",
          "group-hover/card:bg-yellow group-hover/card:text-yellow-foreground"
        )}
      >
        View product
      </span>
    </article>
  );
}
