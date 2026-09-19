import { cn } from "@/lib/utils";
import { Marquee } from "@/components/motion/marquee";
import {
  TRUST_CLAIMS,
  TRUST_CLAIMS_COMPACT,
  type TrustClaim,
} from "@/lib/config/trust";

/**
 * TrustBar — the authenticity/reassurance strip (see lib/config/trust.ts).
 *
 * ## Why it looks like this
 *
 * The first version was the default internet trust bar: four stock line icons
 * (shield, droplet, truck, padlock) beside four uppercase monospace labels,
 * sitting still. Both halves of that are template signals. The icons are
 * interchangeable clip art, and small uppercase monospace on wide tracking is
 * the single most over-used "premium" label treatment there is — the spacing
 * is what makes it read as generated, not the typeface.
 *
 * So this drops both. The claims are set in the house display face (the same
 * one the hero shouts in), uppercase and pulled TIGHT rather than spaced out,
 * and separated by a rotated square — a drawn mark that belongs to the Swiss
 * vocabulary rather than a picked icon. Then it moves: the strip runs as a
 * slow ticker that speeds up with scroll velocity, so the band reads as part
 * of the storefront rather than a static compliance footer.
 *
 * Two registers, one component:
 *  - "bar" (default): the full-width ticker under the hero.
 *  - "compact": a still, stacked list for the product page, where motion next
 *    to Add to Cart would pull against the buy decision.
 */
function Diamond() {
  return (
    <span
      aria-hidden
      className="inline-block size-[5px] rotate-45 bg-foreground/35"
    />
  );
}

export function TrustBar({
  variant = "bar",
  className,
}: {
  variant?: "bar" | "compact";
  className?: string;
}) {
  if (variant === "compact") {
    return (
      <ul
        aria-label="Why buy from us"
        className={cn(
          "flex flex-col gap-2.5 border-l border-border/70 pl-4",
          className
        )}
      >
        {TRUST_CLAIMS_COMPACT.map((claim: TrustClaim) => (
          <li
            key={claim.label}
            className="font-display text-sm uppercase leading-none tracking-[-0.01em] text-muted-foreground"
          >
            {claim.label}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section
      aria-label="Our guarantees"
      className={cn("border-y border-foreground/15 py-4 sm:py-5", className)}
    >
      {/* The ticker is aria-hidden (it duplicates its children for the seamless
          loop, which a screen reader would read twice), so the claims are also
          exposed once, invisibly, as a real list. */}
      <ul className="sr-only">
        {TRUST_CLAIMS.map((claim) => (
          <li key={claim.label}>{claim.label}</li>
        ))}
      </ul>

      <Marquee>
        {TRUST_CLAIMS.map((claim) => (
          <span key={claim.label} className="flex items-center gap-10">
            <span className="font-display text-lg uppercase leading-none tracking-[-0.01em] text-foreground/85 sm:text-xl">
              {claim.label}
            </span>
            <Diamond />
          </span>
        ))}
      </Marquee>
    </section>
  );
}
