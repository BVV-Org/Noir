"use client";

import * as React from "react";
import { m, useInView, useReducedMotion } from "framer-motion";
import { MOTION_CONFIG } from "@/lib/animations/config";

/**
 * WordReveal — a statement rising into place one word at a time.
 *
 * The text is split on spaces (no SplitType dependency: fifteen lines of
 * React replace it); each word sits in its own overflow mask and rises as
 * the block scrolls into view, once. Screen readers get the intact string
 * via `aria-label`; the animated words are hidden from the tree.
 *
 * The in-view observer watches the WRAPPER, not the words: a word that
 * starts fully below its clip line has no visible box, so observing it
 * directly would never fire (IntersectionObserver measures the rect after
 * ancestor clipping).
 *
 * Reduced motion renders the plain string.
 */
export function WordReveal({
  text,
  className,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  as?: "span" | "h2" | "h3" | "p";
}) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });

  if (reduce) {
    return <Tag className={className}>{text}</Tag>;
  }

  const words = text.split(" ");

  return (
    <Tag className={className} aria-label={text}>
      <span aria-hidden ref={ref}>
        {words.map((word, i) => (
          <React.Fragment key={`${word}-${i}`}>
            <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <m.span
                className="inline-block will-change-transform"
                initial={{ y: "110%", opacity: 0.12 }}
                animate={inView ? { y: "0%", opacity: 1 } : undefined}
                transition={{
                  duration: 0.8,
                  delay: i * MOTION_CONFIG.wordStagger,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {word}
              </m.span>
            </span>
            {/* The space lives BETWEEN the masks: inside an inline-block it
                cannot produce inter-word spacing. */}
            {i < words.length - 1 ? " " : null}
          </React.Fragment>
        ))}
      </span>
    </Tag>
  );
}
