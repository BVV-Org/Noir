import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/contact — the contact form's endpoint.
 *
 * Validated with Zod and normalized to `{ ok, ... }` like every other route
 * handler (TDD §10). Field-level errors are returned keyed by field so the form
 * can attach them to the right input rather than showing one generic banner.
 *
 * Delivery is via Resend's REST API (no SDK dependency — a single fetch), gated
 * on three server-only env vars. The /contact page promises a reply within two
 * working days, so this route must NEVER silently accept a message it cannot
 * deliver: when the provider is unconfigured it fails loudly (503 + a server
 * error naming the missing vars) rather than returning a false success. Wire the
 * vars in and delivery starts with no code change.
 *
 * Required env: RESEND_API_KEY, CONTACT_FROM_EMAIL (a sender on a Resend-verified
 * domain), CONTACT_TO_EMAIL (the inbox that should receive submissions).
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

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  // Fail loudly. Previously this console.info'd and returned delivered:false,
  // so a visitor's message was silently dropped while the page promised a reply.
  // If the provider is not configured, tell the operator exactly what is missing
  // and return an error the form surfaces — never a false "received".
  if (!apiKey || !from || !to) {
    console.error(
      "CONTACT PROVIDER NOT CONFIGURED — a visitor message was NOT delivered. " +
        "Set RESEND_API_KEY, CONTACT_FROM_EMAIL and CONTACT_TO_EMAIL to enable delivery."
    );
    return NextResponse.json(
      {
        ok: false,
        delivered: false,
        error:
          "We could not send your message right now. Please try again in a little while.",
      },
      { status: 503 }
    );
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        // Replies go straight back to the visitor, not to the shared sender.
        reply_to: parsed.data.email,
        subject: `Contact form — ${parsed.data.name}`,
        text: `From: ${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.message}`,
      }),
    });

    if (!response.ok) {
      // Never echo the upstream body: it can carry account identifiers.
      console.error("Resend contact send failed", response.status);
      return NextResponse.json(
        {
          ok: false,
          delivered: false,
          error: "Could not send your message right now. Try again shortly.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch (error) {
    console.error("Resend contact send threw", error);
    return NextResponse.json(
      {
        ok: false,
        delivered: false,
        error: "Could not send your message right now. Try again shortly.",
      },
      { status: 502 }
    );
  }
}
