import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import type { Cart } from "@/types";
import { getProvider } from "@/lib/data";
import { CART_COOKIE, CART_COOKIE_MAX_AGE } from "@/lib/constants";
import { CommerceError } from "@/lib/data/errors";

/**
 * The cart proxy (TDD §10).
 *
 * Every cart mutation goes through this route rather than straight to Shopify:
 * the Storefront token stays server-side, and the cart id lives in an httpOnly
 * cookie the browser cannot read. The client sends *intent* ("add this variant")
 * and receives the resulting cart; it never names a cart id.
 *
 * The response is always the whole cart, matching what the Storefront mutations
 * return, so the client replaces state rather than merging into it.
 */
export const dynamic = "force-dynamic";

const lineInput = z.object({
  merchandiseId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

const lineUpdate = z.object({
  id: z.string().min(1),
  // Zero is legal: it is how the Storefront API removes a line.
  quantity: z.number().int().min(0).max(99),
});

const body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("add"), lines: z.array(lineInput).min(1) }),
  z.object({ action: z.literal("update"), lines: z.array(lineUpdate).min(1) }),
  z.object({
    action: z.literal("remove"),
    lineIds: z.array(z.string()).min(1),
  }),
]);

/** Persist the cart id. `sameSite: lax` survives the return trip from checkout. */
function withCartCookie(cart: Cart) {
  const response = NextResponse.json({ ok: true, cart });
  response.cookies.set(CART_COOKIE, cart.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
  return response;
}

/**
 * A `CommerceError` is something the shopper can act on — sold out, quantity
 * unavailable — and both providers raise it, so its message is safe to show and
 * maps to 409. Anything else is infrastructure: log it, and tell the browser
 * nothing about the upstream, whose messages can carry store identifiers.
 */
function failure(error: unknown) {
  if (error instanceof CommerceError) {
    console.error("Cart operation rejected", error.message, error.details);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 409 }
    );
  }
  console.error("Cart operation threw", error);
  return NextResponse.json(
    { ok: false, error: "Could not update the cart. Try again." },
    { status: 502 }
  );
}

/** Read the current cart. Returns `cart: null` when there is nothing yet. */
export async function GET() {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return NextResponse.json({ ok: true, cart: null });

  try {
    const cart = await getProvider().getCart(cartId);
    // An expired or completed cart id yields null. Report no cart rather than an
    // error — the next `add` will mint a fresh one.
    return NextResponse.json({ ok: true, cart });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Expected a JSON body." },
      { status: 400 }
    );
  }

  const parsed = body.safeParse(payload);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    return NextResponse.json(
      { ok: false, error: issue?.message ?? "Invalid cart request." },
      { status: 400 }
    );
  }

  const provider = getProvider();
  const store = await cookies();
  let cartId = store.get(CART_COOKIE)?.value;

  try {
    // Adding to a cart that has expired must not fail; mint a new one. Updating
    // or removing from a cart that no longer exists genuinely has no meaning.
    if (cartId) {
      const existing = await provider.getCart(cartId);
      if (!existing) cartId = undefined;
    }

    if (!cartId) {
      if (parsed.data.action !== "add") {
        return NextResponse.json({ ok: true, cart: null });
      }
      cartId = (await provider.createCart()).id;
    }

    switch (parsed.data.action) {
      case "add":
        return withCartCookie(
          await provider.addToCart(cartId, parsed.data.lines)
        );
      case "update":
        return withCartCookie(
          await provider.updateCart(cartId, parsed.data.lines)
        );
      case "remove":
        return withCartCookie(
          await provider.removeFromCart(cartId, parsed.data.lineIds)
        );
    }
  } catch (error) {
    return failure(error);
  }
}
