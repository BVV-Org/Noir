import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { getProvider } from "@/lib/data";
import { RARITIES, RARITY_LABELS, siteConfig } from "@/lib/config/site";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { RarityBadge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { FadeIn } from "@/components/motion/fade-in";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Why Noir Vault tiers fragrances by rarity, and what those tiers actually mean.",
  path: "/about",
});

/**
 * About — the page that explains the rarity progression.
 *
 * The tier scale is the brand's one real idea, so this page is built around
 * explaining it rather than around a founder's story. The tiers are read from
 * the same `RARITIES` constant the badges use: the page cannot fall out of sync
 * with the system it documents.
 */
const TIER_MEANING: Record<(typeof RARITIES)[number], string> = {
  common:
    "Widely available, produced continuously. Excellent, and easy to replace.",
  rare: "Limited distribution or a house that keeps deliberately small batches.",
  epic: "Constrained by a material that is difficult to source at scale.",
  legendary: "A cornerstone composition, or a formula altered by regulation.",
  mythic:
    "A finite run that will not be reissued. When it is gone, it is gone.",
};

export default async function AboutPage() {
  const kits = await getProvider().getDiscoveryKits();
  const entryKit = kits.find((kit) => kit.availableForSale);

  return (
    <>
      <section>
        <Container>
          <div className="max-w-3xl py-20 sm:py-28">
            <FadeIn>
              <p className="overline">About</p>
            </FadeIn>
            <FadeIn delay={0.06}>
              <h1 className="mt-6 text-display font-semibold text-foreground">
                A shop that ranks what it sells
              </h1>
            </FadeIn>
            <FadeIn delay={0.12}>
              <p className="mt-8 text-lg text-muted-foreground">
                Most fragrance retailers sort by price and call it a hierarchy.{" "}
                {siteConfig.name} sorts by scarcity, because scarcity is the
                only thing about a bottle that cannot be manufactured after the
                fact.
              </p>
            </FadeIn>
          </div>
        </Container>
      </section>

      <Section
        eyebrow="The system"
        title="Five tiers"
        description="Every fragrance in the vault carries one. It is assigned from how the liquid is made and how much of it exists, never from what it costs."
      >
        <dl className="flex flex-col divide-y divide-border border-y border-border">
          {RARITIES.map((tier) => (
            <Reveal key={tier}>
              <div className="flex flex-col gap-3 py-8 sm:flex-row sm:items-baseline sm:gap-10">
                <dt className="sm:w-40 sm:shrink-0">
                  <RarityBadge rarity={tier} label={RARITY_LABELS[tier]} />
                </dt>
                <dd className="text-lg text-muted-foreground">
                  {TIER_MEANING[tier]}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </Section>

      <Section
        eyebrow="What we will not do"
        title="No rankings we cannot defend"
        spacing="sm"
      >
        <div className="grid gap-10 lg:grid-cols-3">
          <Reveal>
            <h3 className="text-h5 font-semibold text-foreground">
              Price is not rarity
            </h3>
            <p className="mt-3 text-base text-muted-foreground">
              An expensive fragrance built from commodity materials is Common.
              We have several, and they are excellent.
            </p>
          </Reveal>
          <Reveal>
            <h3 className="text-h5 font-semibold text-foreground">
              Scarcity can be manufactured
            </h3>
            <p className="mt-3 text-base text-muted-foreground">
              A short run decided by a marketing department is not the same as a
              material that no longer exists. We weight the second far more
              heavily.
            </p>
          </Reveal>
          <Reveal>
            <h3 className="text-h5 font-semibold text-foreground">
              Samples before bottles
            </h3>
            <p className="mt-3 text-base text-muted-foreground">
              We would rather sell you a kit than a bottle you return. Wear it
              for a week.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section spacing="sm">
        <div className="flex flex-col items-start justify-between gap-6 rounded-lg border border-border bg-card px-6 py-12 sm:px-10 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="text-h3 font-semibold text-foreground">
              Start where everyone should
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              {entryKit
                ? `${entryKit.title} covers four directions in 2ml atomisers.`
                : "Our discovery kits cover every direction the vault holds."}
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link
              href={
                entryKit
                  ? `/discovery-kits/${entryKit.handle}`
                  : "/discovery-kits"
              }
            >
              {entryKit ? `See ${entryKit.title}` : "Browse kits"}
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
