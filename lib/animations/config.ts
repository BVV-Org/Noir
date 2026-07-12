/**
 * MOTION_CONFIG — the one place to tune the scroll-animation kit.
 *
 * Consumed by the components in `components/motion/`. Numbers only; no
 * component imports here, so it is safe in both server and client modules.
 */
export const MOTION_CONFIG = {
  /** Lenis smoothing. Lower = smoother/heavier. 0.08–0.12 typical. */
  lerp: 0.1,
  /** Scroll speed multiplier for the wheel. */
  wheelMultiplier: 1,

  /**
   * Height of the scroll-video hero's scroll track, in viewport units.
   * The clip scrubs across `heroTrackVh - 100` vh of scrolling, so lower =
   * the whole intro completes in a single scroll gesture. 300 felt like three
   * flicks; ~160 lets one swoop finish it.
   */
  heroTrackVh: 160,
  /**
   * How fast the hero playhead chases the scroll target, per 60fps frame
   * (0–1). Higher = snappier / less lag; the easing is frame-rate-independent
   * so 120Hz Windows monitors behave the same as 60Hz laptops.
   */
  heroScrubEase: 0.24,

  /** Seconds between words in a WordReveal. */
  wordStagger: 0.03,
  /** Seconds a masked line takes to rise. */
  maskRiseDuration: 0.9,

  /** Parallax travel of media inside its frame, in percent (± each way). */
  parallaxTravel: 6,

  /** Marquee base speed, px per second. Negative scrolls left. */
  marqueeSpeed: -80,
  /** How strongly scroll velocity boosts the marquee (0 = none). */
  marqueeVelocityBoost: 0.35,

  /** How far a magnetic button pulls toward the cursor (0–1 of offset). */
  magneticStrength: 0.3,

  /** Scale the bottom card in a sticky stack settles to as it is covered. */
  stackScale: 0.94,
} as const;
