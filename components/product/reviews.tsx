import { MessageSquare } from "lucide-react";
import type { Product } from "@/types";
import { EmptyState } from "@/components/commerce/empty-state";

/**
 * Reviews — a placeholder, and deliberately so (TDD §20.2).
 *
 * No review provider has been chosen (Judge.me, Shopify Product Reviews, and
 * Okendo are all candidates), so there are no reviews to render. This section
 * exists to hold the slot and to be honest about its emptiness: it shows no
 * star rating, no "0.0 out of 5", and no review count. A zeroed rating is a
 * claim about the product, and it is a false one.
 *
 * ## Why it renders at all
 *
 * Structured data. When a provider lands, `AggregateRating` attaches to the
 * `Product` JSON-LD emitted for this page, and the markup below is replaced by
 * the provider's list. Keeping the section and its heading in the document now
 * means the page's heading outline does not change when reviews arrive.
 *
 * To implement: fetch ratings in the page's Server Component, pass them here as
 * props, and emit `AggregateRating` from `components/seo`. Nothing about the
 * surrounding layout has to move.
 */
export function Reviews({ product }: { product: Product }) {
  return (
    <section aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-h4 font-semibold tracking-tight">
        Reviews
      </h2>

      <div className="mt-8">
        <EmptyState
          icon={MessageSquare}
          title="No reviews yet"
          description={`Nobody has written about ${product.title} here. Reviews open when our review platform goes live.`}
        />
      </div>
    </section>
  );
}
