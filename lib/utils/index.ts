import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and resolve Tailwind conflicts.
 * The single class-composition helper used across every component.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a money value for display. Amounts originate from Shopify as strings
 * (e.g. "129.00") paired with an ISO currency code — the shape is preserved so
 * the live/mock providers stay swappable.
 */
export function formatMoney(
  amount: number | string,
  currencyCode = "USD",
  locale = "en-US"
): string {
  const value = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    // Drop cents on whole values for a cleaner, premium price display.
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0);
}

/**
 * Format an ISO timestamp for display.
 *
 * The timezone is pinned to UTC deliberately. Without it the server formats in
 * the container's zone and the client in the visitor's, and a date near
 * midnight renders differently in each — a hydration mismatch that only appears
 * for some readers, at some hours.
 */
export function formatDate(iso: string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** Convert an arbitrary string into a URL-safe slug/handle. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumerics → hyphen
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

/** Split an array into fixed-size chunks (e.g. for grid/row layouts). */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size <= 0) return [items.slice()];
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

/** Truncate text to a length on a word boundary, appending an ellipsis. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(" ", max)).trimEnd()}…`;
}

/** Absolute URL against the configured site origin (for canonicals / OG). */
export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://noirvault.com";
  return new URL(path, base).toString();
}
