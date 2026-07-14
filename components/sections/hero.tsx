import Link from "next/link";
import type { HomepageSection, Product } from "@/types";
import { FadeIn } from "@/components/motion/fade-in";
import { Magnetic } from "@/components/motion/magnetic";
import { MaskRise } from "@/components/motion/mask-rise";
import { ScrollFrameHero } from "@/components/motion/scroll-frame-hero";

/**
 * Hero — the homepage thesis, set like a poster.
 *
 * The intro is a scroll-scrubbed image sequence (see ScrollFrameHero): frames
 * follow scroll progress through a tall pinned track, so the clip plays forward
 * as the visitor scrolls in and reverses on the way up. A dark cinematic scrim
 * keeps the headline and CTAs legible over any frame.
 *
 * The single featured-product plate that once sat below the hero was removed —
 * one lonely bottle read as an odd placeholder — so the "Most Collected" grid
 * now follows the hero directly (see the section order in the homepage).
 */
export function Hero({
  section,
}: {
  section: HomepageSection;
  // Retained on the type so the CMS-driven caller (SectionRenderer) needs no
  // change; unused now that the featured-product plate is gone.
  product?: Product | null;
}) {
  return (
    // No `overflow-hidden` here: it would become the scroll container for the
    // hero's `position: sticky` stage and break the pin, leaving the tall scroll
    // track empty.
    <section className="relative">
      <ScrollFrameHero>
        <MaskRise mode="mount" as="p">
          <span className="overline tracking-[0.4em] text-white/80">
            The Vault
          </span>
        </MaskRise>

        <MaskRise mode="mount" delay={0.08} className="mt-6">
          <h1 className="max-w-[14ch] text-balance text-display text-white drop-shadow-2xl">
            {section.title ?? "Enter The Vault"}
          </h1>
        </MaskRise>

        {section.subtitle && (
          <MaskRise mode="mount" delay={0.16} as="p" className="mt-8">
            <span className="block max-w-2xl text-lg text-white/85">
              {section.subtitle}
            </span>
          </MaskRise>
        )}

        {/*
          The hero CTAs wear the headline's own type: Anton display, uppercase —
          the same face as "ENTER THE VAULT" above. Palette is inverted over the
          dark frames for legibility: a solid white primary and a light outline
          secondary.
        */}
        <FadeIn delay={0.25}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            {section.ctaLabel && section.ctaUrl && (
              <Magnetic>
                <Link
                  href={section.ctaUrl}
                  className="inline-flex h-12 items-center justify-center rounded-[8px] bg-white px-8 font-display text-lg uppercase leading-none tracking-wide text-[#222] transition-colors duration-200 hover:bg-white/90"
                >
                  {section.ctaLabel}
                </Link>
              </Magnetic>
            )}
            <Link
              href="/discovery-kits"
              className="inline-flex h-12 items-center justify-center rounded-[8px] bg-transparent px-8 font-display text-lg uppercase leading-none tracking-wide text-white transition-colors duration-200 hover:bg-white/10"
            >
              Start with samples
            </Link>
          </div>
        </FadeIn>
      </ScrollFrameHero>
    </section>
  );
}
