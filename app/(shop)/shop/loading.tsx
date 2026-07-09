import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/shop/product-grid-skeleton";

/**
 * Streamed instantly while the shop's first data read resolves. Mirrors the
 * real page's two-column layout so the controls do not jump sideways when the
 * sidebar arrives.
 */
export default function ShopLoading() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="max-w-2xl">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-4 h-12 w-48" />
        <Skeleton className="mt-4 h-6 w-full max-w-md" />
      </div>

      <Skeleton className="mt-10 h-11 w-full" />
      <Skeleton className="mt-6 h-11 w-full max-w-xl" />

      <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-12">
        <div className="hidden flex-col gap-6 lg:flex">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex flex-col gap-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          ))}
        </div>
        <ProductGridSkeleton />
      </div>
    </Container>
  );
}
