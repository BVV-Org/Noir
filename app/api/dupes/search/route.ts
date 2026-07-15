import { NextResponse } from "next/server";
import { getKB } from "@/lib/dupes/loader";
import { getSearchIndex } from "@/lib/dupes/search";

/**
 * GET /api/dupes/search?q=<query>&limit=<n>
 *
 * Typeahead over the knowledge base — matches on fragrance name, brand, brand
 * aliases, and partials. Returns `{ suggestions }`. Reads only from the KB, so
 * new fragrances are searchable with no code change.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 20) : 8;

  if (!q.trim()) return NextResponse.json({ suggestions: [] });

  try {
    const index = await getKB();
    const suggestions = getSearchIndex(index).suggest(q, limit);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("[api/dupes/search]", error);
    return NextResponse.json(
      { error: "Failed to search the knowledge base." },
      { status: 500 }
    );
  }
}
