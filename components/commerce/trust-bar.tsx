import { Lock, ShieldCheck, Droplet, Truck, RotateCcw, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TRUST_CLAIMS,
  TRUST_CLAIMS_COMPACT,
  type TrustClaim,
  type TrustIcon,
} from "@/lib/config/trust";

/**
 * TrustBar — the authenticity/reassurance strip (see lib/config/trust.ts).
 *
 * Two registers, one component:
 *  - "bar" (default): a full-width hairline-bordered row under the hero. The
 *    claims wrap and stay centred on narrow screens rather than scrolling, so
 *    every promise is visible without interaction.
 *  - "compact": a tighter inline list for the product page, sat beside Add to
 *    Cart at the moment of decision.
 *
 * Deliberately in the "telemetry" voice (DESIGN_SYSTEM §4) — small mono
 * uppercase, thin line icons, a single yellow accent on the mark. That
 * restraint is the point: reassurance that reads as fact, not as a badge
 * sticker, so it reinforces the premium feel instead of cheapening it.
 */
const ICONS: Record<TrustIcon, typeof ShieldCheck> = {
  original: ShieldCheck,
  sealed: Droplet,
  shipping: Truck,
  secure: Lock,
  returns: RotateCcw,
  cod: Wallet,
};

function ClaimItem({
  claim,
  size = "bar",
}: {
  claim: TrustClaim;
  size?: "bar" | "compact";
}) {
  const Icon = ICONS[claim.icon];
  return (
    <li className="flex items-center gap-2">
      <Icon
        className={cn(
          "shrink-0 text-primary",
          size === "compact" ? "size-4" : "size-[1.15rem]"
        )}
        strokeWidth={1.5}
        aria-hidden
      />
      <span
        className={cn(
          "whitespace-nowrap font-mono uppercase tracking-[0.08em] text-muted-foreground",
          size === "compact" ? "text-caption" : "text-overline"
        )}
      >
        {claim.label}
      </span>
    </li>
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
          "flex flex-col gap-2 rounded-lg border border-border/70 bg-secondary/30 p-4",
          className
        )}
      >
        {TRUST_CLAIMS_COMPACT.map((claim) => (
          <ClaimItem key={claim.label} claim={claim} size="compact" />
        ))}
      </ul>
    );
  }

  return (
    <section
      aria-label="Our guarantees"
      className={cn("border-y border-foreground/15", className)}
    >
      <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-5 sm:gap-x-12 sm:py-6">
        {TRUST_CLAIMS.map((claim) => (
          <ClaimItem key={claim.label} claim={claim} />
        ))}
      </ul>
    </section>
  );
}
