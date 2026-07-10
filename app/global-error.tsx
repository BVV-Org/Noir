"use client";

import * as React from "react";

/**
 * The last-resort error boundary.
 *
 * `error.tsx` sits *inside* the root layout, so it cannot catch a failure in the
 * layout itself — the fonts, the providers, the navbar. `global-error.tsx`
 * replaces the whole document when that happens, which is why it must render its
 * own `<html>` and `<body>`.
 *
 * It therefore cannot use the design system: if the layout threw, the providers,
 * the font variables, and possibly the stylesheet never mounted. Every style
 * here is inline, and the palette is hardcoded to the brand's two anchor colours
 * so the page still reads as Noir Vault rather than as a white browser default.
 * This is the one file in the codebase where an inline style is correct.
 *
 * In production this should be near-unreachable. If it renders, something in the
 * root layout is broken for every visitor at once.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Root layout failed", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111111",
          color: "#F5F5F5",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
          padding: "1.5rem",
        }}
      >
        <main style={{ maxWidth: "32rem", textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.6875rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#A3A3A3",
            }}
          >
            Noir Vault
          </p>

          <h1
            style={{
              margin: "1.5rem 0 0",
              fontSize: "2rem",
              lineHeight: 1.1,
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            The vault is sealed
          </h1>

          <p style={{ margin: "1rem 0 0", color: "#A3A3A3", lineHeight: 1.6 }}>
            Something failed before the page could load. Reloading usually
            resolves it.
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2.5rem",
              minHeight: "2.75rem",
              padding: "0 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: "#00C27A",
              color: "#111111",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>

          {error.digest && (
            <p
              style={{
                margin: "2rem 0 0",
                fontSize: "0.75rem",
                color: "#737373",
              }}
            >
              Reference: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
