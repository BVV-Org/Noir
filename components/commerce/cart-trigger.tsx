"use client";

import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

/**
 * CartTrigger — the navbar's bag button.
 *
 * The count badge renders only once the cart has hydrated. Server HTML has no
 * cart (the id is in an httpOnly cookie read by `/api/cart`), so painting a
 * count before the first fetch resolves would guarantee a hydration mismatch.
 */
export function CartTrigger({ className }: { className?: string }) {
  const { totalQuantity, hydrated, setOpen } = useCart();
  const count = hydrated ? totalQuantity : 0;

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={count > 0 ? `Open bag, ${count} items` : "Open bag, empty"}
      className={cn(
        "relative inline-flex size-11 items-center justify-center rounded-md text-muted-foreground",
        "transition-colors duration-150 ease-premium hover:bg-secondary/60 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <ShoppingBag className="size-5" />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute right-1 top-1 inline-flex min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-medium leading-[1.125rem] text-primary-foreground"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
