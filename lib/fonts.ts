import { Space_Grotesk, Inter } from "next/font/google";

/**
 * Self-hosted fonts via next/font — no external requests, no layout shift.
 *
 *   Display / headings → Space Grotesk (exposed as `--font-display`)
 *   Body / UI          → Inter        (exposed as `--font-sans`)
 *
 * The CSS variables are consumed by tailwind.config.ts (`fontFamily.display`
 * and `fontFamily.sans`). Wire these onto <html> in app/layout.tsx.
 */
export const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

export const fontSans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

/** Combined class to apply both font variables on the root element. */
export const fontVariables = `${fontDisplay.variable} ${fontSans.variable}`;
