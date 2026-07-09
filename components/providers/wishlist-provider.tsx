"use client";

import * as React from "react";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * WishlistProvider — client-only wishlist, persisted to localStorage (TDD §9).
 *
 * Only product *handles* are stored. Persisting whole products would freeze
 * prices and stock at the moment of saving; the wishlist page rehydrates each
 * handle through the data provider, so what the visitor sees is always current.
 *
 * Extension point (V2): swap the two storage calls for a customer-metafield
 * read/write. Nothing outside this file knows where the handles live.
 */
interface WishlistContextValue {
  handles: string[];
  /** False until localStorage has been read — see the hydration note below. */
  hydrated: boolean;
  has: (handle: string) => boolean;
  toggle: (handle: string) => void;
  remove: (handle: string) => void;
  clear: () => void;
}

const WishlistContext = React.createContext<WishlistContextValue | null>(null);

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.wishlist);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((h): h is string => typeof h === "string")
      : [];
  } catch {
    // Private-mode Safari throws on access; a broken wishlist must not take the
    // page down with it.
    return [];
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  // Starts empty on both server and client, then fills after mount. Reading
  // localStorage during render would produce markup the server cannot match.
  const [handles, setHandles] = React.useState<string[]>([]);
  const [hydrated, setHydrated] = React.useState(false);
  // One polite live region for the whole app (DESIGN_SYSTEM.md §6). Announcing
  // from each card would queue a dozen regions and read them unpredictably.
  const [announcement, setAnnouncement] = React.useState("");

  React.useEffect(() => {
    setHandles(read());
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.wishlist,
        JSON.stringify(handles)
      );
    } catch {
      // Quota or private mode. The in-memory wishlist still works this session.
    }
  }, [handles, hydrated]);

  const value = React.useMemo<WishlistContextValue>(
    () => ({
      handles,
      hydrated,
      has: (handle) => handles.includes(handle),
      toggle: (handle) =>
        setHandles((current) => {
          const saved = current.includes(handle);
          setAnnouncement(
            saved ? "Removed from wishlist" : "Saved to wishlist"
          );
          return saved
            ? current.filter((h) => h !== handle)
            : [...current, handle];
        }),
      remove: (handle) =>
        setHandles((current) => {
          setAnnouncement("Removed from wishlist");
          return current.filter((h) => h !== handle);
        }),
      clear: () => {
        setAnnouncement("Wishlist cleared");
        setHandles([]);
      },
    }),
    [handles, hydrated]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const context = React.useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a <WishlistProvider>.");
  }
  return context;
}
