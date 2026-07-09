import type { HomepageSection, Product } from "@/types";
import { Section } from "@/components/layout/section";
import { ProductGrid } from "@/components/commerce/product-grid";

/**
 * The shared body of the `best_sellers` and `new_arrivals` homepage sections.
 *
 * These differ only in their heading and which products the provider hands
 * over, so they are one component driven by data rather than two components
 * with the same markup. Renders nothing when the section has no products —
 * an empty "Most collected" heading is worse than no heading.
 */
export function ProductSection({
  section,
  products,
}: {
  section: HomepageSection;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <Section
      eyebrow={section.subtitle ? undefined : "The Vault"}
      title={section.title}
      description={section.subtitle}
      action={
        section.ctaLabel && section.ctaUrl
          ? { label: section.ctaLabel, href: section.ctaUrl }
          : undefined
      }
    >
      <ProductGrid products={products} />
    </Section>
  );
}
