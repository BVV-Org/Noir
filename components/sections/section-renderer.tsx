import type {
  Collection,
  HomepageSection,
  JournalArticle,
  Kit,
  Product,
} from "@/types";
import { Hero } from "@/components/sections/hero";
import { FeaturedCollections } from "@/components/sections/featured-collections";
import { ProductSection } from "@/components/sections/product-section";
import { DiscoveryKitsStrip } from "@/components/sections/discovery-kits-strip";
import { JournalPreview } from "@/components/sections/journal-preview";
import { Newsletter } from "@/components/sections/newsletter";
import { CTABanner } from "@/components/sections/cta-banner";

/**
 * Everything the homepage's sections might need, fetched once by the page and
 * handed down. Sections never fetch: a section that fetched would serialise the
 * page's data loading behind its own position in the tree.
 */
export interface SectionData {
  heroProduct: Product | null;
  bestSellers: Product[];
  newArrivals: Product[];
  collections: Collection[];
  kits: Kit[];
  articles: JournalArticle[];
}

/**
 * SectionRenderer — turns one `nv_homepage_section` metaobject into a section.
 *
 * The `switch` is exhaustive over `HomepageSectionType`. If Shopify grows a new
 * section type, `never` in the default branch makes it a compile error here
 * rather than a silently blank homepage in production.
 */
export function SectionRenderer({
  section,
  data,
}: {
  section: HomepageSection;
  data: SectionData;
}) {
  switch (section.type) {
    case "hero":
      return <Hero section={section} product={data.heroProduct} />;

    case "featured_collections":
      return (
        <FeaturedCollections section={section} collections={data.collections} />
      );

    case "best_sellers":
      return <ProductSection section={section} products={data.bestSellers} />;

    case "new_arrivals":
      return <ProductSection section={section} products={data.newArrivals} />;

    case "discovery_kits":
      return <DiscoveryKitsStrip section={section} kits={data.kits} />;

    case "journal_preview":
      return <JournalPreview section={section} articles={data.articles} />;

    case "newsletter":
      return <Newsletter section={section} />;

    case "cta":
      return <CTABanner section={section} />;

    default: {
      const exhaustive: never = section.type;
      console.warn(`Unhandled homepage section type: ${String(exhaustive)}`);
      return null;
    }
  }
}
