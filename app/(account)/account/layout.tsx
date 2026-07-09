import Link from "next/link";
import { Lock } from "lucide-react";
import { getCustomer } from "@/lib/auth/customer";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/commerce/empty-state";

/**
 * The account guard.
 *
 * Every route beneath `/account` renders through here, so there is exactly one
 * place that decides whether a visitor is signed in. Signed out, the shell
 * explains the state instead of redirecting into a login page that does not
 * exist yet.
 *
 * `/wishlist` deliberately sits outside this folder: it is browser-local and
 * needs no account.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await getCustomer();

  if (!customer) {
    return (
      <Container className="py-16 sm:py-24">
        <EmptyState
          icon={Lock}
          title="Sign in to see your account"
          description="Accounts are powered by Shopify's Customer Account API, which is not connected in this environment. Your wishlist works without an account."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/wishlist">Go to wishlist</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/shop">Browse fragrances</Link>
              </Button>
            </div>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="py-12 sm:py-16">
      <header>
        <p className="overline">Account</p>
        <h1 className="mt-4 text-h1 font-semibold tracking-tight text-foreground">
          {customer.firstName ? `Hello, ${customer.firstName}` : "Your account"}
        </h1>
      </header>

      <nav aria-label="Account" className="mt-10 border-b border-border">
        <ul className="flex gap-8">
          {[
            { label: "Overview", href: "/account" },
            { label: "Orders", href: "/account/orders" },
            { label: "Wishlist", href: "/wishlist" },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-flex min-h-11 items-center text-small text-muted-foreground transition-colors duration-150 ease-premium hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-12">{children}</div>
    </Container>
  );
}
