"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { setParam } from "@/lib/shop/search-params";
import { Input } from "@/components/ui/input";

/**
 * SearchBar — writes `?q=` and lets the server re-render the grid.
 *
 * `router.replace` rather than `push`: typing six characters should not put six
 * entries in the visitor's history. `scroll: false` keeps the results in view
 * instead of jumping to the top on every keystroke.
 *
 * The debounce is 300ms — long enough that a normal typing cadence produces one
 * navigation, short enough that the grid feels tied to the input.
 */
export function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = React.useState(initialQuery);

  // The URL can change beneath us (a cleared chip, the back button). Follow it.
  React.useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  const commit = React.useCallback(
    (next: string) => {
      const query = setParam(
        new URLSearchParams(searchParams),
        "q",
        next.trim()
      );
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  React.useEffect(() => {
    if (value === initialQuery) return;
    const timer = window.setTimeout(() => commit(value), 300);
    return () => window.clearTimeout(timer);
  }, [value, initialQuery, commit]);

  return (
    <form
      role="search"
      action={pathname}
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        commit(value);
      }}
      className="relative w-full"
    >
      <label htmlFor="shop-search" className="sr-only">
        Search fragrances
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id="shop-search"
        name="q"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search by name, house, or note"
        className="pl-10 pr-10"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            commit("");
          }}
          className="absolute right-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 ease-premium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" />
          <span className="sr-only">Clear search</span>
        </button>
      )}
    </form>
  );
}
