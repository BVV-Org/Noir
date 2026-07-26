"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { FacetGroup } from "@/lib/shop/facets";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, Label } from "@/components/ui/input";

/**
 * FilterSidebar — a real `<form method="get">`, with each facet as a dropdown.
 *
 * Written as a form on purpose. With JavaScript off it submits natively to the
 * same URL shape the app already reads, so the shop is filterable without a
 * client bundle. With JavaScript on, submit is intercepted and turned into a
 * client navigation, and ticking a box submits immediately so no "Apply" round
 * trip is needed.
 *
 * `FormData` serializes repeated checkbox names into repeated query params,
 * which is exactly the `?brand=A&brand=B` contract `parseShopQuery` expects.
 *
 * Each facet group is a native `<details>` disclosure rather than an always-open
 * list: seven groups with a dozen options each stacked open turned the rail into
 * an unreadable wall of checkboxes. Collapsed, every group is one tidy row; a
 * group only starts open when it already has a selection, and its header carries
 * a count so a collapsed group still shows it's active. `<details>` keeps this
 * working with no JS and needs no open/close state of our own.
 *
 * `show` is intentionally not carried over: changing a filter resets pagination.
 */
export function FilterSidebar({
  groups,
  selected,
  priceRange,
  query,
  sort,
  inStockOnly,
  onApplied,
}: {
  groups: FacetGroup[];
  /** Currently ticked values, keyed by facet param name. */
  selected: Record<string, string[]>;
  priceRange: { min: number; max: number };
  query: string;
  sort: string;
  inStockOnly: boolean;
  /** Called after a successful navigation — the mobile sheet closes on it. */
  onApplied?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const formRef = React.useRef<HTMLFormElement>(null);

  const currentMin = searchParams.get("min") ?? "";
  const currentMax = searchParams.get("max") ?? "";
  const priceActive = currentMin !== "" || currentMax !== "";

  function submit(form: HTMLFormElement) {
    const data = new FormData(form);
    const params = new URLSearchParams();

    for (const [key, value] of data.entries()) {
      if (typeof value === "string" && value !== "") params.append(key, value);
    }

    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname, { scroll: false });
    onApplied?.();
  }

  return (
    <form
      ref={formRef}
      action={pathname}
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        submit(event.currentTarget);
      }}
      className="flex flex-col"
    >
      {/* Carried through every filter change so search and sort survive it. */}
      {query && <input type="hidden" name="q" value={query} />}
      {sort !== "relevance" && <input type="hidden" name="sort" value={sort} />}

      <div className="flex items-center gap-3 border-b border-border/60 py-4">
        <Checkbox
          id="filter-stock"
          name="stock"
          value="in"
          defaultChecked={inStockOnly}
          onCheckedChange={() => formRef.current && submit(formRef.current)}
        />
        <Label htmlFor="filter-stock" className="cursor-pointer">
          In stock only
        </Label>
      </div>

      {groups.map((group) => {
        const count = selected[group.key]?.length ?? 0;
        return (
          <details
            key={group.key}
            open={count > 0}
            className="group border-b border-border/60"
          >
            <summary
              className="flex cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden"
            >
              <span className="flex items-center gap-2">
                <span className="overline">{group.label}</span>
                {count > 0 && (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-medium leading-none text-primary-foreground tabular-nums">
                    {count}
                  </span>
                )}
              </span>
              <ChevronDown
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-premium group-open:rotate-180"
                strokeWidth={1.5}
              />
            </summary>

            <div className="flex flex-col gap-3 pb-5 pt-1">
              {group.options.map((option) => {
                const id = `filter-${group.key}-${option.value}`;
                const checked = selected[group.key]?.includes(option.value);
                return (
                  <div key={option.value} className="flex items-center gap-3">
                    <Checkbox
                      id={id}
                      name={group.key}
                      value={option.value}
                      defaultChecked={checked}
                      onCheckedChange={() =>
                        formRef.current && submit(formRef.current)
                      }
                    />
                    <Label
                      htmlFor={id}
                      className="flex flex-1 cursor-pointer items-baseline justify-between gap-2 font-normal"
                    >
                      <span>{option.label}</span>
                      <span className="text-caption tabular-nums text-muted-foreground">
                        {option.count}
                      </span>
                    </Label>
                  </div>
                );
              })}
            </div>
          </details>
        );
      })}

      <details open={priceActive} className="group border-b border-border/60">
        <summary className="flex cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
          <span className="overline">Price</span>
          <ChevronDown
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-premium group-open:rotate-180"
            strokeWidth={1.5}
          />
        </summary>
        <div className="flex items-center gap-3 pb-5 pt-1">
          <div className="flex-1">
            <Label htmlFor="filter-min" className="sr-only">
              Minimum price
            </Label>
            {/*
              `text` + `inputMode="numeric"` rather than `type="number"`: the
              number type exposes no selection API, so it cannot carry the
              smooth caret. `parseSearchParams` already coerces and clamps
              these server-side, so the native min/max constraint was belt to
              its braces — an out-of-range entry now simply returns no matches.
            */}
            <Input
              id="filter-min"
              name="min"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              defaultValue={currentMin}
              placeholder={`${priceRange.min}`}
            />
          </div>
          <span aria-hidden className="text-muted-foreground">
            -
          </span>
          <div className="flex-1">
            <Label htmlFor="filter-max" className="sr-only">
              Maximum price
            </Label>
            <Input
              id="filter-max"
              name="max"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              defaultValue={currentMax}
              placeholder={`${priceRange.max}`}
            />
          </div>
        </div>
      </details>

      {/* The only control a no-JS visitor needs; harmless with JS on. */}
      <Button type="submit" variant="outline" className="mt-6 w-full">
        Apply filters
      </Button>
    </form>
  );
}
