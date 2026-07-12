import { Anton, Archivo, Space_Mono } from "next/font/google";

/**
 * Self-hosted fonts via next/font — no external requests, no layout shift.
 *
 *   Display / headings → Anton      (exposed as `--font-display`)
 *   Body / UI          → Archivo    (exposed as `--font-sans`)
 *   Labels / telemetry → Space Mono (exposed as `--font-mono`)
 *
 * The system is Swiss-print brutalism: one monolithic condensed grotesque
 * deployed huge and uppercase for structure, a plain grotesque for reading,
 * and a monospace for the small uppercase metadata layer (nav, eyebrows,
 * prices, tier labels). Anton ships a single 400 weight; hierarchy comes
 * from scale, not weight.
 *
 * The CSS variables are consumed by tailwind.config.ts (`fontFamily.display`,
 * `fontFamily.sans`, `fontFamily.mono`). Wire these onto <html> in
 * app/layout.tsx.
 */
export const fontDisplay = Anton({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: "400",
});

export const fontSans = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const fontMono = Space_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "700"],
});

/** Combined class to apply all font variables on the root element. */
export const fontVariables = `${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`;
