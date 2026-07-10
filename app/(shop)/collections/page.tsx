import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { Layers } from "lucide-react";
import { getProvider } from "@/lib/data";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { CollectionCard } from "@/components/commerce/collection-card";
import { EmptyState } from "@/components/commerce/empty-state";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Collections",
  description:
    "Curated ways through the catalogue — by season, by hour, by scarcity.",
  path: "/collections",
});

export default async function CollectionsPage() {
  const collections = await getProvider().getCollections();

  return (
    <Container className="py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="overline">The Vault</p>
        <h1 className="mt-4 text-h1 font-semibold tracking-tight text-foreground">
          Collections
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Every collection is a rule, not a list. Tag a fragrance in Shopify and
          it appears here on its own.
        </p>
      </header>

      <div className="mt-14">
        {collections.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No collections yet"
            description="Collections are built from product tags. Once products are tagged, they appear here."
            action={
              <Button asChild variant="outline">
                <Link href="/shop">Browse all fragrances</Link>
              </Button>
            }
          />
        ) : (
          <Stagger as="ul" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {collections.map((collection, index) => (
              <StaggerItem as="li" key={collection.id} className="flex">
                <CollectionCard
                  collection={collection}
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
