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
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex flex-col rounded-xl border border-border bg-card p-2 shadow-card"
        >
          <Skeleton className="aspect-[4/5] rounded-[16px]" />
          <div className="flex items-start justify-between gap-3 px-2 pb-1.5 pt-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
