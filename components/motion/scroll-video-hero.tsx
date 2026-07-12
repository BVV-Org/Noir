"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MOTION_CONFIG } from "@/lib/animations/config";

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
 * Smoothness / the Windows stutter: the decoder can only service one seek at a
 * time, so we never issue a new `currentTime` while `video.seeking` is still
 * true — otherwise seeks pile up and hitch on slower GPUs. The easing is also
 * frame-rate-independent (eased by elapsed time, not per-frame), so a 60Hz
 * laptop and a 144Hz monitor scrub at the same speed. Track height and chase
 * speed live in `MOTION_CONFIG` (heroTrackVh / heroScrubEase).
 *
 * Reduced-motion: no scrubbing and no tall track — the stage is one viewport and
 * the video holds on its first frame as a still poster.
 */
export function ScrollVideoHero({
  src,
  poster,
  children,
  trackVh = MOTION_CONFIG.heroTrackVh,
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
  // Our own eased playhead, decoupled from `video.currentTime`: reading the
  // element back would fold decode lag into the easing and make it judder.
  const playheadRef = React.useRef(0);
  const lastTsRef = React.useRef<number | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const reduce = useReducedMotion();

  // Ease the playhead toward the scroll target so a fast scroll still glides.
  const runScrub = React.useCallback(() => {
    const video = videoRef.current;
    const duration = durationRef.current;
    if (!video || !duration) {
      rafRef.current = null;
      lastTsRef.current = null;
      return;
    }

    const now = performance.now();
    // Clamp dt so returning to a backgrounded tab doesn't fling the playhead.
    const dt = Math.min(now - (lastTsRef.current ?? now), 50);
    lastTsRef.current = now;

    const current = playheadRef.current;
    const target = targetRef.current;
    const diff = target - current;

    if (Math.abs(diff) < 0.004) {
      // Settle exactly, precisely (fastSeek only lands on a keyframe).
      playheadRef.current = target;
      if (!video.seeking) video.currentTime = target;
      rafRef.current = null;
      lastTsRef.current = null;
      return;
    }

    // Frame-rate-independent easing: the same fraction of the gap is closed per
    // millisecond regardless of monitor refresh rate.
    const factor = 1 - Math.pow(1 - MOTION_CONFIG.heroScrubEase, dt / 16.667);
    const next = current + diff * factor;
    playheadRef.current = next;

    // Only hand the decoder a new seek once the last one has finished; issuing
    // seeks faster than it can service them is what hitches on Windows.
    if (!video.seeking) {
      if (typeof video.fastSeek === "function") video.fastSeek(next);
      else video.currentTime = next;
    }

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
