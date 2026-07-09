import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config/site";

/**
 * Logo — the Noir Vault wordmark.
 *
 * Type-only, in the display face: the brand is "minimal, no clutter"
 * (brand-guidelines.md), so the lockup earns its presence through spacing and
 * weight contrast rather than a mark. Shared by the navbar and footer so the
 * two can never drift.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — home`}
      className={cn(
        "group inline-flex items-baseline gap-1.5 rounded-sm font-display text-h6 uppercase tracking-[0.2em] text-foreground",
        "transition-opacity duration-150 ease-premium hover:opacity-80",
        className
      )}
    >
      <span className="font-semibold">Noir</span>
      <span className="font-normal text-muted-foreground transition-colors duration-150 ease-premium group-hover:text-primary">
        Vault
      </span>
    </Link>
  );
}
