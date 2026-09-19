import type { HomepageSection, JournalArticle } from "@/types";
import { Section } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { JournalCard } from "@/components/commerce/journal-card";

/**
 * JournalPreview — the three most recent articles, set editorially: the
 * newest leads at double height, the other two stack beside it. A third
 * uniform three-column grid on the homepage would blur into the kits strip
 * above it; a lead story gives the section its own shape.
 */
export function JournalPreview({
  section,
  articles,
}: {
  section: HomepageSection;
  articles: JournalArticle[];
}) {
  const [lead, ...rest] = articles;
  if (!lead) return null;

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
      <Stagger as="ul" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StaggerItem
          as="li"
          className={rest.length > 0 ? "flex lg:row-span-2" : "flex"}
        >
          <JournalCard article={lead} featured className="w-full" />
        </StaggerItem>
        {rest.map((article) => (
          <StaggerItem as="li" key={article.id} className="flex">
            <JournalCard article={article} className="w-full" />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
