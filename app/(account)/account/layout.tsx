import Link from "next/link";
import { Lock } from "lucide-react";
import { getCustomer, isCustomerAccountConfigured } from "@/lib/auth/customer";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/commerce/empty-state";

/**
 * The account guard.
 *
 * Every route beneath `/account` renders through here, so there is exactly one
 * place that decides whether a visitor is signed in. Signed out, the shell
 * either offers the real Shopify sign-in (when the Customer Account API is
 * configured) or explains that accounts are not connected.
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
          description={
            isCustomerAccountConfigured
              ? "Sign in with your Noir Vault account to see your orders. Your wishlist works with or without an account."
              : "Accounts are powered by Shopify's Customer Account API, which is not connected in this environment. Your wishlist works without an account."
          }
          action={
            <div className="flex flex-wrap justify-center gap-3">
              {isCustomerAccountConfigured && (
                <Button asChild>
                  {/* A Route Handler, not a page — a full navigation, not client routing. */}
                  <a href="/api/auth/login">Sign in</a>
                </Button>
              )}
              <Button
                asChild
                variant={isCustomerAccountConfigured ? "outline" : "default"}
              >
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
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="overline">Account</p>
          <h1 className="mt-4 text-h1 font-semibold text-foreground">
            {customer.firstName
              ? `Hello, ${customer.firstName}`
              : "Your account"}
          </h1>
        </div>
        <Button asChild variant="outline">
          <a href="/api/auth/logout">Sign out</a>
        </Button>
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
