import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Breadcrumbs — where you are, and the way back up.
 *
 * An ordered list inside a labelled `nav`, which is the pattern assistive tech
 * expects. The final crumb is the current page: it is not a link, and it carries
 * `aria-current="page"`. Separators are decorative and hidden.
 */
export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("w-full", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-caption text-muted-foreground">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="rounded-sm transition-colors duration-150 ease-premium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className="text-foreground"
                >
                  {item.label}
                </span>
              )}
              {!last && (
                <ChevronRight aria-hidden className="size-3.5 shrink-0" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
