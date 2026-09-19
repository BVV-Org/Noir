import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * DupeComparisonCta — the PDP's bridge to the Dupe Finder, the storefront's
 * signature tool.
 *
 * When the product is positioned as a dupe of one or more designer/niche
 * fragrances (`noir.dupe_of`), it deep-links into the Dupe Finder comparison for
 * the first target — `/dupe-finder?q=…`, which the finder resolves and opens on
 * arrival. When no target is set, it still surfaces the tool with a generic
 * entry point so the comparison is always reachable from the product page.
 */
export function DupeComparisonCta({ dupeOf }: { dupeOf?: string[] }) {
  const targets = (dupeOf ?? []).filter((t) => t.trim().length > 0);
  const primary = targets[0];
  const href = primary
    ? `/dupe-finder?q=${encodeURIComponent(primary)}`
    : "/dupe-finder";

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="overline text-muted-foreground">Dupe Finder</p>
      <p className="mt-2 text-base text-foreground">
        {primary ? (
          <>
            Built as a take on{" "}
            <span className="font-semibold">{formatList(targets)}</span>. See the
            side-by-side breakdown — similarity, performance, and price.
          </>
        ) : (
          "Compare this scent against the originals it was built to rival."
        )}
      </p>
      <Button asChild variant="outline" size="sm" className="mt-4">
        <Link href={href}>
          {primary ? "See the comparison" : "Open the Dupe Finder"}
          <ArrowRight aria-hidden />
        </Link>
      </Button>
    </div>
  );
}

/** Join for display: "A", "A and B", or "A, B and C". */
function formatList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
