"use client";

import { cn } from "@/lib/utils";
import type { RelationshipCardVM } from "@/types/relationships";
import { RelationshipCard } from "@/components/relationships/relationship-card";

/**
 * RelationshipGrid — a stack of relationship cards.
 *
 * Single column by design: each card carries a full breakdown, so side-by-side
 * would force the reasoning into an unreadable width. The rhythm matches the
 * rest of the site's stacked sections.
 */
export function RelationshipGrid({
  cards,
  onExplore,
  className,
}: {
  cards: RelationshipCardVM[];
  onExplore?: (fragranceId: string, label: string) => void;
  className?: string;
}) {
  if (cards.length === 0) return null;
  return (
    <div className={cn("space-y-6", className)}>
      {cards.map((card) => (
        <RelationshipCard
          key={card.relationshipId}
          card={card}
          onExplore={onExplore}
        />
      ))}
    </div>
  );
}
