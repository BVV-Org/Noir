import Image from "next/image";
import Link from "next/link";
import type { HomepageSection, Product } from "@/types";
import { RARITY_LABELS } from "@/lib/config/site";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { RarityBadge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion/fade-in";
import { Magnetic } from "@/components/motion/magnetic";
import { MaskRise } from "@/components/motion/mask-rise";
import { ParallaxMedia } from "@/components/motion/parallax-media";
import { ScrollVideoHero } from "@/components/motion/scroll-video-hero";

/**
 * Hero — the homepage thesis, set like a poster.
 *
 * The intro is a scroll-scrubbed video: its playhead follows scroll progress
 * through a tall pinned track, so the clip plays forward as the visitor scrolls
 * in and reverses on the way up, and the rest of the page is only reached once
 * they have scrolled the animation through. A dark cinematic scrim keeps the
 * white headline legible over any frame.
 *
 * The featured bottle then reveals below as a full-width plate — its name and
 * tier in a mono caption row beneath the photograph, never on it. The featured
 * product is `nv`-driven (`productHandles[0]` on the hero metaobject).
 */
export function Hero({
  section,
  product,
}: {
  section: HomepageSection;
  product: Product | null;
}) {
  const rarity = product?.classification.rarity;
  const media = product?.images[0] ?? section.media;

  return (
    // No `overflow-hidden` here: it would become the scroll container for the
    // hero's `position: sticky` stage and break the pin, leaving the tall scroll
    // track empty. ParallaxMedia clips its own frame, so the clip isn't needed.
    <section className="relative">
      <ScrollVideoHero src="/background.mp4">
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

        <FadeIn delay={0.25}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            {section.ctaLabel && section.ctaUrl && (
              <Magnetic>
                <Button
                  asChild
                  size="lg"
                  className="border border-white/20 bg-white/10 text-white backdrop-blur-xl hover:bg-white/20"
                >
                  <Link href={section.ctaUrl}>{section.ctaLabel}</Link>
                </Button>
              </Magnetic>
            )}
            <Link
              href="/discovery-kits"
              className="rounded-sm border border-white/15 bg-white/5 px-6 py-3 text-white backdrop-blur-xl transition-all hover:bg-white/15"
            >
              Start with samples
            </Link>
          </div>
        </FadeIn>
      </ScrollVideoHero>

      <Container>
        {media && (
          <FadeIn delay={0.1}>
            <figure className="pb-16 pt-16 lg:pb-24 lg:pt-24">
              <ParallaxMedia className="aspect-[4/5] w-full rounded-lg sm:aspect-[16/9]">
                <Image
                  src={media.url}
                  alt={media.altText}
                  fill
                  priority
                  sizes="(min-width: 1440px) 1380px, 95vw"
                  className="object-cover"
                />
              </ParallaxMedia>

              {product && (
                <figcaption className="mt-4 flex items-end justify-between gap-4">
                  <div className="min-w-0 text-left">
                    {product.brand && (
                      <p className="overline">{product.brand}</p>
                    )}
                    <p className="mt-2 font-display text-h4 uppercase text-foreground">
                      <Link
                        href={`/products/${product.handle}`}
                        className="rounded-sm hover:opacity-70"
                      >
                        {product.title}
                      </Link>
                    </p>
                  </div>
                  {rarity && (
                    <RarityBadge
                      rarity={rarity}
                      label={RARITY_LABELS[rarity]}
                      className="shrink-0"
                    />
                  )}
                </figcaption>
              )}
            </figure>
          </FadeIn>
        )}
      </Container>
    </section>
  );
}
