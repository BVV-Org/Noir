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
      {/*
        Phones: a horizontal scroll-snap strip (the site is long, so collections
        swipe sideways instead of stacking). From `sm` up it returns to the grid
        — one column, two at `lg`.
      */}
      <Stagger
        as="ul"
        className={
          "scrollbar-none -mb-4 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 " +
          "sm:mb-0 sm:grid sm:snap-none sm:grid-cols-1 sm:gap-6 sm:overflow-visible sm:pb-0 " +
          "lg:grid-cols-2"
        }
      >
        {collections.map((collection) => (
          <StaggerItem
            as="li"
            key={collection.id}
            className="flex w-[80vw] shrink-0 snap-start sm:w-auto"
          >
            <CollectionCard
              collection={collection}
              subheading="description"
              className="w-full"
            />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
