import Link from "next/link";
import type { HomepageSection } from "@/types";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

/**
 * CTABanner — a single directed action, driven entirely by the `cta`
 * metaobject. Renders nothing without a destination: a banner whose button goes
 * nowhere is worse than no banner.
 */
export function CTABanner({ section }: { section: HomepageSection }) {
  if (!section.ctaLabel || !section.ctaUrl) return null;

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-8 rounded-xl border border-border bg-vault-radial px-6 py-14 sm:px-12 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="text-h2 font-semibold tracking-tight text-foreground">
                {section.title}
              </h2>
              {section.subtitle && (
                <p className="mt-4 text-lg text-muted-foreground">
                  {section.subtitle}
                </p>
              )}
            </div>

            <Button asChild size="lg" variant="gold" className="shrink-0">
              <Link href={section.ctaUrl}>{section.ctaLabel}</Link>
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
