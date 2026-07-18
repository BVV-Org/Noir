"use client";

import { m, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/animations/config";
import { cn } from "@/lib/utils";
import type { RelationshipSectionVM } from "@/types/relationships";
import { RelationshipGrid } from "@/components/relationships/relationship-grid";

/**
 * RelationshipSection — a titled group of relationships of one type.
 *
 * The title and blurb come from the registry via the section's presentation, so
 * this renders whatever the engine returned without knowing the type names. The
 * count is surfaced because "Verified Matches 4" is the answer people came for.
 */
export function RelationshipSection({
  section,
  onExplore,
  className,
}: {
  section: RelationshipSectionVM;
  onExplore?: (fragranceId: string, label: string) => void;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { presentation, cards } = section;
  if (cards.length === 0) return null;

  return (
    <section className={cn("space-y-5", className)}>
      <m.header
        initial={reduce ? false : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -40px 0px" }}
        transition={{ duration: 0.45, ease: EASE.signature }}
        className="max-w-2xl"
      >
        <div className="flex items-baseline gap-3">
          <h2 className="text-h3">{presentation.sectionTitle}</h2>
          <span className="font-mono text-caption tabular-nums text-muted-foreground">
            {cards.length}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {presentation.blurb}
        </p>
      </m.header>

      <RelationshipGrid cards={cards} onExplore={onExplore} />
    </section>
  );
}
