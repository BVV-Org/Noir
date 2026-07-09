import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";

/**
 * Rendered for unmatched routes and for any `notFound()` call — chiefly a
 * Shopify handle that no longer resolves (TDD §4). Inherits the root layout, so
 * the navbar and footer keep the visitor oriented rather than stranded.
 */
export default function NotFound() {
  return (
    <Section spacing="lg" className="text-center">
      <p className="overline">404</p>
      <h1 className="mt-4 text-h1 font-semibold tracking-tight text-foreground">
        This door doesn&rsquo;t open
      </h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
        The page you&rsquo;re looking for has been moved, renamed, or never
        existed. The vault is still open.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/shop">Browse fragrances</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </Section>
  );
}
