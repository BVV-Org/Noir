import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProvider } from "@/lib/data";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { PriceTag } from "@/components/commerce/price-tag";
import { ProductGrid } from "@/components/commerce/product-grid";
import { QuickViewDialog } from "@/components/shop/quick-view-dialog";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { kitJsonLd } from "@/lib/seo/jsonld";

export const revalidate = 3600;

export async function generateStaticParams() {
  const kits = await getProvider().getDiscoveryKits();
  return kits.map((kit) => ({ handle: kit.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const kit = await getProvider().getDiscoveryKitByHandle(handle);
  if (!kit) return buildMetadata({ title: "Not found", noIndex: true });

  return buildMetadata({
    title: kit.seo?.title ?? kit.title,
    description: kit.seo?.description ?? kit.tagline ?? kit.description,
    path: `/discovery-kits/${kit.handle}`,
    image: kit.image?.url,
  });
}

/**
 * A single kit.
 *
 * The provider resolves `nv.kit_products` into full products, so the contents
 * render as ordinary product cards — the same component the shop uses. A kit
 * page is the one place where "what is in the box" *is* the page.
 */
export default async function KitPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const kit = await getProvider().getDiscoveryKitByHandle(handle);

  if (!kit) notFound();

  const contents = kit.products ?? [];

  return (
    <>
      <JsonLd data={kitJsonLd(kit, `/discovery-kits/${kit.handle}`)} />

      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Discovery Kits", href: "/discovery-kits" },
            { label: kit.title },
          ]}
        />
      </Container>

      <Container className="py-10 sm:py-14">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card">
            {kit.image && (
              <Image
                src={kit.image.url}
                alt={kit.image.altText}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            )}
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="overline">Discovery Kit</p>
                {kit.availableForSale ? (
                  <Badge variant="emerald">
                    {kit.productHandles.length} fragrances
                  </Badge>
                ) : (
                  <Badge variant="outline">Sold out</Badge>
                )}
              </div>

              <h1 className="mt-4 text-h1 font-semibold tracking-tight text-foreground">
                {kit.title}
              </h1>

              {kit.tagline && (
                <p className="mt-4 text-lg text-muted-foreground">
                  {kit.tagline}
                </p>
              )}
            </div>

            <PriceTag price={kit.price} size="lg" />

            <p className="text-base text-muted-foreground">{kit.description}</p>

            <p className="text-small text-muted-foreground">
              {kit.availableForSale
                ? "Each fragrance ships as a 2ml atomiser, enough for roughly ten wears."
                : "This kit has sold out. The fragrances inside it are still available individually."}
            </p>
          </div>
        </div>
      </Container>

      {contents.length > 0 && (
        <Section
          eyebrow="Inside the kit"
          title="What you will be wearing"
          description="Every fragrance in this kit, in full. Buy the bottle once you know."
          spacing="sm"
        >
          <ProductGrid
            products={contents}
            renderAction={(product) => <QuickViewDialog product={product} />}
          />
        </Section>
      )}
    </>
  );
}
