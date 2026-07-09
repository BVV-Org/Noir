"use client";

import * as React from "react";
import Image from "next/image";
import type { ShopImage } from "@/types";
import { cn } from "@/lib/utils";

/**
 * ProductGallery — the bottle, from its two angles.
 *
 * The thumbnails are a `tablist`: they select which panel is visible, which is
 * exactly what tabs are for, and it gives arrow-key navigation for free through
 * roving `tabIndex`. A list of buttons would be announced as "button, button"
 * with no sense of position or total.
 *
 * Only the first image gets `priority` — it is the LCP element on this route.
 */
export function ProductGallery({
  images,
  title,
}: {
  images: ShopImage[];
  title: string;
}) {
  const [active, setActive] = React.useState(0);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  if (images.length === 0) return null;
  const current = images[active] ?? images[0]!;

  function onKeyDown(event: React.KeyboardEvent) {
    const last = images.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = active === last ? 0 : active + 1;
    if (event.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    if (next === null) return;

    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border bg-card">
        <Image
          key={current.url}
          src={current.url}
          alt={current.altText}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div
          role="tablist"
          aria-label={`${title} images`}
          onKeyDown={onKeyDown}
          className="flex gap-3"
        >
          {images.map((image, index) => (
            <button
              key={image.url}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              role="tab"
              type="button"
              aria-selected={index === active}
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-square w-20 overflow-hidden rounded-md border transition-colors duration-150 ease-premium",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                index === active
                  ? "border-primary"
                  : "border-border hover:border-border/80"
              )}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
              <span className="sr-only">
                View image {index + 1} of {images.length}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
