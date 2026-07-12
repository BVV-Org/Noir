import type { Product } from "@/types";
import { Badge, type BadgeProps } from "@/components/ui/badge";

/**
 * ProductBadge — the single most important thing to say about a product.
 *
 * A product can carry several `nv` flags at once, but a card showing four
 * badges says nothing. This resolves the flags to exactly one badge by
 * precedence: stock state first (it changes whether you can buy), then scarcity,
 * then curation, then popularity. Rarity is deliberately excluded — it has its
 * own `RarityBadge` and its own place in the layout.
 *
 * Returns `null` when a product is unremarkable, which most products are.
 */
type BadgeSpec = { label: string; variant: BadgeProps["variant"] };

function resolve(product: Product): BadgeSpec | null {
  if (!product.availableForSale) {
    return { label: "Sold out", variant: "outline" };
  }
  if (product.flags.limitedDrop) {
    return { label: "Limited", variant: "accent" };
  }
  if (product.flags.editorsPick) {
    return { label: "Editor's pick", variant: "default" };
  }
  if (product.flags.newArrival) return { label: "New", variant: "outline" };
  if (product.flags.bestSeller) {
    return { label: "Best seller", variant: "default" };
  }
  if (product.flags.staffFavorite) {
    return { label: "Staff favourite", variant: "default" };
  }
  return null;
}

export function ProductBadge({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const badge = resolve(product);
  if (!badge) return null;

  return (
    <Badge variant={badge.variant} className={className}>
      {badge.label}
    </Badge>
  );
}
