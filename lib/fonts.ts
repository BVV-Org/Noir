import { Anton, Geist, Geist_Mono } from "next/font/google";

/**
 * Self-hosted fonts via next/font — no external requests, no layout shift.
 *
 *   Interface / everything → Geist       (exposed as `--font-sans`)
 *   Tabular figures        → Geist Mono  (exposed as `--font-mono`)
 *   Hero headline only     → Anton       (exposed as `--font-display`)
 *
 * One family carries the whole interface. Hierarchy comes from weight (400 /
 * 500 / 600) and tracking — tightened hard at display sizes (-0.05em), opened
 * slightly on small uppercase captions (+0.05em) — not from switching faces.
 * The previous system ran five voices at once (Anton, Archivo, Sometype Mono,
 * Ribes Black, and the OS face for prices), so every zone of a page spoke in a
 * different register and nothing read as the loudest.
 *
 * Anton survives in exactly one place: the homepage "Enter the Vault" poster.
 * A single display moment against an otherwise quiet sans is a luxury pattern;
 * Anton as the default heading face was not.
 *
 * Geist Mono is not a label face here. It exists for figures that must align
 * — performance scores, similarity percentages — where proportional digits
 * would jitter.
 */
export const fontSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const fontDisplay = Anton({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: "400",
});

/** Combined class to apply all font variables on the root element. */
export const fontVariables = `${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable}`;
