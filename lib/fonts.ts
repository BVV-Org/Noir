import { Anton, Archivo, Sometype_Mono } from "next/font/google";

/**
 * Self-hosted fonts via next/font — no external requests, no layout shift.
 *
 *   Display / headings → Anton         (exposed as `--font-display`)
 *   Body / UI          → Archivo       (exposed as `--font-sans`)
 *   Labels / telemetry → Sometype Mono (exposed as `--font-mono`)
 *
 * The telemetry face was Space Mono, which is the single most over-used
 * "designer default" monospace — its quirky R/g/1 read as a stock choice
 * rather than a decision, and it was what made the nav and menu labels feel
 * generated. Sometype Mono is a humanist semi-mono: same technical, uppercase
 * label register, but with even colour and calmer letterforms that hold up at
 * 12px. It is the face lamalama.com uses for exactly this layer.
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

export const fontMono = Sometype_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

/** Combined class to apply all font variables on the root element. */
export const fontVariables = `${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`;
