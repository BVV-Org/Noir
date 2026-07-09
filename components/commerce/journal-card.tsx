import Image from "next/image";
import Link from "next/link";
import type { JournalArticle } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * JournalCard — an editorial article.
 *
 * The metadata line is a real `<time>` element with a machine-readable
 * `dateTime`, and reading time is stated in minutes because "5 min read" is the
 * only unit anyone scans for. Category tags come from the metaobject's tag list
 * and double as the journal index's filter axis.
 */
export function JournalCard({
  article,
  priority = false,
  className,
}: {
  article: JournalArticle;
  priority?: boolean;
  className?: string;
}) {
  const category = article.tags[0];

  return (
    <Card
      as="article"
      interactive
      className={cn("relative flex flex-col overflow-hidden", className)}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-background">
        {article.heroImage && (
          <Image
            src={article.heroImage.url}
            alt={article.heroImage.altText}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-150 ease-premium group-hover/card:scale-[1.02]"
          />
        )}
        {category && (
          <Badge
            variant="outline"
            className="absolute left-3 top-3 bg-background/70 backdrop-blur-sm"
          >
            {category}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="text-h5 font-semibold tracking-tight text-foreground">
          <Link
            href={`/journal/${article.handle}`}
            className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none"
          >
            {article.title}
          </Link>
        </h3>

        <p className="line-clamp-2 text-small text-muted-foreground">
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
