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
          className="w-full border border-white/15 bg-black/35 font-sans text-[0.7rem] font-normal tracking-[0.2em] text-white backdrop-blur-md hover:bg-black/55"
        >
          Quick View
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:grid-cols-2">
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
