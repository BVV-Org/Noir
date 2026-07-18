import { readFile } from "node:fs/promises";
import path from "node:path";
import { getKB } from "@/lib/kb/loader";

/**
 * GET /api/kb/image/<fragranceId>?r=card|hero|thumbnail
 *
 * Streams a fragrance rendition out of the KB's asset tree. The KB stores its
 * images outside `public/`, so this is the seam that publishes them.
 *
 * The path is resolved from the KB's own image table and re-checked to sit
 * inside the asset root — the caller only ever names a fragrance id, never a
 * path, so there is nothing to traverse with. Placeholder assets are treated as
 * absent: the UI falls back to its derived swatch, which reads better than a
 * generated grey bottle.
 */
export const runtime = "nodejs";

const ASSET_ROOT = path.join(process.cwd(), "fragrance-kb");

const MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".avif": "image/avif",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fragranceId: string }> }
) {
  const { fragranceId } = await params;
  const rendition = new URL(request.url).searchParams.get("r") ?? "card";

  try {
    const index = await getKB();
    const asset = index.imageByFragranceId.get(fragranceId);
    if (!asset || asset.status !== "ready" || asset.isPlaceholder) {
      return new Response("Not found", { status: 404 });
    }

    const file = asset.renditions[rendition];
    if (!file) return new Response("Not found", { status: 404 });

    const abs = path.resolve(ASSET_ROOT, file.path);
    if (!abs.startsWith(ASSET_ROOT + path.sep)) {
      return new Response("Not found", { status: 404 });
    }

    const body = await readFile(abs);
    const type = MIME[path.extname(abs).toLowerCase()] ?? "application/octet-stream";

    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": type,
        // Renditions are content-addressed by the KB build; safe to pin.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
