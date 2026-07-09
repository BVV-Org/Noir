import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Product } from "@/types";
import { getProvider } from "@/lib/data";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductBadge } from "@/components/commerce/product-badge";
import { ProductGrid } from "@/components/commerce/product-grid";
import { ProductGallery } from "@/components/product/product-gallery";
import { VariantSelector } from "@/components/product/variant-selector";
import { PerformancePanel } from "@/components/product/performance-panel";
import { ClassificationPanel } from "@/components/product/classification-panel";
import { NotesPyramid } from "@/components/product/notes-pyramid";

export const revalidate = 3600;

/** Pre-build every product page; ISR + webhooks keep them fresh (TDD §4). */
export async function generateStaticParams() {
  const handles = await getProvider().getAllProductHandles();
  return handles.map((handle) => ({ handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProvider().getProductByHandle(handle);
  if (!product) return { title: "Not found" };

  const title = product.seo?.title ?? product.title;
  const description =
    product.seo?.description ?? product.tagline ?? product.description;
  const image = product.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

/** Resolve `nv` product-reference lists into products, dropping dead handles. */
async function resolveHandles(handles: string[]): Promise<Product[]> {
  const provider = getProvider();
  const resolved = await Promise.all(
    handles.map((handle) => provider.getProductByHandle(handle))
  );
  return resolved.filter((p): p is Product => Boolean(p));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProvider().getProductByHandle(handle);

  if (!product) notFound();

  const [similar, related] = await Promise.all([
    resolveHandles(product.similarFragranceHandles),
    resolveHandles(product.relatedProductHandles),
  ]);

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: product.title },
          ]}
        />
      </Container>

      <Container className="py-10 sm:py-14">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} title={product.title} />

          <div className="flex flex-col gap-8">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                {product.brand && <p className="overline">{product.brand}</p>}
                <ProductBadge product={product} />
              </div>

              <h1 className="mt-4 text-h1 font-semibold tracking-tight text-foreground">
                {product.title}
              </h1>

              {product.tagline && (
                <p className="mt-4 text-lg text-muted-foreground">
                  {product.tagline}
                </p>
              )}
            </div>

            <VariantSelector product={product} />

            <p className="text-base text-muted-foreground">
              {product.description}
            </p>
          </div>
        </div>
      </Container>

      <Container className="pb-8">
        <div className="grid gap-16 border-t border-border pt-16 lg:grid-cols-2 lg:gap-20">
          <PerformancePanel performance={product.performance} />
          <ClassificationPanel
            classification={product.classification}
            releaseYear={product.releaseYear}
          />
        </div>
      </Container>

      <Container className="py-16">
        <NotesPyramid notes={product.notes} />
      </Container>

      {similar.length > 0 && (
        <Section
          eyebrow="Smells like this"
          title="Similar fragrances"
          spacing="sm"
        >
          <ProductGrid products={similar} />
        </Section>
      )}

      {related.length > 0 && (
        <Section
          eyebrow="From the vault"
          title="You may also like"
          spacing="sm"
        >
          <ProductGrid products={related} />
        </Section>
      )}
    </>
  );
}
