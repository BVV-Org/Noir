import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { Receipt } from "lucide-react";
import { getCustomer, getCustomerOrders } from "@/lib/auth/customer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/commerce/empty-state";

export const metadata: Metadata = buildMetadata({
  title: "Orders",
  noIndex: true,
});

/**
 * Order history, from the Customer Account API.
 *
 * A customer who reaches this page is authenticated (the layout guards it), so
 * an empty list means they simply have not ordered yet — say that plainly
 * rather than implying an error.
 */
export default async function OrdersPage() {
  const customer = await getCustomer();
  if (!customer) return null;

  const orders = await getCustomerOrders();

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No orders yet"
        description="When you place an order it will show up here, tied to your account."
        action={
          <Button asChild variant="outline">
            <Link href="/shop">Browse fragrances</Link>
          </Button>
        }
      />
    );
  }

  const dateFormatter = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <ul className="divide-y divide-border">
      {orders.map((order) => {
        const total = new Intl.NumberFormat("en", {
          style: "currency",
          currency: order.currencyCode,
        }).format(Number(order.totalAmount));

        return (
          <li
            key={order.id}
            className="flex items-center justify-between gap-4 py-4"
          >
            <div>
              <p className="text-small font-medium text-foreground">
                {order.name}
              </p>
              <p className="text-caption text-muted-foreground">
                {dateFormatter.format(new Date(order.processedAt))}
              </p>
            </div>
            <p className="text-small tabular-nums text-foreground">{total}</p>
          </li>
        );
      })}
    </ul>
  );
}
