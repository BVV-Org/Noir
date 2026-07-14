import Link from "next/link";
import type { HomepageSection, Product } from "@/types";
import { FadeIn } from "@/components/motion/fade-in";
import { Magnetic } from "@/components/motion/magnetic";
import { MaskRise } from "@/components/motion/mask-rise";
import { CharReveal } from "@/components/motion/char-reveal";
import { ScrollFrameHero } from "@/components/motion/scroll-frame-hero";

/**
 * Hero — the homepage thesis, set like a poster.
 *
 * The intro is a scroll-scrubbed image sequence (see ScrollFrameHero): frames
 * follow scroll progress through a tall pinned track, so the clip plays forward
 * as the visitor scrolls in and reverses on the way up. A dark cinematic scrim
 * keeps the headline and CTAs legible over any frame.
 *
 * The headline arrives on two speeds (CharReveal): characters slide fast out of
 * their individual masks while the lines they sit in keep drifting slowly
 * behind them, and the two lines counter-move so the block resolves inward.
 * See docs/motion-language.md for where that language comes from and why.
 *
 * Everything is timed to OVERLAP rather than queue — each beat starts before
 * the last one finishes, so individual arcs stay long (0.8–1.4s) while the
 * whole sequence still resolves in under two seconds. The CTA settles LAST on
 * purpose: the eye lands wherever motion ends, so the last thing to move is the
 * thing we want clicked.
 */
export function Hero({
  section,
}: {
  section: HomepageSection;
  // Retained on the type so the CMS-driven caller (SectionRenderer) needs no
  // change; unused now that the featured-product plate is gone.
  product?: Product | null;
}) {
  const title = section.title ?? "Enter The Vault";

  // The headline breaks after the FIRST word — "ENTER" / "THE VAULT" — so the
  // verb lands alone and the subject answers it on the line below, moving
  // against it. Derived from the string rather than hardcoded, so a CMS edit to
  // the title keeps the treatment.
  const words = title.trim().split(/\s+/).filter(Boolean);
  // Falls back to the whole title so a single-word or blank CMS value still
  // renders something rather than an empty <h1>.
  const lead = words[0] ?? title;
  const payoff = words.slice(1).join(" ");

  return (
    // No `overflow-hidden` here: it would become the scroll container for the
    // hero's `position: sticky` stage and break the pin, leaving the tall scroll
    // track empty.
    <section className="relative">
      <ScrollFrameHero>
        <MaskRise mode="mount" as="p">
          <span className="overline tracking-[0.4em] text-white/70">
            The Vault
          </span>
        </MaskRise>

        {/*
          The two lines are given the same delay base but opposite drift
          directions: the lead enters from the left, the payoff from the right,
          and they settle into a single centred block. Character staggers run
          across each whole line, so the wave crosses the headline evenly.

          Sized here rather than with the shared `text-display` token: the hero
          sits over the scrubbed frames, and the token's 12.5vw fills the stage
          edge to edge, leaving no bottle visible behind the type. This clamp is
          a notch smaller so the frame reads through — and it stays local,
          because `text-display` is also the About page's headline.
        */}
        <h1 className="mt-6 text-[clamp(3.5rem,10.5vw,11rem)] uppercase leading-[0.95] tracking-[-0.01em] text-white drop-shadow-2xl">
          <CharReveal
            text={lead}
            as="span"
            from="left"
            delay={0.1}
            className="block"
          />
          {payoff && (
            <CharReveal
              text={payoff}
              as="span"
              from="right"
              delay={0.28}
              className="block"
            />
          )}
        </h1>

        {section.subtitle && (
          <MaskRise mode="mount" delay={0.55} as="p" className="mt-8">
            <span className="block max-w-xl text-lg text-white/85">
              {section.subtitle}
            </span>
          </MaskRise>
        )}

        {/*
          The hero CTAs wear the headline's own type: Anton display, uppercase —
          the same face as the headline above. Palette is inverted over the dark
          frames for legibility: a solid white primary and a light outline
          secondary.

          The buttons fade rather than travel, on a short curve: the primary
          action must never be animating away from a cursor, and it is clickable
          the instant it is visible.
        */}
        <FadeIn delay={0.7}>
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
