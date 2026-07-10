import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Card — the raised surface (DESIGN_SYSTEM.md §4).
 *
 * `interactive` adds the hover lift used by every card in the catalogue: a
 * gentle scale (≤1.02 per the animation guidelines), a shadow, and a border
 * that warms toward the foreground. Transform is used rather than `top`/margin
 * so the lift never triggers layout, and the global reduced-motion rule zeroes
 * the transition duration for anyone who asks.
 */
const cardVariants = cva(
  "rounded-lg border border-border bg-card text-card-foreground",
  {
    variants: {
      interactive: {
        true: "group/card transition-[transform,box-shadow,border-color] duration-150 ease-premium hover:-translate-y-0.5 hover:border-border/80 hover:shadow-lift focus-within:border-border/80",
        false: "",
      },
    },
    defaultVariants: { interactive: false },
  }
);

export interface CardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: React.ElementType;
}

export function Card({
  as: Comp = "div",
  interactive,
  className,
  ...props
}: CardProps) {
  return (
    <Comp className={cn(cardVariants({ interactive }), className)} {...props} />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-h5 font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-small text-muted-foreground", className)}
      {...props}
    />
  );
}
