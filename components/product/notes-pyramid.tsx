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
  { key: "top", label: "Top", hint: "First 15 minutes", weight: 1 },
  { key: "heart", label: "Heart", hint: "30 minutes to 2 hours", weight: 2 },
  { key: "base", label: "Base", hint: "Six hours and beyond", weight: 3 },
] as const;

export function NotesPyramid({ notes }: { notes: ProductNotes }) {
  const tiers = TIERS.filter((tier) => notes[tier.key].length > 0);
  if (tiers.length === 0) return null;

  return (
    <section aria-labelledby="notes-heading">
      <h2 id="notes-heading" className="text-h4 font-semibold">
        The pyramid
      </h2>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        {tiers.map((tier) => (
          <Reveal key={tier.key}>
            <div className="h-full rounded-lg bg-surface p-5 ring-1 ring-inset ring-border">
              <dt>
                <span className="flex items-center gap-2">
                  {/* Three stacked bars fill toward the base: the pyramid's
                      "what lasts longest" encoded without a diagram. */}
                  <span aria-hidden className="flex items-end gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={
                          i <= tier.weight
                            ? "w-1 rounded-full bg-foreground"
                            : "w-1 rounded-full bg-border"
                        }
                        style={{ height: `${4 + i * 3}px` }}
                      />
                    ))}
                  </span>
                  <span className="text-small font-semibold text-foreground">
                    {tier.label}
                  </span>
                </span>
                <span className="mt-1 block text-caption text-muted-foreground">
                  {tier.hint}
                </span>
              </dt>
              <dd className="mt-4 flex flex-wrap gap-1.5">
                {notes[tier.key].map((note) => (
                  <span
                    key={note}
                    className="rounded-full border border-border bg-background px-2.5 py-1 text-caption font-medium text-foreground"
                  >
                    {note}
                  </span>
                ))}
              </dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
