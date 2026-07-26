"use client";

import * as React from "react";

/**
 * GlassSurface — vendored from React Bits (JS + CSS variant), ported to TS.
 *
 * Refracts whatever sits *behind* it via `backdrop-filter` driven by a
 * generated SVG displacement map. Two things follow from that and are worth
 * knowing before reaching for it:
 *
 * - It only reads as glass when there is something textured behind it. Over a
 *   flat fill you get the bevel from the inset shadows and little else.
 * - Chromium only. Safari and Firefox are routed to a plain blur fallback by
 *   `supportsSVGFilters`, because neither renders `backdrop-filter: url(#…)`.
 *
 * Its styles live in `app/globals.css` (search `.glass-surface`) rather than a
 * sibling stylesheet: this project has no `postcss-import`, and a plain CSS
 * import from a component outside `app/` breaks the RSC module graph.
 *
 * Changes from the upstream source:
 * - The ResizeObserver effect was duplicated verbatim upstream, registering two
 *   observers per instance; kept one.
 * - `updateDisplacementMap` is a ref-held callback so the effects can declare
 *   honest dependencies instead of disabling exhaustive-deps.
 * - Theme handling moved to `.dark` selectors in the CSS — see that file.
 */

type Channel = "R" | "G" | "B";

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: Channel;
  yChannel?: Channel;
  mixBlendMode?: React.CSSProperties["mixBlendMode"];
  className?: string;
  style?: React.CSSProperties;
}

export function GlassSurface({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  displace = 0,
  backgroundOpacity = 0,
  saturation = 1,
  distortionScale = -180,
  redOffset = 0,
  greenOffset = 10,
  blueOffset = 20,
  xChannel = "R",
  yChannel = "G",
  mixBlendMode = "difference",
  className = "",
  style = {},
}: GlassSurfaceProps) {
  const uniqueId = React.useId().replace(/:/g, "-");
  const filterId = `glass-filter-${uniqueId}`;
  const redGradId = `red-grad-${uniqueId}`;
  const blueGradId = `blue-grad-${uniqueId}`;

  const [svgSupported, setSvgSupported] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const feImageRef = React.useRef<SVGFEImageElement>(null);
  const redChannelRef = React.useRef<SVGFEDisplacementMapElement>(null);
  const greenChannelRef = React.useRef<SVGFEDisplacementMapElement>(null);
  const blueChannelRef = React.useRef<SVGFEDisplacementMapElement>(null);
  const gaussianBlurRef = React.useRef<SVGFEGaussianBlurElement>(null);

  const updateDisplacementMap = React.useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    const actualWidth = rect?.width || 400;
    const actualHeight = rect?.height || 200;
    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
      </svg>
    `;

    feImageRef.current?.setAttribute(
      "href",
      `data:image/svg+xml,${encodeURIComponent(svgContent)}`
    );
  }, [
    borderWidth,
    borderRadius,
    brightness,
    opacity,
    blur,
    mixBlendMode,
    redGradId,
    blueGradId,
  ]);

  React.useEffect(() => {
    updateDisplacementMap();

    (
      [
        [redChannelRef, redOffset],
        [greenChannelRef, greenOffset],
        [blueChannelRef, blueOffset],
      ] as const
    ).forEach(([ref, offset]) => {
      const node = ref.current;
      if (!node) return;
      node.setAttribute("scale", (distortionScale + offset).toString());
      node.setAttribute("xChannelSelector", xChannel);
      node.setAttribute("yChannelSelector", yChannel);
    });

    gaussianBlurRef.current?.setAttribute("stdDeviation", displace.toString());
  }, [
    updateDisplacementMap,
    width,
    height,
    displace,
    distortionScale,
    redOffset,
    greenOffset,
    blueOffset,
    xChannel,
    yChannel,
  ]);

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    // The map is generated from the measured box, so it has to be regenerated
    // whenever that box changes — the card's hover reveal resizes this.
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(updateDisplacementMap);
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, [updateDisplacementMap]);

  React.useEffect(() => {
    // Safari and Firefox do not render `backdrop-filter: url(#…)`; both get the
    // plain-blur fallback rather than a surface that silently does nothing.
    const isWebkit =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    if (isWebkit || isFirefox) {
      setSvgSupported(false);
      return;
    }

    const probe = document.createElement("div");
    probe.style.backdropFilter = `url(#${filterId})`;
    setSvgSupported(probe.style.backdropFilter !== "");
  }, [filterId]);

  const containerStyle = {
    ...style,
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
    "--glass-frost": backgroundOpacity,
    "--glass-saturation": saturation,
    "--filter-id": `url(#${filterId})`,
  } as React.CSSProperties;

  return (
    <div
      ref={containerRef}
      className={`glass-surface ${
        svgSupported ? "glass-surface--svg" : "glass-surface--fallback"
      } ${className}`}
      style={containerStyle}
    >
      <svg
        className="glass-surface__filter"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          >
            <feImage
              ref={feImageRef}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="map"
            />

            <feDisplacementMap
              ref={redChannelRef}
              in="SourceGraphic"
              in2="map"
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="red"
            />

            <feDisplacementMap
              ref={greenChannelRef}
              in="SourceGraphic"
              in2="map"
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="green"
            />

            <feDisplacementMap
              ref={blueChannelRef}
              in="SourceGraphic"
              in2="map"
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="blue"
            />

            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>

      <div className="glass-surface__content">{children}</div>
    </div>
  );
}

export default GlassSurface;
