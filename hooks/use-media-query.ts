"use client";

import * as React from "react";

/**
 * Subscribe to a CSS media query.
 *
 * Backed by `useSyncExternalStore` so the value is tear-free during concurrent
 * renders and SSR-safe: the server snapshot is always `false`, letting the
 * mobile-first markup render first and enhance upward (design-principles.md).
 *
 * Prefer a Tailwind breakpoint over this hook whenever the change is purely
 * visual — this exists for cases where behaviour, not styling, must branch.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query]
  );

  const getSnapshot = React.useCallback(
    () => window.matchMedia(query).matches,
    [query]
  );

  // Mobile-first: assume the query is unmatched until the client says otherwise.
  const getServerSnapshot = React.useCallback(() => false, []);

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
