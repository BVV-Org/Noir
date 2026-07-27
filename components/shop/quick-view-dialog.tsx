"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { RARITY_LABELS } from "@/lib/config/site";
import { Button } from "@/components/ui/button";
import { RarityBadge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PriceTag } from "@/components/commerce/price-tag";
import { PerformanceBar } from "@/components/product/performance-bar";
import { WishlistButton } from "@/components/commerce/wishlist-button";

/**
 * QuickViewDialog — a look at a fragrance without leaving the grid.
 *
 * Shows the three numbers that decide whether a bottle is worth a click
 * (longevity, projection, versatility) and the note pyramid in summary. It is
 * deliberately not a miniature product page: the "View full details" link is
 * the primary action, because everything that requires a decision — variants,
 * the full pyramid, similar fragrances — lives there.
 *
 * Radix moves focus into the dialog and restores it to the trigger on close, so
 * a keyboard user returns to the card they opened.
 */
export function QuickViewDialog({ product }: { product: Product }) {
  const cover = product.images[0];
  const rarity = product.classification.rarity;
  const { longevity, projection, versatility } = product.performance;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          // `relative` so the ::before sheen has something to anchor to — the
          // card's CTA gets that from its own `absolute`.
          className="glass-control relative w-full rounded-full font-button text-[0.75rem] uppercase tracking-[0.08em] hover:text-black sm:text-[0.85rem] sm:tracking-[0.1em]"
        >
          Quick View
        </Button>
      </DialogTrigger>

      <DialogContent
        // `.liquid-panel` overrides the base `bg-card` / `border-border`: it is
        // declared after the utility layer in globals.css, so it wins at equal
        // specificity. An opaque card fill here would sit in front of the
        // backdrop-filter and leave nothing to see through.
        className="liquid-panel rounded-[1.75rem] sm:grid-cols-2"
        // A scrim that darkens without erasing: the panel refracts what is
        // behind it, so the page has to stay legible back there.
        overlayClassName="bg-black/45 backdrop-blur-[2px]"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-background">
          {cover && (
            <Image
              src={cover.url}
              alt={cover.altText}
              fill
              sizes="(min-width: 640px) 40vw, 90vw"
              className="object-cover"
            />
          )}
          <WishlistButton
            handle={product.handle}
            title={product.title}
            className="absolute right-2 top-2"
          />
        </div>

        <div className="flex flex-col gap-5">
          <div>
            {product.brand && <p className="overline">{product.brand}</p>}
            <DialogTitle className="mt-2 pr-12">{product.title}</DialogTitle>
            {rarity && (
              <RarityBadge
                rarity={rarity}
                label={RARITY_LABELS[rarity]}
                className="mt-3"
              />
            )}
          </div>

          <DialogDescription>{product.description}</DialogDescription>

          <PriceTag
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="lg"
          />

          <div className="flex flex-col gap-3">
            {typeof longevity === "number" && (
              <PerformanceBar label="Longevity" value={longevity} />
            )}
            {typeof projection === "number" && (
              <PerformanceBar label="Projection" value={projection} />
            )}
            {typeof versatility === "number" && (
              <PerformanceBar label="Versatility" value={versatility} />
            )}
          </div>

          <dl className="flex flex-col gap-1 text-caption">
            <div className="flex gap-2">
              <dt className="shrink-0 text-muted-foreground">Top</dt>
              <dd className="text-foreground">
                {product.notes.top.join(", ")}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 text-muted-foreground">Heart</dt>
              <dd className="text-foreground">
                {product.notes.heart.join(", ")}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 text-muted-foreground">Base</dt>
              <dd className="text-foreground">
                {product.notes.base.join(", ")}
              </dd>
            </div>
          </dl>

          <Button asChild className="mt-auto">
            <Link href={`/products/${product.handle}`}>View full details</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
