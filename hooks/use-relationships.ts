"use client";

import * as React from "react";
import type {
  FragranceRelationshipsVM,
  SearchSuggestion,
} from "@/types/relationships";

export type RelationshipStatus =
  | "idle"
  | "loading"
  | "success"
  | "not-found"
  | "error";

/**
 * useRelationships — fetches everything the engine knows about a fragrance from
 * `/api/relationships/<id>`. Stale requests are aborted so a fast re-search can
 * never be overwritten by a slower earlier one.
 */
export function useRelationships(fragranceId: string | null) {
  const [result, setResult] = React.useState<FragranceRelationshipsVM | null>(
    null
  );
  const [status, setStatus] = React.useState<RelationshipStatus>("idle");
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
        const res = await fetch(
          `/api/relationships/${encodeURIComponent(fragranceId)}`,
          { signal: controller.signal }
        );
        if (res.status === 404) {
          setStatus("not-found");
          return;
        }
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = (await res.json()) as { result: FragranceRelationshipsVM };
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

/**
 * useRelationshipSearch — debounced typeahead against
 * `/api/relationships/search`. Knows nothing about which fragrances exist; the
 * KB's search engine answers every query.
 */
export function useRelationshipSearch(query: string, debounceMs = 140) {
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/relationships/search?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        const data = (await res.json()) as { suggestions: SearchSuggestion[] };
        setSuggestions(data.suggestions ?? []);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, debounceMs]);

  return { suggestions, loading, error };
}
