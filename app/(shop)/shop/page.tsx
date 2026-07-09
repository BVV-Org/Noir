import { Suspense } from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { getProvider } from "@/lib/data";
import {
  FACET_KEYS,
  parseShopQuery,
  type RawSearchParams,
} from "@/lib/shop/search-params";
import { buildFacets, priceBounds } from "@/lib/shop/facets";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/commerce/product-grid";
import { EmptyState } from "@/components/commerce/empty-state";
import { SearchBar } from "@/components/shop/search-bar";
import { SortSelect } from "@/components/shop/sort-select";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { FilterSheet } from "@/components/shop/filter-sheet";
import { ActiveFilters } from "@/components/shop/active-filters";
import { CollectionNav } from "@/components/shop/collection-nav";
import { QuickViewDialog } from "@/components/shop/quick-view-dialog";
import { ProductGridSkeleton } from "@/components/shop/product-grid-skeleton";
import { LoadMoreProducts } from "@/components/shop/load-more-products";

/**
 * The canonical is the bare `/shop`. Facet and sort params produce the same
 * catalogue in a different order or subset; letting each combination become its
 * own indexed URL would split the page's authority thousands of ways.
 */
export const metadata: Metadata = buildMetadata({
  title: "Shop",
  description:
    "Every fragrance in the vault. Filter by rarity, house, season, notes, and price.",
  path: "/shop",
});

/**
 * Shop — the catalogue.
 *
 * Entirely server-rendered from the URL. The client components are inputs that
 * write search params; the grid itself never holds filter state, so the back
 * button, a shared link, and a hard refresh all reconstruct the same page.
 *
 * Two provider reads: one unfiltered, to count the facets (a sidebar whose
 * options disappear as you narrow is unusable), and one filtered, for the grid.
 * The live provider will collapse these into a single Storefront query that
 * returns `filters` alongside `products`.
 */
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const { query, sort, filters, show, hasFilters } = parseShopQuery(params);

  const provider = getProvider();
  const [catalogue, collections] = await Promise.all([
    provider.getProducts({ first: 250 }),
    provider.getCollections(),
  ]);

  const facets = buildFacets(catalogue.items);
  const bounds = priceBounds(catalogue.items);

  const selected: Record<string, string[]> = Object.fromEntries(
    FACET_KEYS.map((key) => [key, ([] as string[]).concat(params[key] ?? [])])
  );

  const activeCount =
    Object.values(selected).reduce(
      (total, values) => total + values.length,
      0
    ) +
    (params.min ? 1 : 0) +
    (params.max ? 1 : 0) +
    (params.stock ? 1 : 0);

  // Re-suspend whenever the query changes, so the skeleton shows on every
  // filter change rather than only on the first paint.
  const resultsKey = JSON.stringify(params);

  return (
    <Container className="py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="overline">The Vault</p>
        <h1 className="mt-4 text-h1 font-semibold tracking-tight text-foreground">
          Shop
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {catalogue.items.length} fragrances, catalogued by rarity, house, and
          the notes they are built on.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-6">
        <SearchBar initialQuery={query} />
        <CollectionNav collections={collections} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-12">
        <aside className="hidden lg:block">
          <h2 className="sr-only">Filters</h2>
          <FilterSidebar
            groups={facets}
            selected={selected}
            priceRange={bounds}
            query={query}
            sort={sort}
            inStockOnly={Boolean(filters.inStockOnly)}
          />
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <FilterSheet
              groups={facets}
              selected={selected}
              priceRange={bounds}
              query={query}
              sort={sort}
              inStockOnly={Boolean(filters.inStockOnly)}
              activeCount={activeCount}
            />
            <div className="ml-auto">
              <SortSelect value={sort} searching={Boolean(query)} />
            </div>
          </div>

          {activeCount > 0 && (
            <div className="mt-6">
              <ActiveFilters />
            </div>
          )}

          <div className="mt-8">
            <Suspense key={resultsKey} fallback={<ProductGridSkeleton />}>
              <ShopResults
                query={query}
                sort={sort}
                filters={filters}
                show={show}
                hasFilters={hasFilters}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </Container>
  );
}

/**
 * The grid, split out so it can suspend independently of the controls — the
 * filters stay interactive while results are being fetched.
 */
async function ShopResults({
  query,
  sort,
  filters,
  show,
  hasFilters,
}: {
  query: string;
  sort: ReturnType<typeof parseShopQuery>["sort"];
  filters: ReturnType<typeof parseShopQuery>["filters"];
  show: number;
  hasFilters: boolean;
}) {
  const provider = getProvider();

  // `searchProducts` takes no sort key or page size — search results are ranked
  // by relevance and returned a page at a time (TDD §6.1). Sorting and "load
  // more" are therefore browse-only affordances.
  const page = query
    ? await provider.searchProducts(query, filters)
    : await provider.getProducts({ sort, filters, first: show });

  if (page.items.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title={
          query
            ? `No fragrances match “${query}”`
            : "No fragrances match these filters"
        }
        description={
          query
            ? "Try a house, a note, or a shorter phrase."
            : "Loosen a filter, or clear them all and start again."
        }
        action={
          (query || hasFilters) && (
            <Button asChild variant="outline">
              <Link href="/shop">Clear search and filters</Link>
            </Button>
          )
        }
      />
    );
  }

  return (
    <>
      <p aria-live="polite" className="sr-only">
        {page.items.length} fragrances shown
      </p>

      <ProductGrid
        products={page.items}
        priorityCount={4}
        renderAction={(product) => <QuickViewDialog product={product} />}
      />

      {/*
        Pagination appends rather than navigates, through `use-infinite-products`
        and a Server Action. The first page above stays server-rendered — this
        only ever adds to it.

        Not rendered during search: `searchProducts(query, filters)` takes no
        cursor by contract, so a search result set has no page two to fetch.
      */}
      {!query && (
        <LoadMoreProducts
          initialItems={page.items}
          initialPageInfo={page.pageInfo}
          sort={sort}
          filters={filters}
        />
      )}
    </>
  );
}
