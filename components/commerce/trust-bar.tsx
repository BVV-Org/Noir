import { Check } from "lucide-react";
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
 * Set in the interface face at 14px/500, sentence case, on the `surface` tone
 * between two hairlines. The claims carry themselves; a 4px dot separates them.
 *
 * Two registers, one component:
 *  - "bar" (default): the full-width slow ticker under the hero.
 *  - "compact": a still checklist for the product page, where motion next to
 *    Add to Cart would pull against the buy decision.
 */
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
        className={cn("flex flex-wrap gap-x-5 gap-y-2", className)}
      >
        {TRUST_CLAIMS_COMPACT.map((claim: TrustClaim) => (
          <li
            key={claim.label}
            className="flex items-center gap-1.5 text-small text-muted-foreground"
          >
            <Check aria-hidden className="size-3.5 text-foreground" strokeWidth={2.25} />
            {claim.label}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section
      aria-label="Our guarantees"
      className={cn("border-y border-border bg-surface py-4", className)}
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
            <span className="text-small font-medium text-muted-foreground">
              {claim.label}
            </span>
            <span aria-hidden className="size-1 rounded-full bg-border" />
          </span>
        ))}
      </Marquee>
    </section>
  );
}
