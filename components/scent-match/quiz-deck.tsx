"use client";

import * as React from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EASE } from "@/lib/animations/config";
import { cn } from "@/lib/utils";
import type { Answers, Question } from "@/lib/scent-match/types";

/** How long the chosen row holds its ink before the card wipes away. */
const CONFIRM_MS = 160;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * QuizDeck — one question per card.
 *
 * Choosing an answer inks the row, then the card wipes off to the left and the
 * next wipes in from the right (Back reverses both). The wipe is a clip-path,
 * not a fade — the site's motion language: a clip says the frame moved.
 *
 * Keyboard: 1–5 answer, ← or Backspace goes back.
 */
export function QuizDeck({
  questions,
  onComplete,
}: {
  questions: Question[];
  onComplete: (answers: Answers) => void;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [answers, setAnswers] = React.useState<Answers>({});
  const [picked, setPicked] = React.useState<string | null>(null);
  // Blocks a second answer while the first is confirming / the card is leaving.
  const locked = React.useRef(false);

  const total = questions.length;
  const question = questions[index];
  // The outgoing card stays mounted (and clickable) while it wipes away; its
  // handler compares against this to recognise itself as stale.
  const activeId = React.useRef(question?.id);
  activeId.current = question?.id;

  React.useEffect(() => {
    locked.current = false;
    setPicked(null);
  }, [index]);

  const choose = React.useCallback(
    (optionId: string) => {
      if (!question || locked.current) return;
      if (question.id !== activeId.current) return;
      locked.current = true;
      setPicked(optionId);
      const next = { ...answers, [question.id]: optionId };

      window.setTimeout(
        () => {
          setAnswers(next);
          if (index + 1 >= total) {
            onComplete(next);
            return;
          }
          setDirection(1);
          setIndex((i) => i + 1);
        },
        reduce ? 0 : CONFIRM_MS
      );
    },
    [answers, index, onComplete, question, reduce, total]
  );

  const back = React.useCallback(() => {
    if (index === 0 || locked.current) return;
    setDirection(-1);
    setIndex((i) => i - 1);
  }, [index]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      const n = Number.parseInt(e.key, 10);
      if (question && n >= 1 && n <= question.options.length) {
        const option = question.options[n - 1];
        if (option) {
          e.preventDefault();
          choose(option.id);
        }
      } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [back, choose, question]);

  if (!question) return null;

  // Enter from the side we're travelling toward; leave toward the other.
  const enter =
    direction === 1 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)";
  const leave =
    direction === 1 ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)";
  const shift = reduce ? 0 : 32;

  return (
    <div>
      {/* Telemetry row */}
      <div className="flex items-baseline justify-between gap-6">
        <p className="overline">Scent Match</p>
        <p className="tabular-nums text-foreground overline">
          {pad(index + 1)} / {pad(total)}
        </p>
      </div>

      {/* Progress — one segment per question */}
      <ol
        aria-label={`Question ${index + 1} of ${total}`}
        className="mt-4 grid gap-1"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
      >
        {questions.map((q, i) => (
          <li
            key={q.id}
            className={cn(
              "h-0.5 transition-colors duration-300 ease-premium",
              i <= index ? "bg-foreground" : "bg-foreground/15"
            )}
          />
        ))}
      </ol>

      <div className="relative mt-12 sm:mt-16">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <m.div
            key={question.id}
            initial={{ clipPath: enter, x: direction * shift }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)", x: 0 }}
            exit={{ clipPath: leave, x: -direction * shift }}
            transition={{ duration: reduce ? 0 : 0.6, ease: EASE.signature }}
          >
            <h2 className="max-w-3xl text-[clamp(2.25rem,5vw,4.25rem)] leading-[0.98] text-foreground">
              {question.prompt}
            </h2>

            <ol className="mt-10 divide-y divide-border border-y border-border sm:mt-12">
              {question.options.map((option, i) => {
                const active = picked === option.id;
                const chosenBefore = answers[question.id] === option.id;
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => choose(option.id)}
                      aria-pressed={active || chosenBefore}
                      className={cn(
                        "group grid w-full grid-cols-[2.75rem_1fr_auto] items-center gap-4 px-3 py-5 text-left sm:grid-cols-[3.5rem_1fr_auto] sm:px-4 sm:py-6",
                        "transition-colors duration-150 ease-premium",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring focus-visible:ring-offset-0",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-primary hover:text-primary-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "font-mono text-overline tabular-nums",
                          active
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground group-hover:text-primary-foreground/70"
                        )}
                      >
                        {pad(i + 1)}
                      </span>
                      <span className="text-lg sm:text-xl">
                        {option.label}
                        {chosenBefore && !active && (
                          <span className="ml-3 align-middle font-mono text-overline uppercase text-muted-foreground group-hover:text-primary-foreground/70">
                            Your answer
                          </span>
                        )}
                      </span>
                      <ArrowRight
                        aria-hidden
                        className={cn(
                          "size-5 transition-transform duration-150 ease-premium",
                          active
                            ? "translate-x-1"
                            : "text-muted-foreground group-hover:translate-x-1 group-hover:text-primary-foreground"
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ol>
          </m.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between gap-6">
        <button
          type="button"
          onClick={back}
          disabled={index === 0}
          className="inline-flex items-center gap-2 font-mono text-overline uppercase text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        >
          <ArrowLeft aria-hidden className="size-3.5" />
          Back
        </button>
        <p className="hidden overline sm:block">
          Press 1–{question.options.length} to answer
        </p>
      </div>
    </div>
  );
}
