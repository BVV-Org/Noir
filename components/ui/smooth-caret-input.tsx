"use client";

import { m, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SmoothCaretInput — an `<input>` whose caret springs to its new position
 * instead of jumping. Adapted from skiper-ui/skiper106 into a shared primitive.
 *
 * Three deliberate departures from the vendored original:
 *
 * 1. **No `dialkit`.** The original shipped a live dev-tuning panel (and a
 *    floating on-screen button with it). The spring and font size are read from
 *    the element's own computed styles instead, so this stays a styling-driven
 *    primitive with no runtime UI of its own.
 * 2. **It never owns the value.** The original mirrored `value` into local
 *    state, which fights controlled inputs. This observes the DOM node through
 *    native events, so it drops into controlled *and* uncontrolled call sites
 *    (comboboxes, `Field` render props, plain forms) without touching them.
 * 3. **`m` not `motion`.** The app runs `LazyMotion` in strict mode; a full
 *    `motion` component throws there.
 *
 * The native caret is hidden via `caret-color: transparent` and replaced by an
 * absolutely-tracked bar, so the *real* input keeps every native behaviour
 * (IME, autofill, selection, spellcheck, form semantics).
 */

/** Firefox renders masked characters as ●; every other engine uses •. */
const PASSWORD_CHAR =
  typeof navigator !== "undefined" && /firefox|fxios/i.test(navigator.userAgent)
    ? "●"
    : "•";

const CARET_SPRING = { stiffness: 500, damping: 30, mass: 0.5 };
/** Effectively instant — respects prefers-reduced-motion without special-casing. */
const REDUCED_SPRING = { stiffness: 10000, damping: 100, mass: 0.1 };

/**
 * Only these types expose `selectionStart`. Reading it on `number`, `email`,
 * or a date type throws `InvalidStateError` in Chrome, so those render as a
 * plain input rather than a broken enhanced one.
 */
const SELECTION_SAFE = new Set(["text", "search", "password", "tel", "url"]);

function isSelectionSafe(type: string | undefined): boolean {
  return type === undefined || SELECTION_SAFE.has(type);
}

export type SmoothCaretInputProps = React.ComponentProps<"input"> & {
  /** Classes for the positioning wrapper — use for the flex/grid role the bare input used to hold. */
  wrapperClassName?: string;
};

export const SmoothCaretInput = React.forwardRef<
  HTMLInputElement,
  SmoothCaretInputProps
>(({ className, wrapperClassName, type = "text", ...props }, forwardedRef) => {
  const reduce = useReducedMotion();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const measureRef = React.useRef<HTMLSpanElement>(null);

  // A spring-backed value driven directly with `.set()`. Deliberately NOT
  // `useSpring(source)` — a spring following a source MotionValue stops
  // tracking after its first animation here, freezing the caret in place.
  const caretX = useSpring(0, reduce ? REDUCED_SPRING : CARET_SPRING);
  const caretOpacity = useMotionValue(0);

  const enhanced = isSelectionSafe(type);

  const setRefs = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef]
  );

  React.useEffect(() => {
    if (!enhanced) return;
    const input = inputRef.current;
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!input || !container || !measure) return;

    /** Copy the input's text metrics onto the measuring span so widths match. */
    const syncMeasureFont = (styles: CSSStyleDeclaration) => {
      let fontSize = styles.fontSize;
      // Non-Chrome engines render the bullet glyph larger than the text size.
      if (
        PASSWORD_CHAR === "•" &&
        input.type === "password" &&
        !/chrome|chromium|crios/i.test(navigator.userAgent)
      ) {
        fontSize = `${parseFloat(fontSize) + 6.25}px`;
      }
      measure.style.font = `${styles.fontStyle} ${styles.fontWeight} ${fontSize} ${styles.fontFamily}`;
      measure.style.letterSpacing = styles.letterSpacing;
      measure.style.fontFeatureSettings = styles.fontFeatureSettings;
      measure.style.fontVariationSettings = styles.fontVariationSettings;
      // Drive the caret's `em`-based height from the input's real font size.
      container.style.fontSize = styles.fontSize;
    };

    /** Which end of the selection the caret is actually sitting at. */
    const caretIndex = () => {
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      if (start === end) return start;
      return input.selectionDirection === "backward" ? start : end;
    };

    const sync = () => {
      if (document.activeElement !== input) return;

      const styles = window.getComputedStyle(input);
      syncMeasureFont(styles);

      const index = caretIndex();
      const before =
        input.type === "password"
          ? PASSWORD_CHAR.repeat(index)
          : input.value.slice(0, index);

      measure.textContent = before;

      const paddingLeft = parseFloat(styles.paddingLeft) || 0;
      const paddingRight = parseFloat(styles.paddingRight) || 0;
      const absolute =
        before.length > 0 ? measure.offsetWidth + paddingLeft : paddingLeft - 1;

      // Keep the caret inside the scrollport for text longer than the field.
      const maxScroll = Math.max(0, input.scrollWidth - input.clientWidth);
      const visibleRight = input.scrollLeft + input.clientWidth - paddingRight;
      const visibleLeft = input.scrollLeft + paddingLeft;
      if (absolute > visibleRight) {
        input.scrollLeft = Math.min(
          absolute - input.clientWidth + paddingRight,
          maxScroll
        );
      } else if (absolute < visibleLeft) {
        input.scrollLeft = Math.max(0, absolute - paddingLeft);
      }

      const position = absolute - input.scrollLeft;
      const minX = paddingLeft - 1;
      const maxX = input.clientWidth - paddingRight;
      caretX.set(Math.min(position, maxX));

      const hasSelection = input.selectionStart !== input.selectionEnd;
      const visible = position >= minX && position <= maxX + 1;
      caretOpacity.set(!visible || hasSelection ? 0 : 1);
    };

    /** Selection lands after the default action, so measure on the next frame. */
    const syncNextFrame = () => requestAnimationFrame(sync);
    const hide = () => caretOpacity.set(0);

    const onSelectionChange = () => {
      if (document.activeElement === input) syncNextFrame();
    };

    input.addEventListener("input", syncNextFrame);
    input.addEventListener("keydown", syncNextFrame);
    input.addEventListener("keyup", sync);
    input.addEventListener("click", syncNextFrame);
    input.addEventListener("focus", syncNextFrame);
    input.addEventListener("scroll", sync);
    input.addEventListener("blur", hide);
    document.addEventListener("selectionchange", onSelectionChange);
    document.fonts.addEventListener("loadingdone", sync);
    void document.fonts.ready.then(sync);

    const observer = new ResizeObserver(sync);
    observer.observe(container);

    sync();

    return () => {
      input.removeEventListener("input", syncNextFrame);
      input.removeEventListener("keydown", syncNextFrame);
      input.removeEventListener("keyup", sync);
      input.removeEventListener("click", syncNextFrame);
      input.removeEventListener("focus", syncNextFrame);
      input.removeEventListener("scroll", sync);
      input.removeEventListener("blur", hide);
      document.removeEventListener("selectionchange", onSelectionChange);
      document.fonts.removeEventListener("loadingdone", sync);
      observer.disconnect();
    };
  }, [enhanced, caretX, caretOpacity]);

  // Types without selection support get the native caret, unchanged.
  if (!enhanced) {
    return (
      <input ref={setRefs} type={type} className={className} {...props} />
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative grid grid-cols-1", wrapperClassName)}
    >
      <input
        {...props}
        ref={setRefs}
        type={type}
        className={cn(
          "col-start-1 row-start-1 [caret-color:transparent]",
          className
        )}
      />
      <span
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre"
      />
      <m.div
        aria-hidden
        className="pointer-events-none col-start-1 row-start-1 h-[1.1em] w-0.5 self-center bg-foreground"
        style={{ x: caretX, opacity: caretOpacity }}
      />
    </div>
  );
});
SmoothCaretInput.displayName = "SmoothCaretInput";
