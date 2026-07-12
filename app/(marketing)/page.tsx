import { getProvider } from "@/lib/data";
import { cn } from "@/lib/utils";
import { RARITIES, RARITY_LABELS, type Rarity } from "@/lib/config/site";
import { Marquee } from "@/components/motion/marquee";
import {
  SectionRenderer,
  type SectionData,
} from "@/components/sections/section-renderer";

/** Static map so Tailwind's compiler sees every rarity text class. */
const RARITY_TEXT: Record<Rarity, string> = {
  common: "text-rarity-common",
  rare: "text-rarity-rare",
  epic: "text-rarity-epic",
  legendary: "text-rarity-legendary",
  mythic: "text-rarity-mythic",
};

/**
 * Home — a Server Component that renders whatever Shopify says the homepage is.
 *
 * There is no hardcoded section order here. `getHomepageSections()` returns the
 * enabled `nv_homepage_section` metaobjects already sorted by `order`, and this
 * page maps over them. Reordering or hiding a section is an Admin change.
 *
 * All reads are issued in parallel: the sections are independent, so awaiting
 * them in sequence would add six round-trips to TTFB for no reason.
 */
// Must be a literal: Next statically analyses segment config and cannot resolve
// an imported constant. Mirrors `DEFAULT_REVALIDATE` in lib/constants.ts.
export const revalidate = 3600;

export default async function HomePage() {
  const provider = getProvider();
  const sections = await provider.getHomepageSections();

  // The hero names its own featured bottle through `nv` product references.
  const heroHandle = sections.find((s) => s.type === "hero")
    ?.productHandles?.[0];

  const [heroProduct, bestSellers, newArrivals, collections, kits, articles] =
    await Promise.all([
      heroHandle ? provider.getProductByHandle(heroHandle) : null,
      provider.getProducts({ sort: "best-selling", first: 4 }),
      provider.getProducts({ sort: "newest", first: 4 }),
      provider.getCollections(),
      provider.getDiscoveryKits(),
      provider.getJournalArticles(),
    ]);

  const data: SectionData = {
    heroProduct,
    bestSellers: bestSellers.items,
    newArrivals: newArrivals.items,
    collections,
    kits,
    articles: articles.slice(0, 3),
  };

  return (
    <>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} data={data} />
      ))}

      {/*
        The page's one marquee: the rarity ladder as a closing brand strip.
        Tier names carry their tier colors — the scale IS the content, so
        the color is data, not decoration. Classes are spelled out because
        Tailwind cannot see interpolated names.
      */}
      <Marquee className="border-y border-foreground/15 py-8 sm:py-10">
        {RARITIES.map((tier) => (
          <span
            key={tier}
            className={cn(
              "font-display text-h2 uppercase leading-none",
              RARITY_TEXT[tier]
            )}
          >
            {RARITY_LABELS[tier]}
          </span>
        ))}
      </Marquee>
    </>
  );
}
