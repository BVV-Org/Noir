import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { buildMetadata } from "@/lib/seo/metadata";
import { getKB } from "@/lib/dupes/loader";
import { getFeaturedOriginals } from "@/lib/dupes/ranker";
import { DupeFinder } from "@/components/dupe-finder/dupe-finder";

/**
 * Fragrance Dupe Finder — powered entirely by the fragrance knowledge base.
 *
 * This Server Component reads the KB to compute the empty-state's featured
 * originals; everything else is fetched on demand by the client island through
 * `/api/dupes/*`. No fragrance is hardcoded anywhere.
 */
export const metadata: Metadata = buildMetadata({
  title: "Fragrance Dupe Finder",
  description:
    "Search any designer or niche fragrance and find its verified, community-sourced dupes — ranked by confidence, with transparent similarity, performance, and price comparisons.",
  path: "/dupe-finder",
});

// The KB is read at request time; keep this route dynamic so newly added
// fragrances appear without a rebuild.
export const dynamic = "force-dynamic";

export default async function DupeFinderPage() {
  const index = await getKB();
  const featured = getFeaturedOriginals(index, 6);

  return (
    <Container as="main" className="pb-24">
      <DupeFinder featured={featured} />
    </Container>
  );
}
