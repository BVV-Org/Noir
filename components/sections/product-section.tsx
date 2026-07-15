import type { HomepageSection, Product } from "@/types";
import { Section } from "@/components/layout/section";
import { ProductGrid } from "@/components/commerce/product-grid";
import { ProductCard } from "@/components/commerce/product-card";
import { PinnedRail } from "@/components/motion/pinned-rail";

/**
 * The shared body of the `best_sellers` and `new_arrivals` homepage sections.
 *
 * These differ only in their heading, their products, and their layout: the
 * first product section on the page reads as a grid; the second is a
 * horizontal rail — a plain scroll-snap strip on small screens, and from
 * `lg` up a pinned gallery where vertical scroll pans the track sideways.
 * Both variants are always in the markup and toggled by breakpoint, so the
 * server renders one tree and nothing shifts at hydration.
 *
 * Renders nothing when the section has no products — an empty "Most
 * collected" heading is worse than no heading.
 *
 * No eyebrow here: the hero already spent the page's kicker, and a heading
 * like "Most collected" needs no label above it.
 */
export function ProductSection({
  section,
  products,
  layout = "grid",
}: {
  section: HomepageSection;
  products: Product[];
  layout?: "grid" | "rail";
}) {
  if (products.length === 0) return null;

  return (
    <Section
      title={section.title}
      description={section.subtitle}
      action={
        section.ctaLabel && section.ctaUrl
          ? { label: section.ctaLabel, href: section.ctaUrl }
          : undefined
      }
      className={layout === "rail" ? "lg:pb-0" : undefined}
    >
      {layout === "rail" ? (
        <>
          <div className="lg:hidden">
            <ProductGrid products={products} layout="rail" />
          </div>
          <div className="hidden lg:block">
            <PinnedRail
              items={products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className="w-full"
                />
              ))}
              itemClassName="w-[28vw] max-w-[420px]"
            />
          </div>
        </>
      ) : (
        // Grid on tablet/desktop, a horizontal swipe strip on phones so the
        // homepage stays short on small screens.
        <ProductGrid products={products} layout="rail-mobile" />
      )}
    </Section>
  );
}
