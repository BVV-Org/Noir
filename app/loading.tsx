import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * The root loading UI.
 *
 * Streamed the instant a navigation begins, for any route that does not supply
 * its own `loading.tsx`. It deliberately mirrors the *page header* shape shared
 * by nearly every route — eyebrow, title, lead paragraph — rather than trying to
 * guess at the body, because a skeleton that predicts the wrong layout shifts
 * more than no skeleton at all.
 *
 * `role="status"` plus `aria-busy` is the accessible signal; the individual
 * rectangles are hidden from assistive tech by `Skeleton` itself. Without this,
 * a screen-reader user hears silence between pressing a link and the page
 * arriving.
 *
 * The navbar and footer are not skeletonised — they live in the root layout and
 * never unmount across a navigation.
 */
export default function RootLoading() {
  return (
    <Container className="py-12 sm:py-16">
      <div role="status" aria-busy="true" aria-label="Loading page">
        <div className="max-w-2xl">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-12 w-64" />
          <Skeleton className="mt-4 h-6 w-full max-w-md" />
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-border bg-card"
            >
              <Skeleton className="aspect-[4/3] rounded-none" />
              <div className="flex flex-col gap-3 p-6">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
