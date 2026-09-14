import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Container — frames content to the page max-width (1280px) with responsive
 * gutters (20 · 24 · 32px). Presentational only.
 */
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render as a different element (e.g. "main", "header"). */
  as?: React.ElementType;
}

export function Container({
  as: Comp = "div",
  className,
  ...props
}: ContainerProps) {
  return (
    <Comp
      className={cn("mx-auto w-full max-w-page px-5 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
