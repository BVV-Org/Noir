import { cn } from "@/lib/utils";

/**
 * Skeleton — the shape of content that has not arrived.
 *
 * A pulse rather than a sweeping shimmer: on a matte black surface a travelling
 * highlight reads as flashing, which the animation guidelines forbid. Marked
 * `aria-hidden` because the accessible signal belongs on the region's
 * `aria-busy`, not on a dozen decorative rectangles.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-secondary/60", className)}
      {...props}
    />
  );
}
