"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { EmptyState } from "@/components/commerce/empty-state";

/**
 * CartDrawer — the cart, in the Sheet primitive the mobile menu already uses.
 *
 * Mounted once in the root layout and opened from context, so every "add to
 * bag" anywhere in the app reveals the same drawer. Quantity controls and the
 * remove button are disabled while a mutation is in flight: the server owns the
 * quantity, and letting someone click "+" four times before the first response
 * lands produces four racing requests and a cart nobody predicted.
 *
 * Checkout is a real redirect to Shopify's hosted checkout (`cart.checkoutUrl`),
 * which is where payment must happen. On the mock provider that URL is empty —
 * there is no checkout to reach — so the button says so rather than 404ing.
 */
export function CartDrawer() {
  const { cart, isOpen, setOpen, pending, error, updateItem, removeItem } =
    useCart();

  const lines = cart?.lines ?? [];
  const canCheckout = Boolean(cart?.checkoutUrl) && lines.length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-[min(92vw,28rem)] gap-0">
        <SheetTitle className="font-display uppercase tracking-[0.2em]">
          Your bag
        </SheetTitle>
        <SheetDescription className="sr-only">
          Review the fragrances in your bag before checking out.
        </SheetDescription>

        {lines.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={ShoppingBag}
              title="Your bag is empty"
              description="Nothing collected yet. The vault is open."
              action={
                <SheetClose asChild>
                  <Button asChild>
                    <Link href="/shop">Browse fragrances</Link>
                  </Button>
                </SheetClose>
              }
            />
          </div>
        ) : (
          <>
            <ul className="-mr-2 mt-8 flex flex-1 flex-col gap-6 overflow-y-auto pr-2">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-4">
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                    {line.image && (
                      <Image
                        src={line.image.url}
                        alt={line.image.altText}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-small font-medium text-foreground">
                          <SheetClose asChild>
                            <Link
                              href={`/products/${line.productHandle}`}
                              className="hover:text-primary"
                            >
                              {line.productTitle}
                            </Link>
                          </SheetClose>
                        </p>
                        <p className="mt-1 text-caption text-muted-foreground">
                          {line.variantTitle}
                        </p>
                      </div>
                      <p className="shrink-0 text-small tabular-nums text-foreground">
                        {formatMoney(
                          line.lineTotal.amount,
                          line.lineTotal.currencyCode
                        )}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <div className="flex items-center rounded-md border border-border">
                        <QuantityButton
                          label={`Decrease quantity of ${line.productTitle}`}
                          disabled={pending}
                          onClick={() => updateItem(line.id, line.quantity - 1)}
                        >
                          <Minus className="size-3.5" />
                        </QuantityButton>

                        <span
                          aria-live="polite"
                          className="w-9 text-center text-small tabular-nums text-foreground"
                        >
                          {line.quantity}
                        </span>

                        <QuantityButton
                          label={`Increase quantity of ${line.productTitle}`}
                          disabled={pending || line.quantity >= 99}
                          onClick={() => updateItem(line.id, line.quantity + 1)}
                        >
                          <Plus className="size-3.5" />
                        </QuantityButton>
                      </div>

                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => removeItem(line.id)}
                        className={cn(
                          "inline-flex size-11 items-center justify-center rounded-md text-muted-foreground",
                          "transition-colors duration-150 ease-premium hover:bg-secondary/60 hover:text-destructive",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          "disabled:pointer-events-none disabled:opacity-50"
                        )}
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">
                          Remove {line.productTitle} from bag
                        </span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-4">
              <Separator />

              <div className="flex items-baseline justify-between">
                <span className="text-small text-muted-foreground">
                  Subtotal
                </span>
                <span className="font-display text-h5 font-medium tabular-nums text-foreground">
                  {cart &&
                    formatMoney(
                      cart.cost.subtotal.amount,
                      cart.cost.subtotal.currencyCode
                    )}
                </span>
              </div>

              <p className="text-caption text-muted-foreground">
                Taxes and shipping are calculated at checkout.
              </p>

              {error && (
                <p role="alert" className="text-caption text-destructive">
                  {error}
                </p>
              )}

              {canCheckout ? (
                <Button asChild size="lg" disabled={pending}>
                  {/*
                    A plain anchor, not next/link: Shopify's checkout is a
                    different origin and must be a full document navigation.
                  */}
                  <a href={cart!.checkoutUrl}>Checkout</a>
                </Button>
              ) : (
                <>
                  <Button size="lg" disabled>
                    Checkout
                  </Button>
                  <p className="text-caption text-muted-foreground">
                    Checkout needs Shopify credentials. This environment runs on
                    the mock provider, which has no hosted checkout.
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function QuantityButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-md text-muted-foreground",
        "transition-colors duration-150 ease-premium hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-40"
      )}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}
