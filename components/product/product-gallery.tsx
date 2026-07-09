"use client";

import * as React from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { ShopImage } from "@/types";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * ProductGallery — the bottle, from its angles, plus the hero video.
 *
 * The thumbnails are a `tablist`: they select which panel is visible, which is
 * exactly what tabs are for, and it gives arrow-key navigation for free through
 * roving `tabIndex`. A list of buttons would be announced as "button, button"
 * with no sense of position or total.
 *
 * ## Video
 *
 * `nv.hero_video` is an optional `file_reference` (TDD §7). When absent the tab
 * is simply not rendered — the component degrades to images with no branching at
 * the call site. When present it leads the gallery, because a fragrance video is
 * the most characteristic thing a product page can open with.
 *
 * The video autoplays muted and looping *only* when the visitor has not asked
 * for reduced motion; otherwise it is a still poster with visible controls.
 * Looping video is motion the visitor never initiated, and the animation
 * guidelines forbid it outright — this is the one place it can appear, so it
 * defers to the media query.
 */
type Slide =
  | { kind: "image"; image: ShopImage }
  | { kind: "video"; url: string; poster: ShopImage | undefined };

export function ProductGallery({
  images,
  title,
  videoUrl,
}: {
  images: ShopImage[];
  title: string;
  videoUrl?: string | null;
}) {
  const reduced = useReducedMotion();
  const [active, setActive] = React.useState(0);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const slides: Slide[] = React.useMemo(() => {
    const imageSlides: Slide[] = images.map((image) => ({
      kind: "image",
      image,
    }));
    if (!videoUrl) return imageSlides;
    return [
      { kind: "video", url: videoUrl, poster: images[0] },
      ...imageSlides,
    ];
  }, [images, videoUrl]);

  if (slides.length === 0) return null;
  const current = slides[active] ?? slides[0]!;

  function onKeyDown(event: React.KeyboardEvent) {
    const last = slides.length - 1;
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
        {current.kind === "video" ? (
          <video
            key={current.url}
            src={current.url}
            poster={current.poster?.url}
            // Muted is required for autoplay to be permitted at all.
            muted
            playsInline
            autoPlay={!reduced}
            loop={!reduced}
            controls={reduced}
            aria-label={`${title}, video`}
            className="size-full object-cover"
          />
        ) : (
          <Image
            key={current.image.url}
            src={current.image.url}
            alt={current.image.altText}
            fill
            // The LCP element on this route; only the first slide gets it.
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>

      {slides.length > 1 && (
        <div
          role="tablist"
          aria-label={`${title} media`}
          onKeyDown={onKeyDown}
          className="flex gap-3"
        >
          {slides.map((slide, index) => {
            const thumb = slide.kind === "video" ? slide.poster : slide.image;
            return (
              <button
                key={slide.kind === "video" ? slide.url : slide.image.url}
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
                {thumb && (
                  <Image
                    src={thumb.url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
                {slide.kind === "video" && (
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center bg-background/50"
                  >
                    <Play
                      className="size-5 text-foreground"
                      fill="currentColor"
                    />
                  </span>
                )}
                <span className="sr-only">
                  {slide.kind === "video" ? "Play video" : "View image"}{" "}
                  {index + 1} of {slides.length}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
