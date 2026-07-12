"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

/**
 * ThemeToggle — a small icon control in the telemetry layer: a moon in light
 * mode (tap to go dark), a sun in dark mode (tap to go back).
 *
 * Which glyph shows is driven by the `dark` class on <html> via `dark:`
 * variants, not React state. The pre-paint script sets that class before first
 * paint, so the correct icon is right immediately with no hydration flip —
 * `theme` only feeds `aria-pressed`.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className={className}
      aria-pressed={theme === "dark"}
      aria-label="Toggle dark mode"
    >
      <Moon className="size-5 dark:hidden" strokeWidth={1.5} aria-hidden />
      <Sun
        className="hidden size-5 dark:block"
        strokeWidth={1.5}
        aria-hidden
      />
      <span className="sr-only">Toggle dark mode</span>
    </button>
  );
}
