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
 * ## Why the card has no fixed height
 *
 * An earlier pass sized the image in pixels, which made the frame's aspect
 * ratio a function of column count — portrait at 4-up, letterbox at 2-up — and
 * `object-cover` duly cropped the bottles. The frame is now a `padding-top`
 * percentage, which resolves against WIDTH, so 4:5 holds at every breakpoint.
 *
 * Nothing about the frame changes on hover any more. The CTA is a glass surface
 * that slides up out of the image's bottom edge, over the photo — glass refracts
 * what is behind it, and over the card's flat fill it showed only its bevel.
 * Because it is absolutely positioned inside the image box, it never enters
 * layout: the card measures image + text, and a hovered card cannot stretch its
 * grid row.
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
    <article className={cn("group/card relative flex flex-col", className)}>
      {/* No card fill, padding, or border: the photograph IS the card, running
          edge to edge, with the name and price sitting on the page beneath it.
          The sizer holds the frame open at a constant 4:5 — `padding-top`
          percentages resolve against WIDTH, so the crop stays portrait at every
          column count. It also clips the glass CTA until hover. */}
      <div className="relative w-full pt-[125%]">
        <div className="absolute inset-0 overflow-hidden rounded-lg bg-secondary/40">
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

          {/* Quick View stacks ABOVE the glass pill rather than sharing the
              bottom edge with it — both reveal on the same hover, so they would
              otherwise land on top of each other. */}
          {action && (
            <div
              className={cn(
                "absolute inset-x-3 bottom-[3.75rem] z-20",
                "lg:opacity-0 lg:transition-opacity lg:duration-150 lg:ease-premium",
                "lg:focus-within:opacity-100 lg:group-hover/card:opacity-100"
              )}
            >
              {action}
            </div>
          )}

          {/* The CTA lives INSIDE the image box, which clips it at rest so it
              slides up out of the photo's bottom edge.

              A real <Link>, not a span: it sits at z-20, above the title link's
              `after:inset-0` overlay at z-10, so it was swallowing clicks and
              navigating nowhere. It points at the same product as the title.

              `aria-hidden` + `tabIndex={-1}` because of that duplication — the
              title link already reaches this destination, and exposing both
              would make every card announce its product twice and cost keyboard
              users an extra tab stop per tile for no new destination. */}
          <Link
            href={`/products/${product.handle}`}
            aria-hidden
            tabIndex={-1}
            className={cn(
              "glass-control absolute inset-x-3 bottom-3 z-20 flex h-10 items-center justify-center rounded-full",
              // Scales with the tile: tighter type and inset on a phone-width
              // card, roomier once the grid opens up.
              // The telemetry face (Sometype Mono), uppercase and widely
              // tracked — the register this system already reserves for small
              // labels, and what the nav links wear. Anton and Ribes are both
              // poster faces: at 13px on a pill they read as a shrunken
              // headline rather than a control.
              "font-mono text-[0.68rem] font-medium uppercase tracking-[0.18em] sm:text-[0.72rem]",
              "translate-y-[calc(100%+0.75rem)] transition-transform duration-300 ease-premium",
              "group-hover/card:translate-y-0",
              // No hover on touch, so the pill would never appear. Show it
              // parked in place below `lg` instead of hiding it forever.
              "max-lg:translate-y-0"
            )}
          >
            View product
          </Link>
        </div>
      </div>

      {/* Inset into the photo's top-left corner. Sold-out outranks the tier: it
          changes whether you can buy at all. */}
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

      <div className="mt-4 min-w-0">
        {/* One line, so a long name can't push the price out of alignment with
            the neighbouring cards in the row. */}
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

    </article>
  );
}
