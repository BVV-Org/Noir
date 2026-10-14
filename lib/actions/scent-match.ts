"use server";

import { QUESTIONS } from "@/lib/scent-match/questions";
import { computeMatch, resolveAnswers } from "@/lib/scent-match/engine";
import {
  getCollectionsWithMembers,
  getSellableProducts,
} from "@/lib/scent-match/server";
import type { Answers, MatchResult } from "@/lib/scent-match/types";

/**
 * Server Action behind the Scent Match quiz.
 *
 * The browser sends only the seven chosen answer ids. The catalogue is read and
 * scored here, so the Storefront token stays server-side and the page never
 * ships the catalogue — only the six bottles it recommends come back, as the
 * same normalized `Product` the rest of the storefront renders.
 */
export async function matchScent(
  answers: Answers
): Promise<MatchResult | null> {
  // A Server Action is a public endpoint: accept only known question/answer ids
  // and require a complete set.
  const clean: Answers = {};
  if (answers && typeof answers === "object") {
    for (const q of QUESTIONS) {
      const id = (answers as Record<string, unknown>)[q.id];
      if (typeof id === "string" && q.options.some((o) => o.id === id)) {
        clean[q.id] = id;
      }
    }
  }
  const options = resolveAnswers(clean);
  if (options.length !== QUESTIONS.length) return null;

  const [products, collections] = await Promise.all([
    getSellableProducts(),
    getCollectionsWithMembers(),
  ]);

  return computeMatch(options, products, collections);
}
