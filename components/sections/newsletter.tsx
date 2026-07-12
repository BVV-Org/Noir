"use client";

import * as React from "react";
import type { HomepageSection } from "@/types";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

/**
 * Newsletter — the only form on the homepage, and the only client component in
 * the section set.
 *
 * Status is a single state machine rather than three booleans, so "submitting
 * and errored" cannot be represented. Errors are announced through the field's
 * `aria-describedby` wiring; the success message is a polite live region, since
 * focus stays where the visitor left it.
 *
 * `delivered: false` from the API means the environment has no Klaviyo key. We
 * say so plainly instead of showing a subscription that did not happen.
 */
type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; delivered: boolean }
  | { kind: "error"; message: string };

export function Newsletter({ section }: { section: HomepageSection }) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<Status>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: "submitting" });

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data: { ok: boolean; delivered?: boolean; error?: string } =
        await response.json();

      if (!data.ok) {
        setStatus({
          kind: "error",
          message: data.error ?? "Something went wrong. Try again.",
        });
        return;
      }

      setStatus({ kind: "success", delivered: data.delivered ?? false });
      setEmail("");
    } catch {
      setStatus({
        kind: "error",
        message: "Could not reach the server. Check your connection.",
      });
    }
  }

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="rounded-lg border border-border bg-card px-6 py-14 sm:px-12">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-h2 font-semibold text-foreground">
              {section.title ?? "First access"}
            </h2>
            {section.subtitle && (
              <p className="mt-4 text-lg text-muted-foreground">
                {section.subtitle}
              </p>
            )}

            <form
              onSubmit={onSubmit}
              className="mt-10 flex flex-col gap-3 text-left sm:flex-row sm:items-start"
            >
              <Field
                id="newsletter-email"
                label="Email address"
                className="flex-1"
                error={status.kind === "error" ? status.message : undefined}
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    required
                    onChange={(event) => setEmail(event.target.value)}
                  />
                )}
              </Field>

              <Button
                type="submit"
                size="lg"
                disabled={status.kind === "submitting"}
                className="sm:mt-8"
              >
                {status.kind === "submitting"
                  ? "Subscribing…"
                  : (section.ctaLabel ?? "Subscribe")}
              </Button>
            </form>

            <p
              aria-live="polite"
              className="mt-4 text-small text-muted-foreground"
            >
              {status.kind === "success" &&
                (status.delivered
                  ? "You're on the list. Watch for the next release."
                  : "Address accepted. Email delivery is not configured in this environment.")}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
