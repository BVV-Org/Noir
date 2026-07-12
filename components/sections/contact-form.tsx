"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";

/**
 * ContactForm — the only multi-field form in V1.
 *
 * Server-side Zod errors come back keyed by field and are attached to the
 * matching input through `Field`, which wires `aria-invalid` and
 * `aria-describedby`. That means a screen-reader user hears which field is
 * wrong when they reach it, instead of a summary they must reconcile by hand.
 *
 * On success the form is replaced by the confirmation and focus moves to it, so
 * the outcome is announced without an alert that interrupts.
 */
type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "sent"; delivered: boolean }
  | { kind: "error"; message: string; fields: Record<string, string> };

export function ContactForm() {
  const [status, setStatus] = React.useState<Status>({ kind: "idle" });
  const confirmationRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (status.kind === "sent") confirmationRef.current?.focus();
  }, [status.kind]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus({ kind: "submitting" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result: {
        ok: boolean;
        delivered?: boolean;
        error?: string;
        fieldErrors?: Record<string, string>;
      } = await response.json();

      if (!result.ok) {
        setStatus({
          kind: "error",
          message: result.error ?? "Something went wrong.",
          fields: result.fieldErrors ?? {},
        });
        return;
      }

      setStatus({ kind: "sent", delivered: result.delivered ?? false });
      form.reset();
    } catch {
      setStatus({
        kind: "error",
        message: "Could not reach the server. Check your connection.",
        fields: {},
      });
    }
  }

  if (status.kind === "sent") {
    return (
      <div
        ref={confirmationRef}
        tabIndex={-1}
        className="rounded-lg border border-border bg-card p-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <h2 className="text-h5 font-semibold text-foreground">
          Message received
        </h2>
        <p className="mt-3 text-small text-muted-foreground">
          {status.delivered
            ? "We reply to everything, usually within two working days."
            : "Recorded on the server. Email delivery is not configured in this environment, so no one has been notified."}
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setStatus({ kind: "idle" })}
        >
          Send another
        </Button>
      </div>
    );
  }

  const fieldErrors = status.kind === "error" ? status.fields : {};

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <Field id="contact-name" label="Name" required error={fieldErrors.name}>
        {(props) => <Input {...props} name="name" autoComplete="name" />}
      </Field>

      <Field
        id="contact-email"
        label="Email"
        required
        error={fieldErrors.email}
      >
        {(props) => (
          <Input {...props} name="email" type="email" autoComplete="email" />
        )}
      </Field>

      <Field
        id="contact-message"
        label="Message"
        required
        error={fieldErrors.message}
        hint="Tell us what you are looking for, or what went wrong."
      >
        {(props) => <Textarea {...props} name="message" rows={6} />}
      </Field>

      {status.kind === "error" && Object.keys(fieldErrors).length === 0 && (
        <p role="alert" className="text-small text-destructive">
          {status.message}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={status.kind === "submitting"}
        className="self-start"
      >
        {status.kind === "submitting" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
