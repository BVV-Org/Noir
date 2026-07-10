"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/types";
import { useWishlist } from "@/hooks/use-wishlist";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ProductCard } from "@/components/commerce/product-card";
import { EmptyState } from "@/components/commerce/empty-state";
import { ProductGridSkeleton } from "@/components/shop/product-grid-skeleton";

/**
 * WishlistContent — the saved list, rehydrated against live product data.
 *
 * The page hands down the full catalogue from the provider and this component
 * selects from it by handle. Prices, stock, and imagery are therefore always
 * current; only the *identity* of a saved item was ever persisted.
 *
 * Before `hydrated` the saved handles are unknown — localStorage has not been
 * read — so a skeleton is shown rather than the empty state. Flashing "nothing
 * saved" at someone with twelve saved bottles is worse than a moment of
 * loading.
 */
export function WishlistContent({ catalogue }: { catalogue: Product[] }) {
  const { handles, hydrated, clear } = useWishlist();

  if (!hydrated) return <ProductGridSkeleton count={4} />;

  // Preserve the order the visitor saved things in, not catalogue order.
  const saved = handles
    .map((handle) => catalogue.find((product) => product.handle === handle))
    .filter((product): product is Product => Boolean(product));

  if (saved.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Nothing saved yet"
        description="Tap the heart on any fragrance to keep it here. Your list lives in this browser."
        action={
          <Button asChild>
            <Link href="/shop">Browse fragrances</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className="text-small text-muted-foreground">
          {saved.length} {saved.length === 1 ? "fragrance" : "fragrances"} saved
        </p>
        <Button variant="ghost" size="sm" onClick={clear}>
          Clear all
        </Button>
      </div>

      <Stagger
        as="ul"
        className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {saved.map((product) => (
          <StaggerItem as="li" key={product.id} className="flex">
            <ProductCard product={product} className="w-full" />
          </StaggerItem>
        ))}
      </Stagger>
    </>
  );
}
