"use client";

import * as React from "react";

/**
 * The themes Noir Vault knows about. V1 ships one: the brand is a dark vault
 * (brand-guidelines.md, DESIGN_SYSTEM.md §1), so there is no toggle to build.
 */
export type Theme = "dark";

interface ThemeContextValue {
  theme: Theme;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

/**
 * ThemeProvider — resolves the active theme for the tree.
 *
 * The `dark` class is written directly onto `<html>` in the root layout rather
 * than applied here on mount, so the correct palette is present in the very
 * first byte of HTML: no flash of unstyled theme, and no blocking inline script.
 * This provider exists to give client components a stable way to *read* the
 * theme — chiefly third parties that need to match it (checkout embeds,
 * analytics session replay).
 *
 * Extension point (do not implement in V1): to support a light theme, widen
 * `Theme`, persist the choice, and set the class from a small script in
 * `<head>` before paint. Every consumer already reads through `useTheme()`, so
 * nothing downstream changes.
 */
export function ThemeProvider({
  children,
  theme = "dark",
}: {
  children: React.ReactNode;
  theme?: Theme;
}) {
  const value = React.useMemo<ThemeContextValue>(() => ({ theme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** Read the active theme. Throws outside a ThemeProvider so misuse is loud. */
export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a <ThemeProvider>.");
  }
  return context;
}
