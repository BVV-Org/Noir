"use client";

import * as React from "react";
import { useTheme } from "@/components/providers/theme-provider";

/**
 * ThemeToggle — the "DARK MODE" control, plain text in the telemetry layer
 * like every other nav item. The label names the theme you would switch TO,
 * which is what the reference language does and what users expect from a
 * labelled toggle.
 *
 * Rendered text is identical on server and first client paint ("Dark mode"):
 * the provider's state only flips after mount, so there is no hydration
 * mismatch even when the persisted theme is dark.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className={className}
      aria-pressed={theme === "dark"}
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
