import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Collection } from "@/types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ParallaxMedia } from "@/components/motion/parallax-media";

/**
 * CollectionCard — a door into the catalogue.
 *
 * Wider than a product card and image-led: a collection is an idea, not an
 * object, so the type sits over the artwork rather than beneath it. The scrim is
 * a gradient rather than a flat overlay so the artwork stays legible at the top
 * while the title keeps its contrast at the bottom.
 */
export function CollectionCard({
  collection,
  priority = false,
  className,
}: {
  collection: Collection;
  priority?: boolean;
  className?: string;
}) {
  const { image, title, tagline, handle, productCount } = collection;

  return (
    <Card
      as="article"
      interactive
      className={cn("relative overflow-hidden border-0", className)}
    >
      <div className="relative aspect-[4/3] sm:aspect-[16/10]">
        {image && (
          <ParallaxMedia className="absolute inset-0">
            <Image
              src={image.url}
              alt={image.altText}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-cover"
            />
          </ParallaxMedia>
        )}

        {/* Decorative: the heading below carries the meaning. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"
        />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
          <div className="min-w-0">
            {typeof productCount === "number" && (
              <p className="overline">
                {productCount} {productCount === 1 ? "fragrance" : "fragrances"}
              </p>
            )}
            <h3 className="mt-2 text-h3 font-semibold text-foreground">
              {title}
            </h3>
            {tagline && (
              <p className="mt-2 line-clamp-1 text-small text-muted-foreground">
                {tagline}
              </p>
            )}
          </div>

          <ArrowRight
            aria-hidden
            className="mb-1 size-5 shrink-0 text-muted-foreground transition-transform duration-150 ease-premium group-hover/card:translate-x-1 group-hover/card:text-foreground"
          />
        </div>
      </div>

      {/* One click target over the whole box, not just the title. The card has
          no other interactive children, so a full-bleed overlay link is the
          simplest correct hit area. */}
      <Link
        href={`/collections/${handle}`}
        aria-label={title}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
    </Card>
  );
}
