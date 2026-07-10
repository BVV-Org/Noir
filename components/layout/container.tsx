import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Container — frames content to the design system's max content width
 * (1360px) with responsive gutters that match the Tailwind `container`
 * padding scale (20 · 24 · 32 · 40px). Presentational only.
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
      className={cn(
        "mx-auto w-full max-w-[1360px] px-5 sm:px-6 lg:px-8 xl:px-10",
        className
      )}
      {...props}
    />
  );
}
