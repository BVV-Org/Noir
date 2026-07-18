"use client";

import * as React from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Minus } from "lucide-react";
import { EASE } from "@/lib/animations/config";
import { cn } from "@/lib/utils";

/**
 * RelationshipExplanation — the engine's own words.
 *
 * "Why it matches" is always open as bullets; the honest differences are
 * collapsed behind a disclosure. Differences are the part a shopper is most
 * tempted to skip, so they get a real control rather than being buried: the
 * count is on the summary, so the trade-off is visible before you expand.
 *
 * Native <button> + aria-expanded rather than a custom widget — this has to work
 * from the keyboard and be announced correctly.
 */
export function RelationshipExplanation({
  whyItMatches,
  differences,
  className,
}: {
  whyItMatches: string[];
  differences: string[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const panelId = React.useId();

  if (whyItMatches.length === 0 && differences.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {whyItMatches.length > 0 && (
        <div>
          <h4 className="mb-3 font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground">
            Why it matches
          </h4>
          <ul className="space-y-2">
            {whyItMatches.map((why) => (
              <li key={why} className="flex gap-2.5 text-sm leading-relaxed">
                <Check
                  className="mt-0.5 size-3.5 shrink-0 text-foreground"
                  aria-hidden
                />
                {why}
              </li>
            ))}
          </ul>
        </div>
      )}

      {differences.length > 0 && (
        <div className="border-t border-border/60 pt-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            className="flex w-full items-center justify-between gap-3 text-left font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>
              Honest differences
              <span className="ml-2 tabular-nums text-foreground/60">
                {differences.length}
              </span>
            </span>
            <ChevronDown
              aria-hidden
              className={cn(
                "size-4 shrink-0 transition-transform duration-200 ease-premium",
                open && "rotate-180"
              )}
            />
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <m.div
                id={panelId}
                key="panel"
                initial={reduce ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={reduce ? undefined : { height: 0, opacity: 0 }}
                transition={{ duration: 0.24, ease: EASE.settle }}
                className="overflow-hidden"
              >
                <ul className="space-y-2 pt-3">
                  {differences.map((diff) => (
                    <li
                      key={diff}
                      className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                    >
                      <Minus className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                      {diff}
                    </li>
                  ))}
                </ul>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
