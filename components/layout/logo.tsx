import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config/site";

/**
 * Logo — the Noir Vault wordmark.
 *
 * Type-only, in the telemetry layer: bold mono caps with a registered-mark
 * glyph doing structural duty, the way industrial print uses ® as a
 * geometric element. Shared by the navbar and footer so the two can never
 * drift.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name}, home`}
      className={cn(
        "inline-flex items-baseline gap-0.5 rounded-sm font-mono text-small font-bold uppercase tracking-[0.08em] text-foreground",
        "transition-opacity duration-150 ease-premium hover:opacity-70",
        className
      )}
    >
      Noir Vault
      <span aria-hidden className="text-[0.65em] leading-none">
        ®
      </span>
    </Link>
  );
}
