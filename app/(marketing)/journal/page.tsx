import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { getProvider } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { JournalCard } from "@/components/commerce/journal-card";
import { EmptyState } from "@/components/commerce/empty-state";

export const revalidate = 3600;

/** Canonical omits `?category=` — a filtered view of the same article list. */
export const metadata: Metadata = buildMetadata({
  title: "Journal",
  description:
    "Writing on scent, scarcity, and how to build a collection worth keeping.",
  path: "/journal",
});

/**
 * Journal index, filterable by category.
 *
 * Categories come from the articles' own tags rather than a hardcoded list, so
 * adding a tag in Shopify adds a filter. The active category lives in `?category=`,
 * which keeps the filtered view linkable and lets the page stay a Server
 * Component — the filter is a set of links, not client state.
 */
export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ category }, articles] = await Promise.all([
    searchParams,
    getProvider().getJournalArticles(),
  ]);

  const categories = [...new Set(articles.flatMap((a) => a.tags))].sort();
  const active = category && categories.includes(category) ? category : null;

  const visible = active
    ? articles.filter((a) => a.tags.includes(active))
    : articles;

  return (
    <Container className="py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="overline">The Vault</p>
        <h1 className="mt-4 text-h1 font-semibold text-foreground">Journal</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Reading that makes the catalogue easier to navigate. No launch
          announcements.
        </p>
      </header>

      {categories.length > 0 && (
        <nav aria-label="Article categories" className="mt-10">
          <ul className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
            <li className="snap-start">
              <CategoryLink href="/journal" active={!active}>
                All
              </CategoryLink>
            </li>
            {categories.map((name) => (
              <li key={name} className="snap-start">
                <CategoryLink
                  href={`/journal?category=${encodeURIComponent(name)}`}
                  active={active === name}
                >
                  {name}
                </CategoryLink>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mt-12">
        {visible.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="No articles here yet"
            description="Nothing has been published under this category."
            action={
              <Button asChild variant="outline">
                <Link href="/journal">Read everything</Link>
              </Button>
            }
          />
        ) : (
          <Stagger
            as="ul"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visible.map((article, index) => (
              <StaggerItem as="li" key={article.id} className="flex">
                <JournalCard
                  article={article}
                  priority={index < 2}
                  className="w-full"
                />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </Container>
  );
}

function CategoryLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center whitespace-nowrap rounded-full border px-4 text-small transition-colors duration-150 ease-premium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}
