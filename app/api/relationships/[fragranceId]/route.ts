import { NextResponse } from "next/server";
import { getKB } from "@/lib/kb/loader";
import { resolveFragranceRelationships } from "@/lib/kb/resolve";

/**
 * GET /api/relationships/<fragranceId>
 *
 * Returns everything the Relationship Engine knows about a fragrance, already
 * grouped and ranked: what it derives from, what derives from it, and reverse
 * discovery. `{ result }` on success, 404 if the id is unknown to the KB.
 *
 * The payload is a projection of the KB — no relationship logic runs here.
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
    const result = resolveFragranceRelationships(index, fragranceId);
    if (!result) {
      return NextResponse.json(
        { error: `Unknown fragrance: ${fragranceId}` },
        { status: 404 }
      );
    }
    return NextResponse.json({ result });
  } catch (error) {
    console.error("[api/relationships/:id]", error);
    return NextResponse.json(
      { error: "Failed to resolve relationships." },
      { status: 500 }
    );
  }
}
