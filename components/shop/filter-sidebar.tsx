"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FacetGroup } from "@/lib/shop/facets";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, Label } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

/**
 * FilterSidebar — a real `<form method="get">`.
 *
 * Written as a form on purpose. With JavaScript off it submits natively to the
 * same URL shape the app already reads, so the shop is filterable without a
 * client bundle. With JavaScript on, submit is intercepted and turned into a
 * client navigation, and ticking a box submits immediately so no "Apply" round
 * trip is needed.
 *
 * `FormData` serializes repeated checkbox names into repeated query params,
 * which is exactly the `?brand=A&brand=B` contract `parseShopQuery` expects —
 * no manual param assembly, and no chance of the two drifting apart.
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
      className="flex flex-col gap-8"
    >
      {/* Carried through every filter change so search and sort survive it. */}
      {query && <input type="hidden" name="q" value={query} />}
      {sort !== "relevance" && <input type="hidden" name="sort" value={sort} />}

      <fieldset className="flex flex-col gap-3">
        <legend className="sr-only">Availability</legend>
        <div className="flex items-center gap-3">
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
      </fieldset>

      <Separator />

      {groups.map((group) => (
        <fieldset key={group.key} className="flex flex-col gap-4">
          <legend className="overline">{group.label}</legend>
          <div className="flex flex-col gap-3">
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
        </fieldset>
      ))}

      <Separator />

      <fieldset className="flex flex-col gap-4">
        <legend className="overline">Price</legend>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Label htmlFor="filter-min" className="sr-only">
              Minimum price
            </Label>
            <Input
              id="filter-min"
              name="min"
              type="number"
              inputMode="numeric"
              min={priceRange.min}
              max={priceRange.max}
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
              type="number"
              inputMode="numeric"
              min={priceRange.min}
              max={priceRange.max}
              defaultValue={currentMax}
              placeholder={`${priceRange.max}`}
            />
          </div>
        </div>
      </fieldset>

      {/* The only control a no-JS visitor needs; harmless with JS on. */}
      <Button type="submit" variant="outline" className="w-full">
        Apply filters
      </Button>
    </form>
  );
}
