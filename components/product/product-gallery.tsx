"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import { Play } from "lucide-react";
import type { ShopImage } from "@/types";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * ProductGallery — the bottle, from its angles, plus the hero video.
 *
 * The main stage is swipeable: drag/flick left or right (touch or mouse) moves
 * between slides, and the slide animates in from the direction of travel. The
 * thumbnails remain a `tablist` for pointer + keyboard selection and to announce
 * position; swipe and taps drive the same `active` index.
 *
 * On open, once and only if the visitor has not already interacted, the gallery
 * auto-advances a single step after a beat — a hint that there is more than one
 * angle. It never loops on a timer, and reduced-motion users get neither the
 * slide transform (Framer's `reducedMotion="user"`) nor the auto-advance.
 *
 * ## Video
 *
 * `nv.hero_video` leads the gallery when present. It autoplays muted+looping
 * only without a reduced-motion request; otherwise it is a still poster with
 * controls. Only the active slide is mounted, so an off-screen video never
 * plays.
 */
type Slide =
  | { kind: "image"; image: ShopImage }
  | { kind: "video"; url: string; poster: ShopImage | undefined };

const AUTO_ADVANCE_MS = 3200;
const SWIPE_THRESHOLD_PX = 40;

const slideVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: "0%", opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? "-100%" : "100%", opacity: 0 }),
};

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
  const [[active, direction], setState] = React.useState<[number, number]>([
    0, 0,
  ]);
  const [interacted, setInteracted] = React.useState(false);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const pointerStartX = React.useRef<number | null>(null);

  const slides: Slide[] = React.useMemo(() => {
    const imageSlides: Slide[] = images.map((image) => ({
      kind: "image",
      image,
    }));
    if (!videoUrl) return imageSlides;
    return [{ kind: "video", url: videoUrl, poster: images[0] }, ...imageSlides];
  }, [images, videoUrl]);

  const count = slides.length;
  const wrap = React.useCallback(
    (i: number) => (count === 0 ? 0 : ((i % count) + count) % count),
    [count]
  );

  const paginate = React.useCallback(
    (dir: number) => setState(([a]) => [wrap(a + dir), dir]),
    [wrap]
  );

  const goTo = React.useCallback(
    (index: number) => {
      setInteracted(true);
      setState(([a]) => [wrap(index), index >= a ? 1 : -1]);
    },
    [wrap]
  );

  // One-time hint: nudge to the next slide shortly after open.
  React.useEffect(() => {
    if (reduced || count < 2 || interacted) return;
    const timer = setTimeout(() => paginate(1), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [reduced, count, interacted, paginate]);

  if (count === 0) return null;
  const current = slides[wrap(active)]!;

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    setInteracted(true);
    const dir = event.key === "ArrowRight" ? 1 : -1;
    const next = wrap(active + dir);
    setState([next, dir]);
    tabRefs.current[next]?.focus();
  }

  function onPointerDown(event: React.PointerEvent) {
    pointerStartX.current = event.clientX;
  }

  function onPointerUp(event: React.PointerEvent) {
    if (pointerStartX.current === null) return;
    const dx = event.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(dx) <= SWIPE_THRESHOLD_PX) return;
    setInteracted(true);
    paginate(dx < 0 ? 1 : -1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative aspect-[4/5] touch-pan-y select-none overflow-hidden rounded-lg border border-border bg-card"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (pointerStartX.current = null)}
      >
        <AnimatePresence initial={false} custom={direction}>
          <m.div
            key={active}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 320, damping: 34 },
              opacity: { duration: 0.18 },
            }}
            className="absolute inset-0"
          >
            {current.kind === "video" ? (
              <video
                key={current.url}
                src={current.url}
                poster={current.poster?.url}
                muted
                playsInline
                autoPlay={!reduced}
                loop={!reduced}
                controls={reduced}
                aria-label={`${title}, video`}
                className="pointer-events-none size-full object-cover"
              />
            ) : (
              <Image
                src={current.image.url}
                alt={current.image.altText}
                fill
                // LCP only on the first slide shown at open.
                priority={active === 0}
                draggable={false}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="pointer-events-none object-cover"
              />
            )}
          </m.div>
        </AnimatePresence>

        {/* Progress dots — a quiet signal that the stage is swipeable. */}
        {count > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
            {slides.map((slide, index) => (
              <span
                key={slide.kind === "video" ? slide.url : slide.image.url}
                aria-hidden
                className={cn(
                  "h-1.5 rounded-full bg-foreground transition-all duration-200 ease-premium",
                  index === wrap(active) ? "w-4 opacity-90" : "w-1.5 opacity-40"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {count > 1 && (
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
                aria-selected={index === wrap(active)}
                tabIndex={index === wrap(active) ? 0 : -1}
                onClick={() => goTo(index)}
                className={cn(
                  "relative aspect-square w-20 overflow-hidden rounded-md border transition-colors duration-150 ease-premium",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  index === wrap(active)
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
                    <Play className="size-5 text-foreground" fill="currentColor" />
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
