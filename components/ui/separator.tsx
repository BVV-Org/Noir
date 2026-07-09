import { cn } from "@/lib/utils";

/**
 * Separator — a hairline. Presentational by default, so it is hidden from the
 * accessibility tree unless it genuinely divides two groups of content.
 */
export function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  );
}
