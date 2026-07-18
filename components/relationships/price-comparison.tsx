import type { PriceComparisonVM } from "@/types/relationships";
import { cn } from "@/lib/utils";

/**
 * PriceComparison — original price, relationship price, and the saving.
 *
 * The engine carries no price, so this is composed from the two fragrance
 * records the edge points at. When either side has no price the KB simply
 * doesn't know, and the block omits itself rather than inventing a zero.
 */
export function PriceComparison({
  price,
  className,
}: {
  price: PriceComparisonVM;
  className?: string;
}) {
  if (!price.hasComparison) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-secondary/30 p-4",
        className
      )}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground">
            {price.originalLabel}
          </p>
          <p className="text-sm text-muted-foreground line-through decoration-foreground/30">
            {price.originalDisplay}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-foreground">
            This fragrance
          </p>
          <p className="font-display text-h4 leading-none">
            {price.relationshipDisplay}
          </p>
        </div>
      </div>
      {price.savingsDisplay && price.savingsPct != null && price.savingsPct > 0 && (
        <p className="mt-2 border-t border-foreground/15 pt-2 text-right font-mono text-caption uppercase tracking-[0.06em] text-foreground">
          Save {price.savingsDisplay} · {price.savingsPct}% less
        </p>
      )}
    </div>
  );
}
