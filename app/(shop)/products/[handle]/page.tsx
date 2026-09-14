import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Product } from "@/types";
import { getProvider } from "@/lib/data";
import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/layout/section";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductBadge } from "@/components/commerce/product-badge";
import { TrustBar } from "@/components/commerce/trust-bar";
import { ProductGrid } from "@/components/commerce/product-grid";
import { ProductGallery } from "@/components/product/product-gallery";
import { VariantSelector } from "@/components/product/variant-selector";
import { PerformancePanel } from "@/components/product/performance-panel";
import { ClassificationPanel } from "@/components/product/classification-panel";
import { NotesPyramid } from "@/components/product/notes-pyramid";
import { Reviews } from "@/components/product/reviews";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { productJsonLd } from "@/lib/seo/jsonld";

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
  // Metadata for a handle that 404s is never rendered, but Next still calls
  // this — return something valid rather than throwing.
  if (!product) return buildMetadata({ title: "Not found", noIndex: true });

  return buildMetadata({
    title: product.seo?.title ?? product.title,
    description:
      product.seo?.description ?? product.tagline ?? product.description,
    path: `/products/${product.handle}`,
    image: product.images[0]?.url,
  });
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
      <JsonLd data={productJsonLd(product, `/products/${product.handle}`)} />

      <Container className="pt-8">
        {/* Also emits the BreadcrumbList schema — one source, no drift. */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: product.title },
          ]}
        />
      </Container>

      <Container className="py-8 sm:py-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* The gallery holds its place while the buying column scrolls past
              it on desktop, so the bottle stays in view through the decision. */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGallery
              images={product.images}
              title={product.title}
              videoUrl={product.heroVideoUrl}
            />
          </div>

          <div className="flex flex-col gap-8 lg:pt-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {product.brand && (
                  <p className="text-small font-medium text-muted-foreground">
                    {product.brand}
                  </p>
                )}
                <ProductBadge product={product} />
              </div>

              <h1 className="mt-3 text-h2">{product.title}</h1>

              {product.tagline && (
                <p className="mt-3 text-lg text-muted-foreground">
                  {product.tagline}
                </p>
              )}
            </div>

            <VariantSelector product={product} />

            {/* Reassurance at the moment of decision — see lib/config/trust.ts. */}
            <TrustBar variant="compact" />

            <div className="border-t border-border pt-8">
              <h2 className="text-small font-medium text-foreground">
                About this fragrance
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* The spec sheet: white cards floating on the surface band, one tone
          off the page, so the data reads as a separate layer from the buy box. */}
      <div className="mt-8 border-y border-border bg-surface py-12 sm:py-16">
        <Container className="flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-6 sm:p-8">
              <PerformancePanel performance={product.performance} />
            </Card>
            <Card className="p-6 sm:p-8">
              <ClassificationPanel
                classification={product.classification}
                releaseYear={product.releaseYear}
              />
            </Card>
          </div>
          <Card className="p-6 sm:p-8">
            <NotesPyramid notes={product.notes} />
          </Card>
          <Card className="p-6 sm:p-8">
            <Reviews product={product} />
          </Card>
        </Container>
      </div>

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
