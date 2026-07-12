import Image from "next/image";
import Link from "next/link";
import type { JournalArticle } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";

/**
 * JournalCard — an editorial article.
 *
 * The category reads as a small caption above the title, in the card body:
 * the photograph itself carries no overlays. The metadata line is a real
 * `<time>` element with a machine-readable `dateTime`, and reading time is
 * stated in minutes because "5 min read" is the only unit anyone scans for.
 *
 * `featured` renders the same card at editorial scale — taller image, larger
 * title, one more line of excerpt — for the journal preview's lead slot.
 */
export function JournalCard({
  article,
  priority = false,
  featured = false,
  className,
}: {
  article: JournalArticle;
  priority?: boolean;
  featured?: boolean;
  className?: string;
}) {
  const category = article.tags[0];

  return (
    <Card
      as="article"
      interactive
      className={cn("relative flex flex-col overflow-hidden", className)}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-background",
          featured ? "aspect-[16/9] lg:aspect-[4/3]" : "aspect-[16/9]"
        )}
      >
        {article.heroImage && (
          <Image
            src={article.heroImage.url}
            alt={article.heroImage.altText}
            fill
            priority={priority}
            sizes={
              featured
                ? "(min-width: 1024px) 45vw, 90vw"
                : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            }
            className="object-cover transition-transform duration-150 ease-premium group-hover/card:scale-[1.02]"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        {category && <p className="overline">{category}</p>}

        <h3
          className={cn(
            "font-semibold text-foreground",
            featured ? "text-h4" : "text-h5"
          )}
        >
          <Link
            href={`/journal/${article.handle}`}
            className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none"
          >
            {article.title}
          </Link>
        </h3>

        <p
          className={cn(
            "text-small text-muted-foreground",
            featured ? "line-clamp-3" : "line-clamp-2"
          )}
        >
          {article.excerpt}
        </p>

        <p className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-caption text-muted-foreground">
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
          {article.readingTime && (
            <>
              <span aria-hidden>·</span>
              <span>{article.readingTime} min read</span>
            </>
          )}
        </p>
      </div>
    </Card>
  );
}
