import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DnaBadgeVM, RelationshipPresentationVM } from "@/types/relationships";

/**
 * RelationshipBadge / DNABadge — the telemetry chips that name a relationship.
 *
 * Both take their label from the registry, never from a switch on the type, so
 * any relationship the engine emits gets a chip. `VERIFIED_CLONE` is the only
 * one that earns the check mark, and that comes from the engine's own
 * `verified` flag rather than the label.
 */
const chip =
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.08em]";

export function RelationshipBadge({
  presentation,
  verified = false,
  className,
}: {
  presentation: RelationshipPresentationVM;
  verified?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        chip,
        verified
          ? "border-foreground/40 text-foreground"
          : "border-border text-muted-foreground",
        className
      )}
      title={presentation.blurb}
    >
      {verified && <BadgeCheck className="size-3" aria-hidden />}
      {presentation.badgeLabel}
    </span>
  );
}

export function DNABadge({
  dna,
  className,
}: {
  dna: DnaBadgeVM;
  className?: string;
}) {
  return (
    <span
      className={cn(chip, "border-foreground/30 text-foreground", className)}
      title={dna.blurb}
    >
      {dna.label}
    </span>
  );
}
