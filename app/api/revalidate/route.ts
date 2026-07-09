import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants";

/**
 * Shopify webhook receiver → on-demand ISR (TDD §9).
 *
 * Shopify signs every webhook with an HMAC-SHA256 of the **raw** body, base64
 * encoded, in `X-Shopify-Hmac-Sha256`. Verification must run against the exact
 * bytes received: `await request.json()` would re-serialize and change the
 * signature, so the body is read as text and parsed only after the signature
 * checks out.
 *
 * Without this, anyone who learned the URL could force cache invalidation on
 * every request and turn a cached storefront into an origin-load amplifier.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // `node:crypto`; not available on the edge.

/** Which Shopify topic invalidates which cache tag. */
const TOPIC_TAGS: Record<string, string[]> = {
  "products/create": [
    CACHE_TAGS.products,
    CACHE_TAGS.kits,
    CACHE_TAGS.homepage,
  ],
  "products/update": [
    CACHE_TAGS.products,
    CACHE_TAGS.kits,
    CACHE_TAGS.homepage,
  ],
  "products/delete": [
    CACHE_TAGS.products,
    CACHE_TAGS.kits,
    CACHE_TAGS.homepage,
  ],
  "collections/create": [CACHE_TAGS.collections],
  "collections/update": [CACHE_TAGS.collections, CACHE_TAGS.products],
  "collections/delete": [CACHE_TAGS.collections],
  // Metaobject topics cover the journal and homepage composition.
  "metaobjects/create": [CACHE_TAGS.journal, CACHE_TAGS.homepage],
  "metaobjects/update": [CACHE_TAGS.journal, CACHE_TAGS.homepage],
  "metaobjects/delete": [CACHE_TAGS.journal, CACHE_TAGS.homepage],
};

/** Constant-time compare; `===` on a signature leaks it one byte at a time. */
function verify(rawBody: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest();

  let received: Buffer;
  try {
    received = Buffer.from(signature, "base64");
  } catch {
    return false;
  }

  // `timingSafeEqual` throws on a length mismatch, which is itself a leak-free
  // signal that the signature is wrong.
  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}

export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_REVALIDATION_SECRET;
  if (!secret) {
    console.error("SHOPIFY_REVALIDATION_SECRET is not set; refusing webhook.");
    return NextResponse.json(
      { ok: false, error: "Webhooks are not configured." },
      { status: 503 }
    );
  }

  const signature = request.headers.get("x-shopify-hmac-sha256");
  if (!signature) {
    return NextResponse.json(
      { ok: false, error: "Missing signature." },
      { status: 401 }
    );
  }

  // Raw text, not JSON — the signature covers the bytes Shopify sent.
  const rawBody = await request.text();

  if (!verify(rawBody, signature, secret)) {
    return NextResponse.json(
      { ok: false, error: "Invalid signature." },
      { status: 401 }
    );
  }

  const topic = request.headers.get("x-shopify-topic") ?? "";
  const tags = TOPIC_TAGS[topic];

  if (!tags) {
    // Authentic, but a topic we do not subscribe to. 200 so Shopify does not
    // retry it for two days.
    return NextResponse.json({ ok: true, revalidated: [], topic });
  }

  for (const tag of tags) revalidateTag(tag);

  return NextResponse.json({ ok: true, revalidated: tags, topic });
}
