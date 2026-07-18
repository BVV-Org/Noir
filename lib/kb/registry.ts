import type {
  DupeStatus,
  RelationshipPresentationVM,
  RelationshipType,
} from "@/types/relationships";

/**
 * registry — the single place that maps an engine relationship type onto how the
 * product talks about it.
 *
 * Components never switch on a relationship type; they read the presentation the
 * registry resolves. That keeps the rule "render dynamically from the API": a
 * type the KB starts emitting tomorrow (HYBRID_DNA, or something new entirely)
 * still renders — known types get authored copy, unknown types get a derived
 * label rather than being dropped on the floor.
 *
 * Copy here is *labelling*, not logic. Every number, reason, and difference on
 * screen comes from the engine.
 */
const PRESENTATIONS: Record<string, Omit<RelationshipPresentationVM, "type">> = {
  VERIFIED_CLONE: {
    sectionTitle: "Verified Matches",
    badgeLabel: "Verified Clone",
    blurb:
      "Sourced consensus confirms this is a direct match, built to smell like the original.",
    order: 0,
  },
  INSPIRED_BY: {
    sectionTitle: "Inspired By",
    badgeLabel: "Inspired By",
    blurb:
      "Takes clear direction from another fragrance, but is not intended to be an exact clone.",
    order: 1,
  },
  HYBRID_DNA: {
    sectionTitle: "Closest DNA",
    badgeLabel: "Hybrid DNA",
    blurb:
      "Blends characteristics from more than one fragrance rather than tracking a single reference.",
    order: 2,
  },
  ORIGINAL_DNA: {
    sectionTitle: "Original Composition",
    badgeLabel: "Original DNA",
    blurb: "A composition in its own right — no verified inspiration exists.",
    order: 3,
  },
  SIMILAR_DNA: {
    sectionTitle: "Closest DNA",
    badgeLabel: "Similar DNA",
    blurb: "Shares scent DNA, ranked by how close the profile actually lands.",
    order: 4,
  },
  COMMUNITY_ALTERNATIVE: {
    sectionTitle: "Community Alternatives",
    badgeLabel: "Community Alternative",
    blurb:
      "Explored alongside the same original by the community — a sibling, not a copy.",
    order: 5,
  },
};

/**
 * Which edge direction a section is showing, from the anchor's point of view.
 * `outgoing` = what the anchor derives from. `incoming` = what derives from it.
 */
export type EdgeDirection = "outgoing" | "incoming";

/**
 * Types whose meaning does not depend on direction — "A is similar to B" reads
 * the same either way, so both directions merge into one section. Directional
 * types stay split: "what clones this" and "what this clones" are different
 * questions and must not collapse together.
 */
const SYMMETRIC = new Set<string>(["SIMILAR_DNA", "COMMUNITY_ALTERNATIVE"]);

export function isSymmetric(type: RelationshipType): boolean {
  return SYMMETRIC.has(type);
}

/** Direction-aware titles for the types where direction changes the story. */
const DIRECTIONAL_TITLES: Record<
  string,
  Partial<Record<EdgeDirection, { sectionTitle: string; blurb: string }>>
> = {
  VERIFIED_CLONE: {
    outgoing: {
      sectionTitle: "Verified Match Of",
      blurb:
        "Sourced consensus confirms this fragrance is a direct match for the original below.",
    },
    incoming: {
      sectionTitle: "Verified Matches",
      blurb:
        "Sourced consensus confirms these are direct matches, built to smell like this fragrance.",
    },
  },
  INSPIRED_BY: {
    outgoing: {
      sectionTitle: "Inspired By",
      blurb:
        "Takes clear direction from these, but is not intended to be an exact clone.",
    },
    incoming: {
      sectionTitle: "Inspired This",
      blurb:
        "These take direction from this fragrance without being exact clones.",
    },
  },
};

/**
 * How many cards a section shows. The speculative layer emits a long tail
 * (Aventus alone has 74 SIMILAR_DNA edges); the KB has already ranked them, so
 * showing the strongest slice is presentation, not a judgement. Verified
 * relationships are never truncated — they are the answer people came for.
 */
const SECTION_LIMITS: Record<string, number> = {
  VERIFIED_CLONE: Number.POSITIVE_INFINITY,
  INSPIRED_BY: 8,
  HYBRID_DNA: Number.POSITIVE_INFINITY,
  SIMILAR_DNA: 8,
  COMMUNITY_ALTERNATIVE: 8,
};

export function sectionLimitFor(type: RelationshipType): number {
  return SECTION_LIMITS[type] ?? 8;
}

/** "SOME_NEW_TYPE" → "Some New Type", so an unknown type still reads properly. */
function humanize(type: string): string {
  return type
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function presentationFor(
  type: RelationshipType,
  direction?: EdgeDirection
): RelationshipPresentationVM {
  const known = PRESENTATIONS[type];
  if (known) {
    const override = direction ? DIRECTIONAL_TITLES[type]?.[direction] : undefined;
    return { type, ...known, ...override };
  }
  const label = humanize(type);
  return {
    type,
    sectionTitle: label,
    badgeLabel: label,
    blurb: "Related in the knowledge base.",
    // Unknown types sort after everything authored, but still render.
    order: 900,
  };
}

/** Whether the engine treats this type as a confirmed, sourced match. */
export function isVerifiedType(type: RelationshipType): boolean {
  return type === "VERIFIED_CLONE";
}

/**
 * The DNA classification for a fragrance itself, from the KB's `dupeStatus`.
 * The engine does not emit ORIGINAL_DNA/HYBRID_DNA as edges — a fragrance's own
 * origin lives on the fragrance record, so that is what we read.
 */
export function dnaTypeForStatus(
  status: DupeStatus,
  hasVerifiedOrigin: boolean
): RelationshipType {
  if (status === "designer_original") return "ORIGINAL_DNA";
  if (hasVerifiedOrigin) return "VERIFIED_CLONE";
  if (status === "matched") return "VERIFIED_CLONE";
  return "INSPIRED_BY";
}
