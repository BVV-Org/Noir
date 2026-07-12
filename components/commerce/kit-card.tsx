import Image from "next/image";
import Link from "next/link";
import type { Kit } from "@/types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriceTag } from "@/components/commerce/price-tag";

/**
 * KitCard — a discovery kit.
 *
 * Leads with the vial count, because that is the decision the shopper is
 * actually making: how many things do I get to try. A kit is a Shopify product,
 * so it has stock, and a sold-out kit says so rather than pretending otherwise.
 */
export function KitCard({
  kit,
  priority = false,
  className,
}: {
  kit: Kit;
  priority?: boolean;
  className?: string;
}) {
  const count = kit.productHandles.length;

  return (
    <Card
      as="article"
      interactive
      className={cn("relative flex flex-col overflow-hidden", className)}
    >
      <div className="relative aspect-square overflow-hidden bg-background">
        {kit.image && (
          <Image
            src={kit.image.url}
            alt={kit.image.altText}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className={cn(
              "object-cover transition-transform duration-150 ease-premium group-hover/card:scale-[1.02]",
              !kit.availableForSale && "opacity-60"
            )}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="overline">{count} fragrances</p>
        <h3 className="text-h5 font-semibold text-foreground">
          <Link
            href={`/discovery-kits/${kit.handle}`}
            className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none"
          >
            {kit.title}
          </Link>
        </h3>
        {kit.tagline && (
          <p className="text-small text-muted-foreground">{kit.tagline}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <PriceTag price={kit.price} />
          {!kit.availableForSale && <Badge variant="outline">Sold out</Badge>}
        </div>
      </div>
    </Card>
  );
}
