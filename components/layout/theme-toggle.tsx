"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useTheme } from "@/components/providers/theme-provider";

/**
 * ThemeToggle — a small icon control in the telemetry layer: a moon in light
 * mode (tap to go dark), a sun in dark mode (tap to go back).
 *
 * The switch itself is `AnimatedThemeToggler`, which wipes the new theme in
 * from the button with the View Transitions API instead of cutting to it.
 *
 * It is driven in CONTROLLED mode on purpose. Left uncontrolled it persists to
 * `localStorage["theme"]`, but this app's key is `nv-theme` and the pre-paint
 * script in `app/layout.tsx` reads that — so an uncontrolled toggler would
 * appear to work and then lose the choice on reload. Passing `theme` +
 * `onThemeChange` keeps ThemeProvider the single owner of persistence.
 *
 * Which glyph shows is still driven by the `dark` class on <html> via `dark:`
 * variants, not React state, so the correct icon is right on the first paint
 * with no hydration flip; `theme` only feeds `aria-pressed`.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const reduce = useReducedMotion();

  return (
    <AnimatedThemeToggler
      theme={theme}
      onThemeChange={setTheme}
      // The reveal is motion: reduced-motion users get the swap with no wipe.
      duration={reduce ? 0 : 500}
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
    </AnimatedThemeToggler>
  );
}
