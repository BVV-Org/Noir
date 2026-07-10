import Link from "next/link";
import { getProvider } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";

/**
 * Rendered for unmatched routes and for any `notFound()` call — chiefly a
 * Shopify handle that no longer resolves (TDD §4). Inherits the root layout, so
 * the navbar and footer keep the visitor oriented rather than stranded.
 *
 * A 404 is a navigation failure, and the fix for a navigation failure is
 * navigation. Rather than two generic buttons, it offers the live collections —
 * a discontinued product's URL most often means the shopper wanted something
 * near it. The collections are read through the provider, so this list is never
 * stale.
 *
 * No `metadata` export: Next serves a 404 status and injects `<meta
 * name="robots" content="noindex">` for this file automatically. Adding our own
 * produced a second, conflicting robots tag in the same document.
 */
export default async function NotFound() {
  // The provider can be down at the same moment a URL 404s. A 404 page that
  // throws produces a 500, which is a far worse answer to a wrong URL.
  let collections: { handle: string; title: string }[] = [];
  try {
    collections = (await getProvider().getCollections()).slice(0, 4);
  } catch (error) {
    console.error("not-found: could not read collections", error);
  }

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

      {collections.length > 0 && (
        <nav aria-labelledby="not-found-collections" className="mt-16">
          <h2 id="not-found-collections" className="overline">
            Or start with a collection
          </h2>
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {collections.map((collection) => (
              <li key={collection.handle}>
                <Link
                  href={`/collections/${collection.handle}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-small text-muted-foreground transition-colors duration-150 ease-premium hover:border-border/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {collection.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </Section>
  );
}
