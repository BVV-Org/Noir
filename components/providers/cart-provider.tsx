"use client";

import * as React from "react";
import type { Cart } from "@/types";

/**
 * CartProvider — the browser's view of the Shopify cart.
 *
 * The client never holds a cart id. It calls `/api/cart`, which resolves the id
 * from an httpOnly cookie and returns the whole cart; state here is a mirror of
 * that response, never a local reconstruction. This is why every mutation
 * `setCart(response.cart)` rather than splicing lines: Shopify is the source of
 * truth for what a cart contains and what it costs.
 *
 * Optimistic updates are deliberately absent. A cart line can fail for reasons
 * the browser cannot predict — the variant sold out between render and click —
 * and showing an item that checkout will reject is worse than a 200ms wait.
 * `pending` drives disabled states instead.
 */
interface CartContextValue {
  cart: Cart | null;
  /** False until the first `/api/cart` GET resolves. */
  hydrated: boolean;
  /** True while any mutation is in flight. */
  pending: boolean;
  error: string | null;
  totalQuantity: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (merchandiseId: string, quantity?: number) => Promise<boolean>;
  /** Add the item, then redirect straight to Shopify's hosted checkout. */
  buyNow: (merchandiseId: string, quantity?: number) => Promise<boolean>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
}

const CartContext = React.createContext<CartContextValue | null>(null);

interface CartResponse {
  ok: boolean;
  cart?: Cart | null;
  error?: string;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [hydrated, setHydrated] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isOpen, setOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    fetch("/api/cart")
      .then((response) => response.json() as Promise<CartResponse>)
      .then((data) => {
        if (cancelled) return;
        if (data.ok) setCart(data.cart ?? null);
      })
      .catch(() => {
        // A failed initial read means "no cart yet", not a broken page. The
        // first add will create one.
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /** Every mutation shares one request path, so error handling is written once. */
  const mutate = React.useCallback(
    async (payload: Record<string, unknown>): Promise<Cart | null | false> => {
      setPending(true);
      setError(null);

      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await response.json()) as CartResponse;

        if (!data.ok) {
          setError(data.error ?? "Could not update the cart.");
          return false;
        }

        const next = data.cart ?? null;
        setCart(next);
        return next;
      } catch {
        setError("Could not reach the server. Check your connection.");
        return false;
      } finally {
        setPending(false);
      }
    },
    []
  );

  const value = React.useMemo<CartContextValue>(
    () => ({
      cart,
      hydrated,
      pending,
      error,
      totalQuantity: cart?.totalQuantity ?? 0,
      isOpen,
      setOpen,
      addItem: async (merchandiseId, quantity = 1) => {
        const result = await mutate({
          action: "add",
          lines: [{ merchandiseId, quantity }],
        });
        const ok = result !== false;
        // Only reveal the drawer on success — opening it onto an unchanged cart
        // reads as a bug.
        if (ok) setOpen(true);
        return ok;
      },
      buyNow: async (merchandiseId, quantity = 1) => {
        const result = await mutate({
          action: "add",
          lines: [{ merchandiseId, quantity }],
        });
        if (result === false) return false;
        // Live Shopify returns a hosted checkout URL — hand off directly.
        if (result?.checkoutUrl) {
          window.location.href = result.checkoutUrl;
          return true;
        }
        // No checkout URL (mock/unconfigured env) — fall back to the drawer so
        // the click is never a dead end.
        setOpen(true);
        return true;
      },
      updateItem: async (lineId, quantity) => {
        await mutate({ action: "update", lines: [{ id: lineId, quantity }] });
      },
      removeItem: async (lineId) => {
        await mutate({ action: "remove", lineIds: [lineId] });
      },
    }),
    [cart, hydrated, pending, error, isOpen, mutate]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <p aria-live="polite" className="sr-only">
        {error ?? ""}
      </p>
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a <CartProvider>.");
  }
  return context;
}
