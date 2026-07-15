import { NextResponse } from "next/server";
import { getKB } from "@/lib/dupes/loader";
import { resolveDupes } from "@/lib/dupes/ranker";
import { buildDupeResult } from "@/lib/dupes/formatter";

/**
 * GET /api/dupes/<fragranceId>
 *
 * Returns the ranked dupe result for a fragrance. A searched clone resolves to
 * its original so its sibling alternatives are included. `{ result }` on
 * success, 404 if the id is unknown to the KB.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fragranceId: string }> }
) {
  const { fragranceId } = await params;

  try {
    const index = await getKB();
    const resolved = resolveDupes(index, fragranceId);
    if (!resolved) {
      return NextResponse.json(
        { error: `Unknown fragrance: ${fragranceId}` },
        { status: 404 }
      );
    }
    return NextResponse.json({ result: buildDupeResult(index, resolved) });
  } catch (error) {
    console.error("[api/dupes/:id]", error);
    return NextResponse.json(
      { error: "Failed to resolve dupes." },
      { status: 500 }
    );
  }
}
