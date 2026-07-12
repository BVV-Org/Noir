"use client";

import * as React from "react";

/** The two Noir Vault themes: paper (light, default) and the noir inverse. */
export type Theme = "light" | "dark";

const STORAGE_KEY = "nv-theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

/**
 * ThemeProvider — owns the active theme for the tree.
 *
 * The initial value is read from the class the pre-paint script already set,
 * so provider state and DOM never disagree. `setTheme` writes the class and
 * persists to localStorage; consumers read and switch through `useTheme()`.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light");

  // Sync initial state with what the pre-paint script applied.
  React.useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setThemeState("dark");
    }
  }, []);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode: the choice simply won't persist.
    }
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
    }),
    [theme, setTheme]
  );

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
