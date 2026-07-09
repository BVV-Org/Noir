"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useCart } from "@/hooks/use-cart";

/**
 * Defers the cart drawer's code until the shopper first opens their bag.
 *
 * The drawer sits in the root layout, so without this it would be part of the
 * shared bundle on every route — the journal, the about page, a 404 — for a
 * component the majority of sessions never open. It is not a huge chunk, but it
 * is a chunk parsed on the critical path of every single page for no benefit.
 *
 * `ssr: false` because there is nothing to server-render: the drawer is closed
 * on first paint by definition, and the cart itself is fetched client-side from
 * `/api/cart` (the cart id is in an httpOnly cookie).
 *
 * Once opened it stays mounted. Unmounting on close would refetch the chunk on
 * every subsequent open and throw away the Sheet's exit animation.
 */
const CartDrawer = dynamic(
  () => import("./cart-drawer").then((mod) => mod.CartDrawer),
  { ssr: false }
);

export function CartDrawerMount() {
  const { isOpen } = useCart();
  const [everOpened, setEverOpened] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) setEverOpened(true);
  }, [isOpen]);

  if (!everOpened) return null;
  return <CartDrawer />;
}
