"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterSidebar } from "@/components/shop/filter-sidebar";

/**
 * FilterSheet — the same sidebar, off-canvas, below `lg` (TDD §14).
 *
 * The sidebar is not duplicated for mobile; it is the identical component in a
 * different container. The sheet closes once a navigation has been queued, so
 * the visitor sees the results rather than the controls that produced them.
 */
export function FilterSheet(
  props: Omit<React.ComponentProps<typeof FilterSidebar>, "onApplied"> & {
    activeCount: number;
  }
) {
  const { activeCount, ...sidebarProps } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-primary text-caption font-medium text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[min(92vw,24rem)] overflow-y-auto">
        <SheetTitle className="font-display uppercase tracking-[0.2em]">
          Filters
        </SheetTitle>
        <SheetDescription className="sr-only">
          Narrow the catalogue by rarity, house, season, notes, and price.
        </SheetDescription>

        <div className="mt-6">
          <FilterSidebar {...sidebarProps} onApplied={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
