import Image from "next/image";
import Link from "next/link";
import type { HomepageSection, Product } from "@/types";
import { RARITY_LABELS } from "@/lib/config/site";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { RarityBadge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion/fade-in";

/**
 * Hero — the homepage thesis.
 *
 * The claim the brand makes is that a fragrance is a decision, and that some are
 * rare. So the hero does not open with a product grid or a discount: it opens
 * with a single bottle at the top of the rarity scale, named and tiered. The
 * `vault-radial` token throws a faint light from above, which is the only
 * ornament on the page.
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
    <section className="relative overflow-hidden bg-vault-radial">
      <Container>
        <div className="grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:py-32">
          <div>
            <FadeIn>
              <p className="overline">The Vault</p>
            </FadeIn>

            <FadeIn delay={0.06}>
              <h1 className="mt-6 text-display font-semibold text-foreground">
                {section.title ?? "Enter The Vault"}
              </h1>
            </FadeIn>

            {section.subtitle && (
              <FadeIn delay={0.12}>
                <p className="mt-6 max-w-md text-lg text-muted-foreground">
                  {section.subtitle}
                </p>
              </FadeIn>
            )}

            <FadeIn delay={0.18}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                {section.ctaLabel && section.ctaUrl && (
                  <Button asChild size="lg">
                    <Link href={section.ctaUrl}>{section.ctaLabel}</Link>
                  </Button>
                )}
                <Button asChild size="lg" variant="outline">
                  <Link href="/discovery-kits">Start with samples</Link>
                </Button>
              </div>
            </FadeIn>
          </div>

          {media && (
            <FadeIn delay={0.1} className="relative">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-xl border border-border">
                <Image
                  src={media.url}
                  alt={media.altText}
                  fill
                  // The LCP element. Nothing else on the page gets `priority`.
                  priority
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />
              </div>

              {product && (
                <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-md items-end justify-between gap-4 p-6">
                  <div className="min-w-0">
                    {product.brand && (
                      <p className="overline">{product.brand}</p>
                    )}
                    <p className="mt-2 font-display text-h5 font-semibold tracking-tight text-foreground">
                      <Link
                        href={`/products/${product.handle}`}
                        className="rounded-sm hover:text-primary"
                      >
                        {product.title}
                      </Link>
                    </p>
                  </div>
                  {rarity && (
                    <RarityBadge
                      rarity={rarity}
                      label={RARITY_LABELS[rarity]}
                      className="shrink-0 bg-background/80 backdrop-blur-sm"
                    />
                  )}
                </div>
              )}
            </FadeIn>
          )}
        </div>
      </Container>
    </section>
  );
}
