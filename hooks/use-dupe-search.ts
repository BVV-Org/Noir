"use client";

import * as React from "react";
import type { SearchSuggestion } from "@/types/dupes";

/**
 * useDupeSearch — debounced typeahead against `/api/dupes/search`.
 *
 * Aborts in-flight requests when the query changes so results never arrive out
 * of order. Purely data-driven: it knows nothing about which fragrances exist.
 */
export function useDupeSearch(query: string, debounceMs = 140) {
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
          `/api/dupes/search?q=${encodeURIComponent(q)}`,
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
