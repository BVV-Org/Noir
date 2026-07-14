"use client";

import * as React from "react";
import { m, useInView, useReducedMotion } from "framer-motion";
import { EASE, MOTION_CONFIG } from "@/lib/animations/config";
import { cn } from "@/lib/utils";

/**
 * CharReveal — a headline that arrives on two speeds at once.
 *
 * The move borrowed from the reference study (docs/motion-language.md §2): the
 * line is split to characters, each character gets its OWN overflow mask, and
 * then two animations run on the same words simultaneously —
 *
 *   characters   xPercent -100 → 0   fast   (0.8s, staggered 0.04s)
 *   parent line  xPercent  -12 → 0   slow   (1.4s, no stagger)
 *
 * The characters land while the line they sit in is still drifting behind
 * them. That is parallax inside the typography, and it is the whole effect: a
 * single-layer reveal cannot buy this depth at any duration. Set `from="right"`
 * on a following line so the two lines counter-move and the block resolves
 * inward.
 *
 * Words are kept whole (`inline-block` per word) so the headline still wraps on
 * word boundaries — splitting to characters must never let a line break land
 * mid-word.
 *
 * Accessibility: the intact string is exposed via `aria-label` and every
 * animated fragment is hidden from the tree, so a screen reader reads "Enter
 * the vault", not sixteen letters. Reduced motion renders the settled text
 * outright — a large transform is exactly what that preference forbids, and a
 * headline that never arrives converts at zero.
 */
export function CharReveal({
  text,
  className,
  as: Tag = "span",
  from = "left",
  delay = 0,
  mode = "mount",
}: {
  text: string;
  className?: string;
  as?: "span" | "h1" | "h2" | "p";
  /** Which edge the characters and the line drift in from. */
  from?: "left" | "right";
  /** Seconds. Offsets the whole two-layer sequence. */
  delay?: number;
  /** `mount` plays immediately (above the fold); `view` waits for scroll. */
  mode?: "mount" | "view";
}) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });

  if (reduce) {
    return <Tag className={className}>{text}</Tag>;
  }

  const play = mode === "mount" || inView;
  const sign = from === "left" ? -1 : 1;
  const words = text.split(" ");

  // Characters stagger across the WHOLE line, not per word, so the wave crosses
  // the headline evenly — a per-word index would restart the wave at each space.
  let charIndex = -1;

  return (
    <Tag className={className} aria-label={text}>
      {/*
        Layer 1 (slow): the line itself. It drifts a short distance over a long
        duration and is still moving after the characters have landed.
      */}
      <m.span
        ref={ref}
        aria-hidden
        className="block will-change-transform"
        initial={{ x: `${sign * MOTION_CONFIG.lineDrift}%` }}
        animate={play ? { x: "0%" } : undefined}
        transition={{
          duration: MOTION_CONFIG.lineDriftDuration,
          delay,
          ease: EASE.signature,
        }}
      >
        {words.map((word, w) => (
          <React.Fragment key={`${word}-${w}`}>
            {/* Whole words stay unbreakable so wrapping never splits a word. */}
            <span className="inline-block whitespace-nowrap">
              {Array.from(word).map((char, c) => {
                charIndex += 1;
                return (
                  // The mask. `pb`/`align-bottom` keep descenders from being
                  // clipped by the very overflow that creates the effect.
                  <span
                    key={`${char}-${c}`}
                    className="inline-block overflow-hidden pb-[0.08em] align-bottom"
                  >
                    {/*
                      Layer 2 (fast): the character. It slides a full mask-width
                      in far less time than the line takes to settle.

                      Same `sign` as the line above — both layers must travel
                      from the SAME side. Opposite signs make the two layers
                      cancel instead of stacking, and the depth vanishes.
                    */}
                    <m.span
                      className="inline-block will-change-transform"
                      initial={{ x: `${sign * 100}%` }}
                      animate={play ? { x: "0%" } : undefined}
                      transition={{
                        duration: MOTION_CONFIG.charDuration,
                        delay: delay + charIndex * MOTION_CONFIG.charStagger,
                        ease: EASE.signature,
                      }}
                    >
                      {char}
                    </m.span>
                  </span>
                );
              })}
            </span>
            {/* The space lives BETWEEN the word boxes: inside an inline-block
                it cannot produce inter-word spacing. */}
            {w < words.length - 1 ? " " : null}
          </React.Fragment>
        ))}
      </m.span>
    </Tag>
  );
}

/**
 * ClipWipe — reveal by moving the frame, not by fading the content.
 *
 * `inset(0 100% 0 0) → inset(0 0 0 0)`: the content is fully painted the whole
 * time and a clip edge travels across it. A fade says "content loaded"; a wipe
 * says "the frame moved", and only one of those is a brand (§4).
 */
export function ClipWipe({
  children,
  className,
  delay = 0,
  from = "left",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "left" | "right";
}) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  const closed =
    from === "left" ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)";

  return (
    <m.div
      className={cn("will-change-[clip-path]", className)}
      initial={{ clipPath: closed }}
      animate={{ clipPath: "inset(0 0% 0 0%)" }}
      transition={{ duration: 1.28, delay, ease: EASE.signature }}
    >
      {children}
    </m.div>
  );
}
