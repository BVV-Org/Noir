"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/hooks/use-wishlist";

/**
 * WishlistButton — the save toggle that sits over a product image.
 *
 * `aria-pressed` carries the state; the provider announces the change once, in
 * its own live region. The label names the product so a screen-reader user
 * moving between cards knows which "Save" they have landed on.
 *
 * Until the provider has read localStorage the button renders unsaved, which
 * matches the server HTML exactly — a saved heart would flash on hydration.
 */
export function WishlistButton({
  handle,
  title,
  className,
}: {
  handle: string;
  title: string;
  className?: string;
}) {
  const { has, toggle, hydrated } = useWishlist();
  const saved = hydrated && has(handle);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={
        saved ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`
      }
      onClick={() => toggle(handle)}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full",
        "bg-background/90 shadow-card backdrop-blur-sm",
        "transition-[color,transform] duration-150 ease-premium hover:scale-105 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        saved ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <Heart
        className="size-4"
        strokeWidth={1.75}
        fill={saved ? "currentColor" : "none"}
      />
    </button>
  );
}
