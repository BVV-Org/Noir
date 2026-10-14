import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { getSellableProducts } from "@/lib/scent-match/server";
import { ScentMatch } from "@/components/scent-match/scent-match";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Scent Match",
  description:
    "Seven questions, no perfume jargon. Get a scent profile and a fragrance from the vault that fits it — matched only from what's in stock.",
  path: "/scent-match",
});

/**
 * Scent Match — the fragrance-profile quiz.
 *
 * The page itself only needs the size of the in-stock pool for its telemetry
 * line; answers are scored by the `matchScent` Server Action, which reads the
 * catalogue on the server and returns just the recommended bottles.
 */
export default async function ScentMatchPage() {
  const pool = (await getSellableProducts()).length;
  return <ScentMatch pool={pool} />;
}
