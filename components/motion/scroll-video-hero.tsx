"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * ScrollVideoHero — a full-viewport video whose playhead is scrubbed by scroll.
 *
 * The section is a tall "scroll track" (`trackVh` tall) with a sticky, full-
 * screen inner stage. As the track passes through the viewport, scroll progress
 * (0→1) is mapped onto the video's `currentTime`, so scrolling down plays the
 * clip forward and scrolling up runs it backward. Because the track is several
 * viewports tall, the rest of the page sits beneath it — the visitor only
 * reaches the next section once they have scrolled the animation through, which
 * is the "finish the intro before moving on" behaviour without hijacking the
 * scrollbar (which breaks trackpads, keyboards, and accessibility).
 *
 * Progress is read straight from the track's `getBoundingClientRect()` on a
 * passive scroll listener, and the playhead is eased toward its target on a rAF
 * loop rather than snapped, so a fast flick still resolves to a smooth glide.
 * Nothing here uses React state, so scrolling never re-renders the tree.
 *
 * Reduced-motion: no scrubbing and no tall track — the stage is one viewport and
 * the video holds on its first frame as a still poster.
 */
export function ScrollVideoHero({
  src,
  poster,
  children,
  trackVh = 300,
  className,
}: {
  src: string;
  poster?: string;
  children: React.ReactNode;
  /** Height of the scroll track in viewport units; larger = slower scrub. */
  trackVh?: number;
  className?: string;
}) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const durationRef = React.useRef(0);
  const targetRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const reduce = useReducedMotion();

  // Ease the playhead toward the scroll target so a fast scroll still glides.
  const runScrub = React.useCallback(() => {
    const video = videoRef.current;
    const duration = durationRef.current;
    if (!video || !duration) {
      rafRef.current = null;
      return;
    }
    const current = video.currentTime;
    const diff = targetRef.current - current;
    if (Math.abs(diff) < 0.004) {
      video.currentTime = targetRef.current;
      rafRef.current = null;
      return;
    }
    video.currentTime = current + diff * 0.18;
    rafRef.current = requestAnimationFrame(runScrub);
  }, []);

  React.useEffect(() => {
    if (reduce) return;

    // The video may already be loaded (from cache) before React attaches the
    // onLoadedMetadata handler, so capture the duration here too — otherwise the
    // scrub guard sees duration 0 and never runs.
    const video = videoRef.current;
    if (video && video.readyState >= 1 && Number.isFinite(video.duration)) {
      durationRef.current = Math.max(0, video.duration - 0.05);
      video.pause();
    }

    const onScroll = () => {
      const track = trackRef.current;
      const duration = durationRef.current;
      if (!track || !duration) return;

      const rect = track.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      // How far the track's top has travelled above the viewport top.
      const scrolled = -rect.top;
      const progress =
        distance <= 0 ? 0 : Math.min(Math.max(scrolled / distance, 0), 1);

      targetRef.current = progress * duration;
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(runScrub);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [reduce, runScrub]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    // A hair under duration: seeking exactly to the end can blank some decoders.
    durationRef.current = Math.max(0, video.duration - 0.05);
    video.pause();
  };

  return (
    <div
      ref={trackRef}
      className={cn("relative", className)}
      style={{ height: reduce ? "100svh" : `${trackVh}svh` }}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Cinematic scrim: a flat darken plus a top→bottom gradient keeps white
            headline text legible over any frame of the clip, in either theme. */}
        <div aria-hidden className="absolute inset-0 bg-black/55" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70"
        />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          {children}
        </div>

        {/* Scroll affordance. */}
        {!reduce && (
          <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
            <span className="overline text-white/60">Scroll</span>
          </div>
        )}
      </div>
    </div>
  );
}
