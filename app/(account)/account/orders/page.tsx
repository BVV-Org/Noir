import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { Receipt } from "lucide-react";
import { getCustomer } from "@/lib/auth/customer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/commerce/empty-state";

export const metadata: Metadata = buildMetadata({
  title: "Orders",
  noIndex: true,
});

/**
 * Order history.
 *
 * Orders come from the Customer Account API, which is not wired in V1 (TDD
 * §20). A customer who reaches this page is authenticated but has no order
 * source yet, so the page says that plainly rather than rendering an empty
 * table that implies they have never bought anything.
 */
export default async function OrdersPage() {
  const customer = await getCustomer();
  if (!customer) return null;

  return (
    <EmptyState
      icon={Receipt}
      title="No orders to show"
      description="Order history arrives with the Customer Account API integration."
      action={
        <Button asChild variant="outline">
          <Link href="/shop">Browse fragrances</Link>
        </Button>
      }
    />
  );
}
