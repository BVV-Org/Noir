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
