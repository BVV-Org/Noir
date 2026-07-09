import * as React from "react";
import { MotionProvider } from "@/components/motion/motion-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { WishlistProvider } from "@/components/providers/wishlist-provider";

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
 * today, so the list stays alphabetical-by-concern: theme first (visual), then
 * motion (behavioural).
 *
 * Extension points (documented, not implemented — technical-rules.md):
 *   CartProvider     — wraps the Storefront Cart API (TDD §9)
 *   AnalyticsProvider— PostHog + GA, loaded `afterInteractive` (TDD §13)
 * Each slots in here without touching the root layout.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WishlistProvider>
        <MotionProvider>{children}</MotionProvider>
      </WishlistProvider>
    </ThemeProvider>
  );
}
