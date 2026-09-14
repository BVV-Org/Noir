import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config/site";

/**
 * Logo — the Noir Vault wordmark.
 *
 * Type-only: the interface face at 600, pulled tight. A small solid ink mark
 * sits in front of it as the one piece of graphic identity — a closed vault
 * door reduced to a dot. Shared by the navbar and footer so the two can never
 * drift.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name}, home`}
      className={cn(
        "inline-flex items-center gap-2 rounded-full text-[15px] font-semibold tracking-[-0.03em] text-foreground",
        "transition-opacity duration-150 ease-premium hover:opacity-70",
        className
      )}
    >
      <span
        aria-hidden
        className="grid size-5 place-items-center rounded-full bg-foreground"
      >
        <span className="size-1.5 rounded-full bg-background" />
      </span>
      Noir Vault
    </Link>
  );
}
