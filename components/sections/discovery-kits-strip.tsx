import Image from "next/image";
import Link from "next/link";
import type { HomepageSection, Kit } from "@/types";
import { Section } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { StickyStack } from "@/components/motion/sticky-stack";
import { KitCard } from "@/components/commerce/kit-card";
import { PriceTag } from "@/components/commerce/price-tag";

/**
 * DiscoveryKitsStrip — sampling before committing to a bottle.
 *
 * Three curated kits are a story, not a catalogue, so from `lg` up each one
 * takes the stage as a full banner and the next stacks over it on scroll
 * (sticky stack). Small screens keep the plain card grid — stacking needs
 * vertical room a phone doesn't have. Both variants are in the markup and
 * toggled by breakpoint, so the server renders one tree.
 */
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
      <div className="lg:hidden">
        <Stagger
          as="ul"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {kits.map((kit) => (
            <StaggerItem as="li" key={kit.id} className="flex">
              <KitCard kit={kit} className="w-full" />
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <div className="hidden lg:block">
        <StickyStack
          items={kits.map((kit) => (
            <KitBanner key={kit.id} kit={kit} />
          ))}
        />
      </div>
    </Section>
  );
}

/**
 * KitBanner — one kit at stage scale for the sticky stack. Same data as
 * KitCard, recomposed as a landscape plate: artwork behind a fixed ink scrim
 * (so the white type holds in both themes), the facts in the bottom row, the
 * whole card one stretched link.
 */
function KitBanner({ kit }: { kit: Kit }) {
  const count = kit.productHandles.length;

  return (
    <article className="relative h-[72vh] overflow-hidden rounded-xl border border-border bg-card shadow-card">
      {kit.image && (
        <Image
          src={kit.image.url}
          alt={kit.image.altText}
          fill
          sizes="(min-width: 1440px) 1380px, 95vw"
          className="object-cover"
        />
      )}

      {/* Decorative: the heading below carries the meaning. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
      />

      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-6 p-8 sm:p-10">
        <div className="min-w-0 max-w-2xl">
          <p className="text-caption font-medium text-white/70">{count} fragrances</p>
          <h3 className="mt-2 text-h2 text-white">
            <Link
              href={`/discovery-kits/${kit.handle}`}
              className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none"
            >
              {kit.title}
            </Link>
          </h3>
          {kit.tagline && (
            <p className="mt-3 max-w-md text-base text-white/75">
              {kit.tagline}
            </p>
          )}
        </div>

        <span className="rounded-full bg-white px-4 py-2 text-black">
          <PriceTag
            price={kit.price}
            className="[&_*]:text-black [&_s]:text-black/50"
          />
        </span>
      </div>
    </article>
  );
}
