"use client";

import * as React from "react";
import type { DupeResultVM } from "@/types/dupes";

export type DupeResultStatus =
  | "idle"
  | "loading"
  | "success"
  | "not-found"
  | "error";

/**
 * useDupeResult — fetches the ranked dupe result for a fragrance id from
 * `/api/dupes/<id>`. Handles the full async lifecycle and cancels stale
 * requests so a fast re-search can't be overwritten by a slow earlier one.
 */
export function useDupeResult(fragranceId: string | null) {
  const [result, setResult] = React.useState<DupeResultVM | null>(null);
  const [status, setStatus] = React.useState<DupeResultStatus>("idle");
  const [nonce, setNonce] = React.useState(0);

  const reload = React.useCallback(() => setNonce((n) => n + 1), []);

  React.useEffect(() => {
    if (!fragranceId) {
      setStatus("idle");
      setResult(null);
      return;
    }

    const controller = new AbortController();
    setStatus("loading");
    setResult(null);

    (async () => {
      try {
        const res = await fetch(`/api/dupes/${encodeURIComponent(fragranceId)}`, {
          signal: controller.signal,
        });
        if (res.status === 404) {
          setStatus("not-found");
          return;
        }
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = (await res.json()) as { result: DupeResultVM };
        setResult(data.result);
        setStatus("success");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setStatus("error");
      }
    })();

    return () => controller.abort();
  }, [fragranceId, nonce]);

  return { result, status, reload };
}
