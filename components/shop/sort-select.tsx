"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProductSortKey } from "@/types";
import { SORT_OPTIONS, setParam } from "@/lib/shop/search-params";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * SortSelect — writes `?sort=`.
 *
 * Disabled while a search is active. `DataProvider.searchProducts(query,
 * filters)` takes no sort key by design: search results come back ranked by
 * relevance, and re-sorting them by price would throw away the ranking that
 * made them results in the first place. Rather than silently ignoring the
 * control, it is disabled and says why.
 */
export function SortSelect({
  value,
  searching,
}: {
  value: ProductSortKey;
  searching: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (searching) {
    return (
      <p className="text-small text-muted-foreground">Sorted by relevance</p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="shop-sort" className="sr-only">
        Sort products
      </label>
      <Select
        value={value}
        onValueChange={(next) => {
          const query = setParam(
            new URLSearchParams(searchParams),
            "sort",
            next
          );
          router.push(query ? `${pathname}?${query}` : pathname, {
            scroll: false,
          });
        }}
      >
        <SelectTrigger id="shop-sort" className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
