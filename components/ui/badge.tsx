import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Rarity } from "@/lib/config/site";

/**
 * Badge — a capsule tag at 12px/500. Three tones of the same shape: solid ink
 * for the one flag that matters most on a surface, soft gray for categories,
 * and an outline for purely informational labels.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-caption font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        solid: "border-transparent bg-primary text-primary-foreground",
        outline: "border-border bg-background/80 text-foreground",
        // Kept as an alias so existing call sites keep compiling: the scarcity
        // flag is now the solid ink capsule rather than a brand hue.
        accent: "border-transparent bg-primary text-primary-foreground",
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
 * RarityBadge — the signature progression cue.
 *
 * A neutral capsule carrying a single 6px tier dot. The hue is the tier data,
 * so it survives the achromatic system — but only at dot size. A full-color
 * pill per tier turned every product grid into a row of competing stickers.
 */
const rarityDot: Record<Rarity, string> = {
  common: "bg-rarity-common",
  rare: "bg-rarity-rare",
  epic: "bg-rarity-epic",
  legendary: "bg-rarity-legendary",
  mythic: "bg-rarity-mythic",
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
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background/90 px-2 py-0.5 text-caption font-medium text-foreground backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", rarityDot[rarity])} />
      {label}
    </span>
  );
}

export { Badge, RarityBadge, badgeVariants };
