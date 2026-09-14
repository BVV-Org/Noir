import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Card — the raised container: white paper, 24px radius, a hairline border
 * AND a whisper of elevation. The border defines the edge; the shadow only
 * says "this sits above the page". Neither is allowed to do the other's job.
 *
 * `interactive` lifts the card a couple of pixels and deepens the shadow on
 * hover. Transform rather than margin, so the lift never triggers layout.
 */
const cardVariants = cva(
  "rounded-xl border border-border bg-card text-card-foreground shadow-card",
  {
    variants: {
      interactive: {
        true: "group/card transition-[transform,box-shadow] duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-lift focus-within:shadow-lift",
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
    <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-h5 font-semibold", className)} {...props} />;
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
