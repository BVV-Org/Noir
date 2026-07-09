import type { Metadata } from "next";
import { getCustomer } from "@/lib/auth/customer";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

/**
 * Account overview. Only reached when `getCustomer()` returns a customer — the
 * layout renders the signed-out shell otherwise, so this body never has to
 * handle a null customer.
 */
export default async function AccountPage() {
  const customer = await getCustomer();
  if (!customer) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>{customer.email}</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Your order history is on the orders page.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
