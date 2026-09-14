import Link from "next/link";
import type { HomepageSection } from "@/types";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ClipReveal } from "@/components/motion/clip-reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { WordReveal } from "@/components/motion/word-reveal";

/**
 * CTABanner — a single directed action, driven entirely by the `cta`
 * metaobject. Renders nothing without a destination: a banner whose button
 * goes nowhere is worse than no banner.
 *
 * The one full-inversion moment on the page: an ink plate that a muted sheet
 * wipes off as it scrolls in, with the headline landing word by word. The
 * button is the paper pill on ink and leans toward the cursor on hover devices.
 */
export function CTABanner({ section }: { section: HomepageSection }) {
  if (!section.ctaLabel || !section.ctaUrl) return null;

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <ClipReveal className="rounded-xl">
          <div className="flex flex-col items-start justify-between gap-10 rounded-xl bg-primary px-6 py-16 text-primary-foreground sm:px-12 sm:py-20 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <WordReveal
                as="h2"
                className="text-h2 text-primary-foreground"
                text={section.title ?? ""}
              />
              {section.subtitle && (
                <p className="mt-5 max-w-xl text-lg text-primary-foreground/60">
                  {section.subtitle}
                </p>
              )}
            </div>

            <Magnetic className="shrink-0">
              <Button
                asChild
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <Link href={section.ctaUrl}>{section.ctaLabel}</Link>
              </Button>
            </Magnetic>
          </div>
        </ClipReveal>
      </Container>
    </section>
  );
}
