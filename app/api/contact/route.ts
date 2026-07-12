import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/contact — the contact form's endpoint.
 *
 * Validated with Zod and normalized to `{ ok, ... }` like every other route
 * handler (TDD §10). Field-level errors are returned keyed by field so the form
 * can attach them to the right input rather than showing one generic banner.
 *
 * There is no transactional email provider wired in V1. Rather than pretending
 * a message was sent, the route records it server-side and reports
 * `delivered: false`, and the form says so. Point this at Klaviyo, Resend, or a
 * Shopify Admin ticket when one is chosen — nothing else has to change.
 */
const schema = z.object({
  name: z.string().min(1, "Tell us your name.").max(120),
  email: z.email("Enter a valid email address."),
  message: z
    .string()
    .min(10, "A little more detail, please: at least 10 characters.")
    .max(4000),
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
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return NextResponse.json(
      { ok: false, error: "Check the highlighted fields.", fieldErrors },
      { status: 400 }
    );
  }

  // Deliberately not logging the message body — it is a visitor's own words.
  console.info("Contact form submission from", parsed.data.email);

  return NextResponse.json({ ok: true, delivered: false });
}
