"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";

/**
 * The root error boundary. Catches anything thrown while rendering a route —
 * most plausibly a Storefront API failure surfacing through the data provider.
 *
 * Error boundaries must be Client Components: `reset()` re-renders the segment,
 * which retries the server fetch without a full page load.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Next strips the message in production; the digest is the only handle for
    // correlating this with the server-side log.
    console.error(error);
  }, [error]);

  return (
    <Section spacing="lg" className="text-center">
      <p className="overline">Something went wrong</p>
      <h1 className="mt-4 text-h1 font-semibold text-foreground">
        The vault didn&rsquo;t respond
      </h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
        An unexpected error interrupted this page. Trying again will usually
        resolve it.
      </p>
      <div className="mt-10 flex justify-center">
        <Button onClick={reset}>Try again</Button>
      </div>
      {error.digest && (
        <p className="mt-8 text-caption text-muted-foreground">
          Reference: {error.digest}
        </p>
      )}
    </Section>
  );
}
