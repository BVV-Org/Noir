import type { Collection, HomepageSection } from "@/types";
import { Section } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { CollectionCard } from "@/components/commerce/collection-card";

/** FeaturedCollections — the four doors into the catalogue. */
export function FeaturedCollections({
  section,
  collections,
}: {
  section: HomepageSection;
  collections: Collection[];
}) {
  if (collections.length === 0) return null;

  return (
    <Section
      title={section.title}
      description={section.subtitle}
      action={
        section.ctaLabel && section.ctaUrl
          ? { label: section.ctaLabel, href: section.ctaUrl }
          : undefined
      }
    >
      <Stagger as="ul" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {collections.map((collection) => (
          <StaggerItem as="li" key={collection.id} className="flex">
            <CollectionCard collection={collection} className="w-full" />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
