import type { HomepageSection, JournalArticle } from "@/types";
import { Section } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { JournalCard } from "@/components/commerce/journal-card";

/** JournalPreview — the three most recent articles. */
export function JournalPreview({
  section,
  articles,
}: {
  section: HomepageSection;
  articles: JournalArticle[];
}) {
  if (articles.length === 0) return null;

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
      <Stagger
        as="ul"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {articles.map((article) => (
          <StaggerItem as="li" key={article.id} className="flex">
            <JournalCard article={article} className="w-full" />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
