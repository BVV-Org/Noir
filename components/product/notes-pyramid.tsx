import type { ProductNotes } from "@/types";
import { Reveal } from "@/components/motion/reveal";

/**
 * NotesPyramid — top, heart, base.
 *
 * A description list, because that is what this is: three terms, each with a
 * set of values. The tiers are ordered by volatility (what you smell first to
 * what remains), and the left rule thickens down the pyramid to encode that the
 * base is what persists — the one piece of ornament, and it carries meaning.
 */
const TIERS = [
  { key: "top", label: "Top", hint: "First 15 minutes", rule: "border-l" },
  {
    key: "heart",
    label: "Heart",
    hint: "30 minutes to 2 hours",
    rule: "border-l-2",
  },
  {
    key: "base",
    label: "Base",
    hint: "Six hours and beyond",
    rule: "border-l-4",
  },
] as const;

export function NotesPyramid({ notes }: { notes: ProductNotes }) {
  return (
    <section aria-labelledby="notes-heading">
      <h2 id="notes-heading" className="text-h4 font-semibold">
        The pyramid
      </h2>

      <dl className="mt-8 flex flex-col gap-8">
        {TIERS.map((tier) => {
          const values = notes[tier.key];
          if (values.length === 0) return null;

          return (
            <Reveal key={tier.key}>
              <div className={`${tier.rule} border-primary/40 pl-6`}>
                <dt className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-display text-h6 font-semibold text-foreground">
                    {tier.label}
                  </span>
                  <span className="text-caption text-muted-foreground">
                    {tier.hint}
                  </span>
                </dt>
                <dd className="mt-2 text-lg text-muted-foreground">
                  {values.join(" · ")}
                </dd>
              </div>
            </Reveal>
          );
        })}
      </dl>
    </section>
  );
}
