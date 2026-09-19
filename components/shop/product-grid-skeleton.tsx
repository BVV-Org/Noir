import { Skeleton } from "@/components/ui/skeleton";

/**
 * ProductGridSkeleton — the shape of the grid while the server streams.
 *
 * Mirrors ProductCard's proportions (4:5 image, then two text lines) so the
 * layout does not shift when the real cards land. The region is marked
 * `aria-busy` and given a label, which is the accessible signal; the individual
 * rectangles are hidden from assistive tech by `Skeleton` itself.
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading fragrances"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex flex-col overflow-hidden rounded-lg border border-border bg-card"
        >
          <Skeleton className="aspect-[4/5] rounded-none" />
          <div className="flex flex-col gap-3 p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
