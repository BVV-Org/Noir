import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Rarity } from "@/lib/config/site";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-caption font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        emerald:
          "border-transparent bg-primary/15 text-primary ring-1 ring-inset ring-primary/25",
        gold: "border-transparent bg-gold/15 text-gold ring-1 ring-inset ring-gold/25",
        purple:
          "border-transparent bg-accent/15 text-accent ring-1 ring-inset ring-accent/30",
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
 */
const rarityClasses: Record<Rarity, string> = {
  common: "bg-rarity-common/12 text-rarity-common ring-rarity-common/25",
  rare: "bg-rarity-rare/12 text-rarity-rare ring-rarity-rare/30",
  epic: "bg-rarity-epic/15 text-rarity-epic ring-rarity-epic/35",
  legendary:
    "bg-rarity-legendary/15 text-rarity-legendary ring-rarity-legendary/35",
  mythic: "bg-rarity-mythic/15 text-rarity-mythic ring-rarity-mythic/40",
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-overline uppercase ring-1 ring-inset",
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
