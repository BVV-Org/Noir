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

/**
 * Hero — the homepage thesis, set like a poster.
 *
 * The claim the brand makes is that a fragrance is a decision, and that some
 * are rare. The hero states it at viewport scale: the headline is the design,
 * stacked condensed caps with nothing competing against it. The featured
 * bottle follows as a full-width plate with its name and tier in a mono
 * caption row below the photograph, never on it.
 *
 * The featured product is `nv`-driven (`productHandles[0]` on the hero
 * metaobject) — editors change the bottle without a deploy.
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
    <section className="relative overflow-hidden">
      <Container>
        <div className="flex flex-col items-center pb-16 pt-14 text-center sm:pt-20 lg:pb-24">
          <MaskRise mode="mount" as="p">
            <span className="overline">The Vault</span>
          </MaskRise>

          <MaskRise mode="mount" delay={0.08} className="mt-8">
            <h1 className="max-w-[12ch] text-balance text-display text-foreground">
              {section.title ?? "Enter The Vault"}
            </h1>
          </MaskRise>

          {section.subtitle && (
            <MaskRise mode="mount" delay={0.18} as="p" className="mt-8">
              <span className="block max-w-md text-lg text-muted-foreground">
                {section.subtitle}
              </span>
            </MaskRise>
          )}

          <FadeIn delay={0.18}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
              {section.ctaLabel && section.ctaUrl && (
                <Magnetic>
                  <Button asChild size="lg">
                    <Link href={section.ctaUrl}>{section.ctaLabel}</Link>
                  </Button>
                </Magnetic>
              )}
              <Link
                href="/discovery-kits"
                className="rounded-sm text-foreground underline overline decoration-foreground/30 underline-offset-4 transition-colors duration-150 ease-premium hover:decoration-foreground"
              >
                Start with samples
              </Link>
            </div>
          </FadeIn>
        </div>

        {media && (
          <FadeIn delay={0.1}>
            <figure className="pb-16 lg:pb-24">
              <ParallaxMedia className="aspect-[4/5] w-full rounded-lg sm:aspect-[16/9]">
                <Image
                  src={media.url}
                  alt={media.altText}
                  fill
                  // The LCP element. Nothing else on the page gets `priority`.
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
