import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { JournalArticle, Product } from "@/types";
import { getProvider } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ProductGrid } from "@/components/commerce/product-grid";
import { JournalCard } from "@/components/commerce/journal-card";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { articleJsonLd } from "@/lib/seo/jsonld";

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await getProvider().getJournalArticles();
  return articles.map((article) => ({ handle: article.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const article = await getProvider().getJournalArticleByHandle(handle);
  if (!article) return buildMetadata({ title: "Not found", noIndex: true });

  return buildMetadata({
    title: article.seo?.title ?? article.title,
    description: article.seo?.description ?? article.excerpt,
    path: `/journal/${article.handle}`,
    image: article.seo?.ogImage ?? article.heroImage?.url,
    type: "article",
    publishedTime: article.publishedAt,
    authors: article.author ? [article.author.name] : undefined,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const provider = getProvider();
  const article = await provider.getJournalArticleByHandle(handle);

  if (!article) notFound();

  const [fragrances, relatedArticles] = await Promise.all([
    Promise.all(
      article.relatedFragranceHandles.map((h) => provider.getProductByHandle(h))
    ).then((list) => list.filter((p): p is Product => Boolean(p))),
    Promise.all(
      article.relatedArticleHandles.map((h) =>
        provider.getJournalArticleByHandle(h)
      )
    ).then((list) => list.filter((a): a is JournalArticle => Boolean(a))),
  ]);

  return (
    <>
      <JsonLd data={articleJsonLd(article, `/journal/${article.handle}`)} />

      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Journal", href: "/journal" },
            { label: article.title },
          ]}
        />
      </Container>

      <article>
        <Container className="py-10 sm:py-14">
          <header className="mx-auto max-w-3xl text-center">
            {article.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className="mt-6 text-h1 font-semibold tracking-tight text-foreground">
              {article.title}
            </h1>

            <p className="mt-6 text-lg text-muted-foreground">
              {article.excerpt}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-caption text-muted-foreground">
              {article.author?.avatar && (
                <Image
                  src={article.author.avatar.url}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              {article.author && (
                <span className="text-foreground">{article.author.name}</span>
              )}
              {article.author?.role && (
                <>
                  <span aria-hidden>·</span>
                  <span>{article.author.role}</span>
                </>
              )}
              <span aria-hidden>·</span>
              <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
              {article.readingTime && (
                <>
                  <span aria-hidden>·</span>
                  <span>{article.readingTime} min read</span>
                </>
              )}
            </div>
          </header>

          {article.heroImage && (
            <div className="relative mt-14 aspect-[16/9] overflow-hidden rounded-lg border border-border">
              <Image
                src={article.heroImage.url}
                alt={article.heroImage.altText}
                fill
                priority
                sizes="(min-width: 1280px) 1100px, 100vw"
                className="object-cover"
              />
            </div>
          )}

          {article.bodyHtml && (
            /*
             * The body is Shopify `rich_text`, authored by the store's own
             * editors and returned pre-rendered by the Storefront API. It is
             * first-party content from an authenticated Admin surface, not
             * visitor input, so it is injected as HTML. If article bodies ever
             * accept untrusted input, sanitize here before rendering.
             */
            <div
              className="mx-auto mt-16 max-w-2xl text-base text-muted-foreground [&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-h4 [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_p]:mb-6 [&_p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
            />
          )}
        </Container>
      </article>

      {fragrances.length > 0 && (
        <Section
          eyebrow="Mentioned above"
          title="Fragrances in this article"
          spacing="sm"
        >
          <ProductGrid products={fragrances} />
        </Section>
      )}

      {relatedArticles.length > 0 && (
        <Section eyebrow="Keep reading" title="Related articles" spacing="sm">
          <Stagger
            as="ul"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {relatedArticles.map((related) => (
              <StaggerItem as="li" key={related.id} className="flex">
                <JournalCard article={related} className="w-full" />
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      )}
    </>
  );
}
