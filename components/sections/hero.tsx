import Link from "next/link";
import type { HomepageSection, Product } from "@/types";
import { FadeIn } from "@/components/motion/fade-in";
import { Magnetic } from "@/components/motion/magnetic";
import { MaskRise } from "@/components/motion/mask-rise";
import { ScrollFrameHero } from "@/components/motion/scroll-frame-hero";
import { KineticText } from "@/components/ui/kinetic-text";

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
      {/* frameVersion: bump whenever /public/hero-frames is re-extracted so
          returning visitors and the CDN can't serve the previous clip's bytes
          (the preloaded first frame is the stickiest to cache). v2 = 9 PM. */}
      <ScrollFrameHero frameCount={97} frameVersion="2">
        <MaskRise mode="mount" as="p">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-caption font-medium text-white/80 backdrop-blur-md">
            <span aria-hidden className="size-1.5 rounded-full bg-white/80" />
            The Vault is open
          </span>
        </MaskRise>

        {/*
          The two lines are given the same delay base but opposite drift
          directions: the lead enters from the left, the payoff from the right,
          and they settle into a single centred block. Character staggers run
          across each whole line, so the wave crosses the headline evenly.

          Anton survives here and only here: the one poster moment on a site
          otherwise set entirely in Geist, so the face is named explicitly
          rather than inherited from the global heading rule. Sized locally so
          the scrubbed bottle reads through the type.
        */}
        {/*
          The headline letters are KineticText: each character thickens and
          takes a stroke on hover while its neighbours respond at falling
          strength, so the word reacts to the cursor as a body. It owns the
          per-letter spans, which is why CharReveal's entrance no longer wraps
          this headline — both split the same text and cannot share it.
        */}
        <h1 className="mt-6 font-display text-[clamp(3.5rem,10.5vw,11rem)] font-normal uppercase leading-[0.95] tracking-[-0.01em] text-white drop-shadow-2xl">
          <KineticText text={lead} as="span" className="justify-center" />
          {payoff && (
            <KineticText text={payoff} as="span" className="justify-center" />
          )}
        </h1>

        {section.subtitle && (
          <MaskRise mode="mount" delay={0.55} as="p" className="mt-8">
            <span className="block max-w-lg text-lg text-white/75">
              {section.subtitle}
            </span>
          </MaskRise>
        )}

        {/*
          The hero CTAs are the system's pills, inverted over the dark frames: a
          solid paper primary and a frosted secondary. Interface type, not the
          poster face — a button is a control, not a second headline.

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
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-base font-medium text-black transition-colors duration-200 hover:bg-white/90"
                >
                  {section.ctaLabel}
                </Link>
              </Magnetic>
            )}
            <Link
              href="/discovery-kits"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 text-base font-medium text-white backdrop-blur-md transition-colors duration-200 hover:bg-white/15"
            >
              Start with samples
            </Link>
          </div>
        </FadeIn>
      </ScrollFrameHero>
    </section>
  );
}
