"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { RARITY_LABELS } from "@/lib/config/site";
import { formatMoney } from "@/lib/utils";
import {
  FACET_LABELS,
  MOOD_LABELS,
  type MatchResult,
} from "@/lib/scent-match/types";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { RarityBadge } from "@/components/ui/badge";
import { MaskRise } from "@/components/motion/mask-rise";
import { Reveal } from "@/components/motion/reveal";
import { ProductCard } from "@/components/commerce/product-card";
import { CollectionCard } from "@/components/commerce/collection-card";
import { SimilarityRing } from "./similarity-ring";

const SEASON_LABELS = {
  spring: "Spring",
  summer: "Summer",
  autumn: "Autumn",
  winter: "Winter",
} as const;

const COUNT_WORDS: Record<number, string> = {
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
};

/**
 * ResultView — the profile, then the bottles.
 *
 * Every product here came back from the in-stock catalogue, and every card is
 * the storefront's own ProductCard / CollectionCard, so a recommendation looks
 * and behaves exactly like the same bottle anywhere else on the site.
 */
export function ResultView({
  result,
  onRestart,
}: {
  result: MatchResult;
  onRestart: () => void;
}) {
  const { archetype, spec, facets, topPick, more, collection, pool } = result;
  const pick = topPick.product;
  const cover = pick.images[0];
  const rarity = pick.classification.rarity;
  const inspiredBy = (pick.dupeOf ?? []).filter((d) => d.trim());

  const specRows: [string, string][] = [
    ["Direction", spec.direction.map((f) => FACET_LABELS[f]).join(", ")],
    ["Mood", spec.moods.map((m) => MOOD_LABELS[m]).join(", ")],
    ["Hours", spec.hours],
    ["Season", spec.seasons.map((s) => SEASON_LABELS[s]).join(", ")],
    ["Presence", spec.presence],
  ];

  const pyramid: [string, string[]][] = [
    ["Top", pick.notes.top],
    ["Heart", pick.notes.heart],
    ["Base", pick.notes.base],
  ];

  return (
    <>
      {/* Profile */}
      <Container>
        <div className="grid gap-12 py-16 sm:py-24 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="overline">Your profile</p>
            <MaskRise mode="mount" className="mt-6">
              <h1 className="text-h1 text-foreground">{archetype.name}</h1>
            </MaskRise>
            <p className="mt-8 text-lg text-foreground">{archetype.tagline}</p>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              {archetype.description}
            </p>
          </div>

          <div className="lg:col-span-5 lg:pt-10">
            <dl className="divide-y divide-border border-y border-border">
              {specRows
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[7rem_1fr] items-baseline gap-4 py-4"
                  >
                    <dt className="overline">{label}</dt>
                    <dd className="text-base text-foreground">{value}</dd>
                  </div>
                ))}
            </dl>

            {facets.length > 0 && (
              <div className="mt-10">
                <p className="overline">Scent direction</p>
                <ul className="mt-5 space-y-3">
                  {facets.map(({ facet, value }) => (
                    <li
                      key={facet}
                      className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-4"
                    >
                      <span className="font-mono text-overline uppercase text-foreground">
                        {FACET_LABELS[facet]}
                      </span>
                      <span className="relative h-0.5 bg-foreground/15">
                        <span
                          className="absolute inset-y-0 left-0 bg-foreground"
                          style={{ width: `${value}%` }}
                        />
                      </span>
                      <span className="text-right font-mono text-overline tabular-nums text-muted-foreground">
                        {value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Top pick */}
      <Container>
        <div className="rule" />
        <div className="flex flex-wrap items-baseline justify-between gap-4 pt-6">
          <p className="overline">Your top pick</p>
          <p className="overline">
            Matched from {pool} {pool === 1 ? "fragrance" : "fragrances"} in
            stock
          </p>
        </div>

        <Reveal className="grid gap-10 py-10 sm:py-14 lg:grid-cols-12">
          <Link
            href={`/products/${pick.handle}`}
            className="group relative block w-full max-w-[20rem] sm:max-w-sm lg:col-span-5 lg:max-w-none"
            aria-label={pick.title}
          >
            <div className="relative w-full overflow-hidden rounded-lg bg-secondary/40 pt-[125%]">
              {cover && (
                <Image
                  src={cover.url}
                  alt={cover.altText || pick.title}
                  fill
                  sizes="(min-width: 1024px) 38vw, 90vw"
                  className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.03]"
                />
              )}
            </div>
          </Link>

          <div className="flex flex-col lg:col-span-7">
            <div className="flex flex-wrap items-center gap-3">
              {pick.brand && <p className="overline">{pick.brand}</p>}
              {rarity && (
                <RarityBadge rarity={rarity} label={RARITY_LABELS[rarity]} />
              )}
            </div>
            <h2 className="mt-4 text-h2 text-foreground">{pick.title}</h2>
            {pick.classification.dna && (
              <p className="mt-4 text-lg text-muted-foreground">
                {pick.classification.dna}
              </p>
            )}
            {inspiredBy.length > 0 && (
              <p className="mt-3 overline">
                Inspired by {inspiredBy.join(" & ")}
              </p>
            )}

            <dl className="mt-8 divide-y divide-border border-y border-border">
              {pyramid
                .filter(([, notes]) => notes.length > 0)
                .map(([tier, notes]) => (
                  <div
                    key={tier}
                    className="grid grid-cols-[5rem_1fr] items-baseline gap-4 py-3"
                  >
                    <dt className="overline">{tier}</dt>
                    <dd className="text-base text-foreground">
                      {notes.join(" · ")}
                    </dd>
                  </div>
                ))}
            </dl>

            <div className="mt-auto flex flex-wrap items-center gap-x-8 gap-y-6 pt-10">
              <SimilarityRing value={topPick.score} size={112} />
              <div>
                <p className="overline">From</p>
                <p className="mt-1 font-system text-2xl font-bold tabular-nums text-foreground">
                  {formatMoney(pick.price.amount, pick.price.currencyCode)}
                </p>
              </div>
              <Button asChild size="lg" className="sm:ml-auto">
                <Link href={`/products/${pick.handle}`}>
                  View fragrance
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>

      {/* Five more */}
      {more.length > 0 && (
        <Container>
          <div className="rule" />
          <div className="pt-6">
            <p className="overline">Also in your profile</p>
            <h2 className="mt-4 text-h3 text-foreground">
              {COUNT_WORDS[more.length] ?? more.length} more from the vault
            </h2>
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-12 py-10 sm:grid-cols-3 sm:py-14 lg:grid-cols-5">
            {more.map(({ product, score }) => (
              <Reveal as="li" key={product.handle} className="flex flex-col">
                <ProductCard product={product} />
                <p className="mt-2 tabular-nums overline">{score}% match</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      )}

      {/* Collection */}
      {collection && (
        <Container>
          <div className="rule" />
          <div className="grid gap-8 py-10 sm:py-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4">
              <p className="overline">Keep exploring</p>
              <h2 className="mt-4 text-h3 text-foreground">Your collection</h2>
              <p className="mt-4 max-w-sm text-base text-muted-foreground">
                {collection.matches > 1
                  ? `${collection.matches} of your matches live here.`
                  : collection.matches === 1
                    ? "One of your matches lives here, with more in the same direction."
                    : "The closest direction to your profile in the vault."}
              </p>
            </div>
            <Reveal className="lg:col-span-8">
              <CollectionCard collection={collection.collection} />
            </Reveal>
          </div>
        </Container>
      )}

      {/* Again */}
      <Container>
        <div className="rule" />
        <div className="flex flex-wrap items-center justify-between gap-6 py-10 sm:py-14">
          <Button variant="outline" size="lg" onClick={onRestart}>
            <RotateCcw aria-hidden />
            Retake the quiz
          </Button>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-1.5 text-foreground overline transition-opacity hover:opacity-70"
          >
            Browse the whole vault
            <ArrowRight className="size-3.5 transition-transform duration-150 ease-premium group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Container>
    </>
  );
}
