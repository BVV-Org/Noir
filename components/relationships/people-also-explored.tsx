"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/animations/config";
import { cn } from "@/lib/utils";
import type { RelationshipCardVM } from "@/types/relationships";
import { FragranceImage } from "@/components/relationships/fragrance-image";
import { RelationshipBadge } from "@/components/relationships/badges";

/**
 * PeopleAlsoExplored — reverse discovery, straight off the Relationship Engine.
 *
 * These are every fragrance connected to this one by an edge in either
 * direction, de-duplicated and ranked by the engine's similarity. Nothing is
 * random and nothing is hand-picked: if it shows up here, the KB drew the line.
 *
 * A compact tile rail rather than full cards — this is a "where next" prompt,
 * not the main comparison.
 */
export function PeopleAlsoExplored({
  cards,
  onExplore,
  className,
}: {
  cards: RelationshipCardVM[];
  /** Explore in place; when omitted the tiles link to the relationship page. */
  onExplore?: (fragranceId: string, label: string) => void;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (cards.length === 0) return null;

  return (
    <section className={cn("space-y-5", className)}>
      <header className="max-w-2xl">
        <h2 className="text-h3">People also explored</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Drawn from the relationship engine — fragrances the knowledge base
          actually connects to this one.
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((card, i) => {
          const label = `${card.fragrance.brand} ${card.fragrance.name}`;
          const inner = (
            <>
              <FragranceImage
                image={card.image}
                sizes="(min-width: 640px) 12rem, 40vw"
                className="aspect-[4/5] w-full"
              />
              <div className="mt-3 space-y-1.5">
                <RelationshipBadge
                  presentation={card.presentation}
                  verified={card.verified}
                />
                <p className="truncate font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground">
                  {card.fragrance.brand}
                </p>
                <h3 className="truncate text-base leading-tight">
                  {card.fragrance.name}
                </h3>
                {card.overallSimilarity != null && (
                  <p className="font-mono text-caption tabular-nums text-gold">
                    {card.overallSimilarity}%{" "}
                    <span className="text-muted-foreground">similarity</span>
                  </p>
                )}
              </div>
            </>
          );

          return (
            <m.li
              key={card.relationshipId}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -40px 0px" }}
              transition={{
                duration: 0.45,
                ease: EASE.signature,
                delay: reduce ? 0 : i * 0.04,
              }}
            >
              {onExplore ? (
                <button
                  type="button"
                  onClick={() => onExplore(card.fragrance.id, label)}
                  aria-label={`Explore ${label}`}
                  className="w-full rounded-lg text-left transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {inner}
                </button>
              ) : (
                <Link
                  href={`/dupe-finder?f=${encodeURIComponent(card.fragrance.id)}`}
                  aria-label={`Explore ${label}`}
                  className="block rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {inner}
                </Link>
              )}
            </m.li>
          );
        })}
      </ul>
    </section>
  );
}
