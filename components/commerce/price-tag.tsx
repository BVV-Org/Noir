import type { Money } from "@/types";
import { cn, formatMoney } from "@/lib/utils";

/**
 * PriceTag — money, and the price it used to be.
 *
 * Prices live in the telemetry layer: mono, tabular. When `compareAtPrice`
 * is higher, the old price is struck through; the strike itself is the sale
 * signal, no accent color needed. The struck price is wrapped in `<s>` so
 * assistive tech announces it as no longer applicable, and the pairing is
 * given a single accessible label — otherwise a screen reader reads two bare
 * numbers with no indication of which one you pay.
 */
export function PriceTag({
  price,
  compareAtPrice,
  className,
  size = "default",
}: {
  price: Money;
  compareAtPrice?: Money | null;
  className?: string;
  size?: "default" | "lg";
}) {
  const current = formatMoney(price.amount, price.currencyCode);
  const wasDiscounted =
    compareAtPrice &&
    Number.parseFloat(compareAtPrice.amount) > Number.parseFloat(price.amount);
  const previous = wasDiscounted
    ? formatMoney(compareAtPrice.amount, compareAtPrice.currencyCode)
    : null;

  return (
    <p
      className={cn("flex items-baseline gap-2", className)}
      aria-label={previous ? `${current}, reduced from ${previous}` : undefined}
    >
      <span
        aria-hidden={Boolean(previous)}
        className={cn(
          "font-mono tabular-nums text-foreground",
          size === "lg" ? "text-h4 font-bold" : "text-small font-bold"
        )}
      >
        {current}
      </span>
      {previous && (
        <s
          aria-hidden
          className={cn(
            "tabular-nums text-muted-foreground",
            size === "lg" ? "text-lg" : "text-small"
          )}
        >
          {previous}
        </s>
      )}
    </p>
  );
}
