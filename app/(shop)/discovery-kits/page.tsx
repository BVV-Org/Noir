import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { getProvider } from "@/lib/data";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { KitCard } from "@/components/commerce/kit-card";
import { EmptyState } from "@/components/commerce/empty-state";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Discovery Kits",
  description:
    "Sample before you commit. Curated 2ml atomisers across every direction the vault holds.",
};

export default async function DiscoveryKitsPage() {
  const kits = await getProvider().getDiscoveryKits();

  return (
    <Container className="py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="overline">The Vault</p>
        <h1 className="mt-4 text-h1 font-semibold tracking-tight text-foreground">
          Discovery Kits
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Nobody should buy a bottle they have worn for ninety seconds at a
          counter. Wear it for a week instead.
        </p>
      </header>

      <div className="mt-14">
        {kits.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No kits available"
            description="Discovery kits are products flagged as kits in Shopify. None are published right now."
            action={
              <Button asChild variant="outline">
                <Link href="/shop">Browse all fragrances</Link>
              </Button>
            }
          />
        ) : (
          <Stagger
            as="ul"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {kits.map((kit, index) => (
              <StaggerItem as="li" key={kit.id} className="flex">
                <KitCard kit={kit} priority={index < 3} className="w-full" />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </Container>
  );
}
