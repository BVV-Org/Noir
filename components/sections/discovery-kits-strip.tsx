import type { HomepageSection, Kit } from "@/types";
import { Section } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { KitCard } from "@/components/commerce/kit-card";

/** DiscoveryKitsStrip — sampling before committing to a bottle. */
export function DiscoveryKitsStrip({
  section,
  kits,
}: {
  section: HomepageSection;
  kits: Kit[];
}) {
  if (kits.length === 0) return null;

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
      <Stagger
        as="ul"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {kits.map((kit) => (
          <StaggerItem as="li" key={kit.id} className="flex">
            <KitCard kit={kit} className="w-full" />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
