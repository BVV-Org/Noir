import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/newsletter — subscribe an address to the Klaviyo list (TDD §10).
 *
 * The Klaviyo key is server-only and never reaches the client. Responses are
 * normalized to `{ ok, ... }` and errors never echo the upstream body, which
 * can contain account identifiers.
 *
 * When the key is absent — every local and preview environment — the request is
 * accepted and reported back with `delivered: false`. It deliberately does not
 * pretend to have subscribed anyone: the UI tells the visitor that email is not
 * configured here rather than showing a success that never happened.
 */
const schema = z.object({
  email: z.email("Enter a valid email address."),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Expected a JSON body." },
      { status: 400 }
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    return NextResponse.json(
      { ok: false, error: issue?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  const apiKey = process.env.KLAVIYO_API_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;

  if (!apiKey || !listId) {
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const response = await fetch(
      `https://a.klaviyo.com/api/lists/${listId}/relationships/profiles/`,
      {
        method: "POST",
        headers: {
          Authorization: `Klaviyo-API-Key ${apiKey}`,
          "Content-Type": "application/json",
          revision: "2024-10-15",
        },
        body: JSON.stringify({
          data: [{ type: "profile", attributes: { email: parsed.data.email } }],
        }),
      }
    );

    if (!response.ok) {
      console.error("Klaviyo subscribe failed", response.status);
      return NextResponse.json(
        { ok: false, error: "Could not subscribe right now. Try again later." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch (error) {
    console.error("Klaviyo subscribe threw", error);
    return NextResponse.json(
      { ok: false, error: "Could not subscribe right now. Try again later." },
      { status: 502 }
    );
  }
}
