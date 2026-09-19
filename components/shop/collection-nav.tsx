import Link from "next/link";
import type { Collection } from "@/types";
import { cn } from "@/lib/utils";

/**
 * CollectionNav — lateral movement between curated views of the catalogue.
 *
 * A horizontal scroller on small screens rather than a wrapping pile of pills.
 * The list is scrollable with the keyboard because it is a real `<ul>` of
 * links; `snap-x` just makes the flick land somewhere sensible.
 */
export function CollectionNav({
  collections,
  activeHandle,
  className,
}: {
  collections: Collection[];
  activeHandle?: string;
  className?: string;
}) {
  if (collections.length === 0) return null;

  return (
    <nav aria-label="Collections" className={cn("w-full", className)}>
      <ul className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
        <li className="snap-start">
          <Link
            href="/shop"
            aria-current={activeHandle ? undefined : "page"}
            className={cn(
              "inline-flex min-h-11 items-center whitespace-nowrap rounded-full border px-4 text-small transition-colors duration-150 ease-premium",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              activeHandle
                ? "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                : "border-primary bg-primary/10 text-primary"
            )}
          >
            All fragrances
          </Link>
        </li>

        {collections.map((collection) => {
          const active = collection.handle === activeHandle;
          return (
            <li key={collection.id} className="snap-start">
              <Link
                href={`/collections/${collection.handle}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center whitespace-nowrap rounded-full border px-4 text-small transition-colors duration-150 ease-premium",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                )}
              >
                {collection.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
