"use client";

import * as React from "react";
import ReactDOM from "react-dom";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MOTION_CONFIG } from "@/lib/animations/config";

/**
 * ScrollFrameHero — a scroll-scrubbed intro built from an image sequence drawn
 * to a <canvas>, not a scrubbed <video>.
 *
 * Why frames instead of video: seeking an MP4's `currentTime` from scroll is
 * the one thing mobile Safari refuses to do smoothly — it must fully buffer
 * first (slow to open), seeks land on sparse keyframes (clunky), and a paused,
 * seek-only video often will not paint at all on iOS (a blank hero). Preloaded
 * frames sidestep every one of those: each frame is a tiny WebP, the first one
 * paints the moment it arrives, and swapping the drawn frame is instant and
 * identical on every device — so the scrub is interactive on phones exactly
 * like it is on desktop.
 *
 * Mechanics mirror the old video version: a tall "scroll track" with a sticky,
 * full-screen stage. Scroll progress (0→1) maps to a frame index; the index is
 * eased toward its scroll target on a rAF loop (frame-rate independent) so a
 * fast flick still resolves as a smooth glide. Nothing here uses React state on
 * scroll, so scrolling never re-renders the tree.
 *
 * Reduced-motion: no track and no scrub — a single-viewport stage holding one
 * still frame.
 */
export function ScrollFrameHero({
  frameDir = "/hero-frames",
  frameCount = 60,
  frameVersion = "1",
  children,
  trackVh = MOTION_CONFIG.heroTrackVh,
  className,
}: {
  /** Directory of `f-001.webp … f-NNN.webp` frames (1-indexed, zero-padded). */
  frameDir?: string;
  frameCount?: number;
  /**
   * Cache-busting token appended to every frame URL. The frame filenames never
   * change (`f-001.webp` … `f-NNN.webp`), so when the underlying clip is
   * re-extracted a returning visitor — and any CDN — would otherwise keep
   * serving the previously cached bytes. The first frame is the worst hit: it's
   * preloaded as the LCP image, so it caches earliest and stickiest, which
   * shows up as a stale opening frame over a fresh scrub. Bump this whenever
   * the frames are replaced.
   */
  frameVersion?: string;
  children: React.ReactNode;
  /** Height of the scroll track in viewport units; larger = slower scrub. */
  trackVh?: number;
  className?: string;
}) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imagesRef = React.useRef<HTMLImageElement[]>([]);
  const loadedRef = React.useRef<boolean[]>([]);
  const targetRef = React.useRef(0); // scroll-driven target frame (float)
  const currentRef = React.useRef(0); // eased, currently-drawn frame (float)
  const lastDrawnRef = React.useRef(-1); // last integer frame actually painted
  const lastTsRef = React.useRef<number | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const reduce = useReducedMotion();
  const scrub = !reduce;

  const frameUrl = React.useCallback(
    (i: number) =>
      `${frameDir}/f-${String(i + 1).padStart(3, "0")}.webp?v=${frameVersion}`,
    [frameDir, frameVersion]
  );

  // Start downloading the very first frame during render — this emits a
  // <link rel="preload"> into the SSR HTML, so a phone begins fetching the
  // hero's first painted frame before any JS runs. It's the LCP element. The
  // `?v=` must match `frameUrl(0)` exactly or the preload is wasted.
  ReactDOM.preload(`${frameDir}/f-001.webp?v=${frameVersion}`, {
    as: "image",
    fetchPriority: "high",
  });

  // Nearest already-loaded frame to `idx`, searching outward — so a frame that
  // hasn't downloaded yet borrows its closest neighbour instead of blanking.
  const nearestLoaded = React.useCallback(
    (idx: number) => {
      const loaded = loadedRef.current;
      if (loaded[idx]) return idx;
      for (let d = 1; d < frameCount; d++) {
        if (loaded[idx - d]) return idx - d;
        if (loaded[idx + d]) return idx + d;
      }
      return -1;
    },
    [frameCount]
  );

  // Paint frame `idx` (rounded) covering the canvas, preserving aspect ratio.
  const draw = React.useCallback(
    (idx: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const clamped = Math.max(0, Math.min(frameCount - 1, Math.round(idx)));
      const use = nearestLoaded(clamped);
      if (use < 0) return;
      lastDrawnRef.current = clamped;

      const ctx = canvas.getContext("2d");
      const img = imagesRef.current[use];
      if (!ctx || !img) return;

      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(cw * dpr)) canvas.width = Math.round(cw * dpr);
      if (canvas.height !== Math.round(ch * dpr)) canvas.height = Math.round(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // object-cover math, with a ceiling on how far it may magnify.
      const ir = img.width / img.height;
      const cr = cw / ch;
      let dw: number;
      let dh: number;
      if (cr > ir) {
        dw = cw;
        dh = cw / ir;
      } else {
        dh = ch;
        dw = ch * ir;
      }

      /*
       * Plain `cover` fills the stage by scaling until the short edge matches,
       * which is fine on a landscape window (a 16:9 clip in a 1280×760 viewport
       * magnifies ~1.06x) but catastrophic on a portrait one: at 375×812 the
       * same clip is blown up 3.85x and 74% of the frame is thrown away, so the
       * bottle is cropped into an unreadable close-up.
       *
       * Capping the magnification keeps the composition intact. The remainder
       * letterboxes, which costs nothing here — the clip is a centred product
       * on black and the stage behind the canvas is already `bg-black`, so the
       * seam is invisible rather than a grey bar.
       */
      const MAX_ZOOM = 1.75;
      const maxWidth = cw * MAX_ZOOM;
      if (dw > maxWidth) {
        const scale = maxWidth / dw;
        dw *= scale;
        dh *= scale;
      }

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    },
    [frameCount, nearestLoaded]
  );

  // Preload frames. Frame 0 is fetched first and painted the instant it lands
  // (fast open); the rest stream in behind it and repaint if they are current.
  React.useEffect(() => {
    imagesRef.current = new Array(frameCount);
    loadedRef.current = new Array(frameCount).fill(false);

    let cancelled = false;

    const load = (i: number, priority: "high" | "low") => {
      const img = new Image();
      img.decoding = "async";
      img.setAttribute("fetchpriority", priority);
      img.onload = () => {
        loadedRef.current[i] = true;
        // Repaint if this frame is the one we currently want to show.
        if (Math.round(currentRef.current) === i || lastDrawnRef.current === -1) {
          draw(currentRef.current);
        }
      };
      img.src = frameUrl(i);
      imagesRef.current[i] = img;
    };

    // Frame 0 immediately (it paints the hero); the rest stream in behind first
    // paint, so on a phone they never compete with the page's critical work.
    load(0, "high");

    let next = 1;
    const pump = () => {
      if (cancelled) return;
      const batchEnd = Math.min(next + 4, frameCount);
      for (; next < batchEnd; next++) load(next, "low");
      if (next < frameCount) requestAnimationFrame(pump);
    };
    // Defer the bulk fetch until the browser is idle (falls back to a short
    // timeout) so the hero appears fast even on a slow connection.
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    if (typeof w.requestIdleCallback === "function") {
      w.requestIdleCallback(() => pump(), { timeout: 1200 });
    } else {
      window.setTimeout(() => pump(), 250);
    }

    return () => {
      cancelled = true;
    };
  }, [frameCount, frameUrl, draw]);

  // Ease the drawn frame toward the scroll target so a flick glides to rest.
  const runScrub = React.useCallback(() => {
    const now = performance.now();
    const dt = Math.min(now - (lastTsRef.current ?? now), 50);
    lastTsRef.current = now;

    const current = currentRef.current;
    const diff = targetRef.current - current;

    if (Math.abs(diff) < 0.35) {
      currentRef.current = targetRef.current;
      draw(currentRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
      return;
    }

    const factor = 1 - Math.pow(1 - MOTION_CONFIG.heroScrubEase, dt / 16.667);
    const next = current + diff * factor;
    currentRef.current = next;
    if (Math.round(next) !== lastDrawnRef.current) draw(next);

    rafRef.current = requestAnimationFrame(runScrub);
  }, [draw]);

  React.useEffect(() => {
    if (!scrub) return;

    const onScroll = () => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const progress =
        distance <= 0 ? 0 : Math.min(Math.max(scrolled / distance, 0), 1);

      targetRef.current = progress * (frameCount - 1);
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
  }, [scrub, runScrub, frameCount]);

  // Keep the canvas sharp and correctly framed across viewport/orientation
  // changes; redraw whatever frame is current.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onResize = () => draw(currentRef.current);
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div
      ref={trackRef}
      className={cn("relative", className)}
      style={{ height: scrub ? `${trackVh}svh` : "100svh" }}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full"
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

        {/* Scroll affordance — only when scroll actually drives the frames. */}
        {scrub && (
          <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
            <span className="overline text-white/60">Scroll</span>
          </div>
        )}
      </div>
    </div>
  );
}
