import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageOpen } from "lucide-react";
import { getProvider } from "@/lib/data";
import { parseShopQuery, type RawSearchParams } from "@/lib/shop/search-params";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGrid } from "@/components/commerce/product-grid";
import { EmptyState } from "@/components/commerce/empty-state";
import { SortSelect } from "@/components/shop/sort-select";
import { CollectionNav } from "@/components/shop/collection-nav";
import { QuickViewDialog } from "@/components/shop/quick-view-dialog";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { collectionJsonLd } from "@/lib/seo/jsonld";

export const revalidate = 3600;

export async function generateStaticParams() {
  const collections = await getProvider().getCollections();
  return collections.map((collection) => ({ handle: collection.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getProvider().getCollectionByHandle(handle);
  if (!collection) return buildMetadata({ title: "Not found", noIndex: true });

  return buildMetadata({
    title: collection.seo?.title ?? collection.title,
    description:
      collection.seo?.description ??
      collection.tagline ??
      collection.description,
    // Canonical omits `?sort=` — a sorted collection is the same page of the
    // same products, and four sort orders must not become four indexed URLs.
    path: `/collections/${collection.handle}`,
    image: collection.image?.url,
  });
}

/**
 * A single smart collection.
 *
 * Sorting is read from the URL and handed to the provider, so a sorted
 * collection is a shareable link. The collection's membership is resolved by
 * its tag rule, never by a hand-maintained list — see `collectionTagRules`.
 */
export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const [{ handle }, rawParams] = await Promise.all([params, searchParams]);
  const { sort } = parseShopQuery(rawParams);

  const provider = getProvider();
  const [collection, allCollections] = await Promise.all([
    provider.getCollectionByHandle(handle, { sort }),
    provider.getCollections(),
  ]);

  if (!collection) notFound();

  const products = collection.products ?? [];

  return (
    <Container className="py-8 sm:py-12">
      <JsonLd
        data={collectionJsonLd(collection, `/collections/${collection.handle}`)}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Collections", href: "/collections" },
          { label: collection.title },
        ]}
      />

      <header className="mt-10 max-w-2xl">
        {typeof collection.productCount === "number" && (
          <p className="overline">
            {collection.productCount}{" "}
            {collection.productCount === 1 ? "fragrance" : "fragrances"}
          </p>
        )}
        <h1 className="mt-4 text-h1 font-semibold text-foreground">
          {collection.title}
        </h1>
        {collection.tagline && (
          <p className="mt-4 text-lg text-foreground">{collection.tagline}</p>
        )}
        {collection.description && (
          <p className="mt-4 text-base text-muted-foreground">
            {collection.description}
          </p>
        )}
      </header>

      <div className="mt-10">
        <CollectionNav collections={allCollections} activeHandle={handle} />
      </div>

      {products.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon={PackageOpen}
            title="Nothing in this collection yet"
            description="Its tag rule matches no products right now. Tag a fragrance in Shopify and it will appear here."
            action={
              <Button asChild variant="outline">
                <Link href="/shop">Browse all fragrances</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-8 flex justify-end">
            <SortSelect value={sort} searching={false} />
          </div>
          <div className="mt-8">
            <ProductGrid
              products={products}
              priorityCount={4}
              renderAction={(product) => <QuickViewDialog product={product} />}
            />
          </div>
        </>
      )}
    </Container>
  );
}
