import type { Classification } from "@/types";
import { RARITY_LABELS } from "@/lib/config/site";
import { RarityBadge } from "@/components/ui/badge";

/**
 * ClassificationPanel — the `nv` classification metafields, as a definition list.
 *
 * Every row is optional in Shopify, so every row is conditional here. An empty
 * row would tell the reader that the vault does not know, which is worse than
 * not raising the question.
 */
export function ClassificationPanel({
  classification,
  releaseYear,
}: {
  classification: Classification;
  releaseYear?: number;
}) {
  const rows: { term: string; value: React.ReactNode }[] = [];

  if (classification.fragranceFamily) {
    rows.push({ term: "Family", value: classification.fragranceFamily });
  }
  if (classification.dna) rows.push({ term: "DNA", value: classification.dna });
  if (classification.class) {
    rows.push({ term: "Class", value: classification.class });
  }
  if (classification.season?.length) {
    rows.push({ term: "Season", value: classification.season.join(", ") });
  }
  if (classification.occasion?.length) {
    rows.push({ term: "Occasion", value: classification.occasion.join(", ") });
  }
  if (classification.mood?.length) {
    rows.push({ term: "Mood", value: classification.mood.join(", ") });
  }
  if (releaseYear) rows.push({ term: "Released", value: String(releaseYear) });
  if (classification.rarity) {
    rows.push({
      term: "Rarity",
      value: (
        <RarityBadge
          rarity={classification.rarity}
          label={RARITY_LABELS[classification.rarity]}
        />
      ),
    });
  }

  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="classification-heading">
      <h2 id="classification-heading" className="text-h4 font-semibold">
        Classification
      </h2>

      <dl className="mt-8 divide-y divide-border border-y border-border">
        {rows.map((row) => (
          <div
            key={row.term}
            className="flex items-center justify-between gap-6 py-4"
          >
            <dt className="overline">{row.term}</dt>
            <dd className="text-right text-small text-foreground">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
