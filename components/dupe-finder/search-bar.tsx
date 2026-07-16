"use client";

import * as React from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Search, X, CornerDownLeft, Loader2 } from "lucide-react";
import { EASE } from "@/lib/animations/config";
import { cn } from "@/lib/utils";
import { useDupeSearch } from "@/hooks/use-dupe-search";

/**
 * SearchBar — accessible combobox (WAI-ARIA 1.2) over the knowledge base.
 * Suggestions come from `/api/dupes/search`; the component holds no fragrance
 * data of its own. Keyboard: ↑ ↓ Enter Esc.
 */
export function SearchBar({
  onSelect,
  autoFocus = false,
  size = "lg",
}: {
  onSelect: (fragranceId: string, label: string) => void;
  autoFocus?: boolean;
  size?: "md" | "lg";
}) {
  const reduce = useReducedMotion();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listId = React.useId();
  const { suggestions, loading } = useDupeSearch(query);

  React.useEffect(() => setActive(0), [suggestions]);

  const choose = (i: number) => {
    const s = suggestions[i];
    if (!s) return;
    setQuery(`${s.brand} ${s.name}`);
    setOpen(false);
    onSelect(s.fragranceId, `${s.brand} ${s.name}`);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % Math.max(suggestions.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + suggestions.length) % Math.max(suggestions.length, 1));
    } else if (e.key === "Enter") {
      if (open && suggestions[active]) {
        e.preventDefault();
        choose(active);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && query.trim().length > 0;

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "flex items-center gap-3 rounded-full border border-border bg-background/70 backdrop-blur-xl transition-colors focus-within:border-foreground/40",
          size === "lg" ? "h-14 px-5" : "h-12 px-4"
        )}
      >
        {loading ? (
          <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" aria-hidden />
        ) : (
          <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && suggestions[active] ? `${listId}-opt-${active}` : undefined
          }
          autoFocus={autoFocus}
          value={query}
          placeholder="Search a fragrance — e.g. Creed Aventus"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
            size === "lg" ? "text-lg" : "text-base"
          )}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {showList ? `${suggestions.length} suggestions` : ""}
      </span>

      <AnimatePresence>
        {showList && (
          <m.ul
            id={listId}
            role="listbox"
            aria-label="Fragrance suggestions"
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: EASE.settle }}
            className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-2xl border border-border bg-popover/95 p-1.5 shadow-xl backdrop-blur-xl"
          >
            {suggestions.length === 0 ? (
              <li className="px-4 py-3 text-caption text-muted-foreground">
                {loading ? "Searching…" : "No fragrances found. Try a brand or full name."}
              </li>
            ) : (
              suggestions.map((s, i) => (
                <li
                  key={s.fragranceId}
                  id={`${listId}-opt-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(i);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-2.5 transition-colors",
                    i === active ? "bg-accent" : "bg-transparent"
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-foreground">
                      {s.name}
                    </span>
                    <span className="block truncate font-mono text-caption uppercase tracking-[0.06em] text-muted-foreground">
                      {s.brand}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {s.brandKind === "clone" && (
                      <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.08em] text-muted-foreground">
                        Dupe
                      </span>
                    )}
                    {i === active && (
                      <CornerDownLeft className="size-3.5 text-muted-foreground" aria-hidden />
                    )}
                  </span>
                </li>
              ))
            )}
          </m.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
