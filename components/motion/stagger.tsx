"use client";

import * as React from "react";
import { m } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations/variants";

/**
 * Stagger / StaggerItem — grids and lists (DESIGN_SYSTEM.md §5).
 *
 * The parent orchestrates; children carry no `initial`/`animate` of their own
 * and inherit the `hidden`/`visible` state through variant propagation. That is
 * what keeps a 12-card grid to one scroll observer instead of twelve.
 *
 * At 60ms per child the last of a 12-item grid starts ~660ms in, which is past
 * the point of feeling responsive — so the stagger is capped by keeping grids
 * to a page of items rather than by slowing the interval.
 */
export function Stagger({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "ul" | "section";
}) {
  const Component = m[as];

  return (
    <Component
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const Component = m[as];

  return (
    <Component className={className} variants={staggerItem}>
      {children}
    </Component>
  );
}
