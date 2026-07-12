import * as React from "react";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { ProgressBar } from "@/components/motion/progress-bar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { WishlistProvider } from "@/components/providers/wishlist-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { CartDrawerMount } from "@/components/commerce/cart-drawer-mount";

/**
 * Providers — the single global context boundary, mounted once in the root
 * layout.
 *
 * This component is itself a Server Component: each provider inside is
 * independently `"use client"`, and `children` are passed through as an opaque
 * slot. Server Components rendered as page content therefore stay on the
 * server (TDD §13, "RSC-first") — wrapping the tree in providers does not
 * force it into the client bundle.
 *
 * Order matters only where a provider reads another's context. It does not
 * today, so the list stays ordered by concern: theme (visual), storage
 * (wishlist, cart), then motion (behavioural).
 *
 * The cart drawer is mounted here, inside `CartProvider` and beside `children`,
 * rather than in the layout: it is opened from context by any "add to bag"
 * button on any page, so it must live above every page and below the provider
 * that drives it. `CartDrawerMount` defers its code until first open.
 *
 * Extension point (documented, not implemented — technical-rules.md):
 *   AnalyticsProvider — PostHog + GA, loaded `afterInteractive` (TDD §13)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WishlistProvider>
        <CartProvider>
          <MotionProvider>
            <SmoothScroll />
            <ProgressBar />
            {children}
          </MotionProvider>
          <CartDrawerMount />
        </CartProvider>
      </WishlistProvider>
    </ThemeProvider>
  );
}
