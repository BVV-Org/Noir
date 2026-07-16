/**
 * EASE — the curves the whole site moves on (see docs/motion-language.md).
 *
 * `signature` holds still for a beat, snaps through the middle, then glides a
 * long way into rest. That long tail is what gives motion apparent mass, and
 * it is the default for anything a visitor is meant to watch: headlines,
 * wipes, media. `exit` is its counterpart for things leaving. `settle` is the
 * short, near-linear curve for UI that must not feel slow — above all the CTA,
 * which has to be clickable the instant it is visible.
 *
 * Tuples, not strings: this is Framer Motion's cubic-bezier form.
 */
export const EASE = {
  signature: [0.496, 0.004, 0, 1],
  exit: [0.79, 0.19, 0.24, 0.98],
  settle: [0.16, 1, 0.3, 1],
} as const;

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
   * flicks; 160 was one swoop; 130 lets a single scroll clear the intro and
   * land on the content below — the hero can't hold a shopper hostage.
   */
  heroTrackVh: 130,
  /**
   * How fast the hero playhead chases the scroll target, per 60fps frame
   * (0–1). Higher = snappier / less lag; the easing is frame-rate-independent
   * so 120Hz Windows monitors behave the same as 60Hz laptops. Nudged up with
   * the shorter track so the tighter scrub still resolves fast and clean.
   */
  heroScrubEase: 0.3,

  /** Seconds between words in a WordReveal. */
  wordStagger: 0.03,
  /** Seconds a masked line takes to rise. */
  maskRiseDuration: 0.9,

  /**
   * CharReveal — the hero's two-speed headline (docs/motion-language.md §2).
   * Characters arrive fast; the line they sit in keeps drifting slowly behind
   * them, which is what manufactures depth from flat type. Keep `charDuration`
   * well under `lineDuration` or the two layers collapse into one.
   */
  charStagger: 0.04,
  charDuration: 0.8,
  lineDriftDuration: 1.4,
  /** How far the whole line drifts, in percent of its own width. */
  lineDrift: 12,

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
