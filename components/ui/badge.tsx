import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Rarity } from "@/lib/config/site";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-caption uppercase tracking-[0.06em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-foreground/35 text-foreground",
        // The single pop accent — reserved for the one flag that matters
        // most on a card (scarcity). Everything else stays neutral.
        accent: "border-transparent bg-yellow text-yellow-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

/**
 * RarityBadge — the signature progression cue. Colors come from the rarity
 * token scale so a "Legendary" fragrance reads the same in every context.
 * These are the only places emerald/violet/crimson appear: the color IS the
 * tier data, so the dot and hue are semantic, not decoration.
 */
const rarityClasses: Record<Rarity, string> = {
  common: "text-rarity-common ring-rarity-common/40",
  rare: "text-rarity-rare ring-rarity-rare/40",
  epic: "text-rarity-epic ring-rarity-epic/40",
  legendary: "text-rarity-legendary ring-rarity-legendary/40",
  mythic: "text-rarity-mythic ring-rarity-mythic/40",
};

function RarityBadge({
  rarity,
  label,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  rarity: Rarity;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-overline uppercase ring-1 ring-inset",
        rarityClasses[rarity],
        className
      )}
      {...props}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export { Badge, RarityBadge, badgeVariants };
