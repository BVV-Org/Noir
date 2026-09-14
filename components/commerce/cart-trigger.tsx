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
        "relative inline-flex size-10 items-center justify-center rounded-full text-muted-foreground",
        "transition-colors duration-150 ease-premium hover:bg-secondary hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <ShoppingBag className="size-[18px]" strokeWidth={1.75} />
      {count > 0 && (
        <span
          aria-hidden
          className="tabular absolute right-0.5 top-0.5 inline-flex min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-semibold leading-[1.125rem] text-primary-foreground ring-2 ring-background"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
