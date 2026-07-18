import { NextResponse } from "next/server";
import { getKB } from "@/lib/kb/loader";
import { getSearchIndex } from "@/lib/kb/search";

/**
 * GET /api/relationships/search?q=<query>&limit=<n>
 *
 * Typeahead over the KB: brand, fragrance, alias, partial, or typo.
 * `{ suggestions }` — an empty list for a blank query.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limitParam = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 20)
    : 8;

  try {
    const index = await getKB();
    const suggestions = getSearchIndex(index).suggest(q, limit);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("[api/relationships/search]", error);
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
}
