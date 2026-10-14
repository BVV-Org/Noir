"use client";

import * as React from "react";
import { m, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { matchScent } from "@/lib/actions/scent-match";
import { QUESTIONS } from "@/lib/scent-match/questions";
import type { Answers, MatchResult } from "@/lib/scent-match/types";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { MaskRise } from "@/components/motion/mask-rise";
import { QuizDeck } from "./quiz-deck";
import { ResultView } from "./result-view";

type Phase = "intro" | "quiz" | "loading" | "result" | "error";

/** The reveal shouldn't flash past — hold the reading state at least this long. */
const MIN_READING_MS = 900;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * ScentMatch — intro → seven questions → reading → result.
 *
 * Answers stay in the browser until the last one; then the `matchScent` Server
 * Action scores them against the in-stock catalogue and returns the bottles.
 */
export function ScentMatch({ pool }: { pool: number }) {
  const [phase, setPhase] = React.useState<Phase>("intro");
  const [result, setResult] = React.useState<MatchResult | null>(null);
  const [answers, setAnswers] = React.useState<Answers | null>(null);
  const topRef = React.useRef<HTMLDivElement>(null);

  const toTop = () => {
    const el = topRef.current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 120;
    if (window.scrollY > y) window.scrollTo({ top: Math.max(0, y) });
  };

  const submit = async (picked: Answers) => {
    setAnswers(picked);
    setPhase("loading");
    toTop();
    const started = Date.now();
    try {
      const res = await matchScent(picked);
      const wait = MIN_READING_MS - (Date.now() - started);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      setResult(res);
      setPhase(res ? "result" : "error");
    } catch {
      setPhase("error");
    }
    toTop();
  };

  const restart = () => {
    setResult(null);
    setAnswers(null);
    setPhase("intro");
    toTop();
  };

  return (
    <div ref={topRef}>
      {phase === "intro" && (
        <Intro pool={pool} onBegin={() => setPhase("quiz")} />
      )}

      {phase === "quiz" && (
        <Container>
          <div className="max-w-4xl py-12 sm:py-16">
            <QuizDeck questions={QUESTIONS} onComplete={submit} />
          </div>
        </Container>
      )}

      {phase === "loading" && <Reading pool={pool} />}

      {phase === "error" && (
        <Container className="py-20 sm:py-28">
          <p className="overline">Scent Match</p>
          <h1 className="mt-6 text-h2 text-foreground">
            We couldn&apos;t read the vault
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            {pool === 0
              ? "Nothing is in stock right now, so there is nothing honest to recommend. Check back soon."
              : "Something went wrong matching your answers. Your answers are kept — try again."}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            {answers && pool > 0 && (
              <Button size="lg" onClick={() => submit(answers)}>
                Try again
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={restart}>
              Start over
            </Button>
          </div>
        </Container>
      )}

      {phase === "result" && result && (
        <ResultView result={result} onRestart={restart} />
      )}
    </div>
  );
}

function Intro({ pool, onBegin }: { pool: number; onBegin: () => void }) {
  return (
    <Container>
      <div className="max-w-4xl py-20 sm:py-28">
        <p className="overline">Scent Match</p>
        <MaskRise mode="mount" className="mt-6">
          <h1 className="text-h1 text-foreground">
            Seven questions. One signature.
          </h1>
        </MaskRise>
        <p className="mt-8 max-w-xl text-lg text-muted-foreground">
          Nothing about notes or accords. Seven small portraits of how you live
          — and the fragrance from the vault that fits them.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-5">
          <Button size="lg" onClick={onBegin} disabled={pool === 0}>
            Begin
            <ArrowRight aria-hidden />
          </Button>
          <p className="overline">
            {pad(QUESTIONS.length)} questions · About a minute ·{" "}
            {pool === 0
              ? "Restocking"
              : `${pool} ${pool === 1 ? "fragrance" : "fragrances"} in stock`}
          </p>
        </div>
      </div>
    </Container>
  );
}

function Reading({ pool }: { pool: number }) {
  const reduce = useReducedMotion();
  return (
    <Container className="py-20 sm:py-28" aria-live="polite">
      <p className="overline">Scent Match</p>
      <h1 className="mt-6 text-h2 text-foreground">Reading your answers</h1>
      <p className="mt-6 overline">
        Matching against {pool} {pool === 1 ? "fragrance" : "fragrances"} in
        stock
      </p>
      <div className="relative mt-10 h-px w-full max-w-xl overflow-hidden bg-foreground/15">
        <m.span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1/3 bg-foreground"
          initial={{ x: "-100%" }}
          animate={reduce ? { x: "0%" } : { x: ["-100%", "300%"] }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 1.2, ease: [0.496, 0.004, 0, 1], repeat: Infinity }
          }
        />
      </div>
    </Container>
  );
}
