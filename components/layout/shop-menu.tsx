"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { shopMenu } from "@/lib/config/nav";
import { EASE } from "@/lib/animations/config";

/**
 * ShopMenu — the desktop "Shop" nav item with an audience mega-menu.
 *
 * Fragrance shoppers self-select by "who is it for" before anything else, so
 * hovering (or focusing, or clicking) Shop reveals For Him / For Her / Unisex
 * as first-class entry points into a pre-filtered grid. The trigger itself is
 * still a real link to /shop, so a plain click on it — or a keyboard Enter —
 * lands on the full catalogue; the panel is an accelerant, never a gate.
 *
 * Interaction model:
 *  - Pointer: open on hover of the whole group, with a short close delay so a
 *    diagonal slip from the trigger to a panel row doesn't dismiss it.
 *  - Keyboard: focus opens; Escape closes and returns focus to the trigger;
 *    Tab out closes when focus leaves the group. The panel is a real list of
 *    links, so native tabbing walks the items in order.
 *  - Reduced motion: the panel appears without travel or scale.
 *
 * The panel is absolutely positioned under the trigger and never shifts the
 * bar's layout, so the header height is identical whether it is open or closed.
 */
export function ShopMenu({
  active,
  triggerClassName,
}: {
  active: boolean;
  /** The navbar's shared item styling, so Shop matches its siblings exactly. */
  triggerClassName: string;
}) {
  const [open, setOpen] = React.useState(false);
  const reduce = useReducedMotion();
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const groupRef = React.useRef<HTMLDivElement>(null);

  const clearClose = React.useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  // Small grace period on leave: the pointer often clips the gap between the
  // trigger and the panel, and an instant close there feels broken.
  const scheduleClose = React.useCallback(() => {
    clearClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, [clearClose]);

  React.useEffect(() => clearClose, [clearClose]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && open) {
      setOpen(false);
      // Return focus to the trigger so the sequence is not lost.
      const trigger = groupRef.current?.querySelector<HTMLElement>("[data-shop-trigger]");
      trigger?.focus();
    }
  };

  // Close when focus leaves the whole group (keyboard Tab-out).
  const onBlur = (e: React.FocusEvent) => {
    if (!groupRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
  };

  return (
    <div
      ref={groupRef}
      className="relative"
      onPointerEnter={() => {
        clearClose();
        setOpen(true);
      }}
      onPointerLeave={scheduleClose}
      // Mouse-event fallback for environments that don't deliver pointer
      // events; both handlers are idempotent, so a double-fire is harmless.
      onMouseEnter={() => {
        clearClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => setOpen(true)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <Link
        href="/shop"
        data-shop-trigger
        aria-current={active ? "page" : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          triggerClassName,
          "relative py-2",
          active
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Shop
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 -bottom-px h-px bg-foreground transition-opacity duration-150 ease-premium",
            active || open ? "opacity-100" : "opacity-0"
          )}
        />
      </Link>

      <AnimatePresence>
        {open && (
          <m.div
            role="menu"
            aria-label="Shop by audience"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: EASE.settle }}
            // Bridge the visual gap under the trigger so the pointer never
            // crosses dead space on its way into the panel.
            className="absolute left-0 top-full z-50 pt-3"
          >
            <div className="w-[19rem] overflow-hidden rounded-lg border border-foreground/15 bg-background/95 p-1.5 shadow-xl backdrop-blur-md">
              {shopMenu.map((item, i) => (
                <m.div
                  key={item.href}
                  initial={reduce ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    ease: EASE.settle,
                    delay: reduce ? 0 : 0.04 + i * 0.05,
                  }}
                >
                  <Link
                    role="menuitem"
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group/item flex items-center justify-between rounded-md px-3 py-2.5",
                      "transition-colors duration-150 ease-premium",
                      "hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                    )}
                  >
                    <span className="font-display text-h4 uppercase leading-none tracking-[0.04em] text-foreground">
                      {item.label}
                    </span>
                    <span
                      aria-hidden
                      className="translate-x-0 font-mono text-muted-foreground opacity-0 transition-all duration-200 ease-premium group-hover/item:translate-x-0.5 group-hover/item:opacity-100"
                    >
                      →
                    </span>
                  </Link>
                </m.div>
              ))}

              <div className="mx-3 my-1.5 h-px bg-foreground/10" />

              <Link
                role="menuitem"
                href="/shop"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2",
                  "font-mono text-overline uppercase tracking-[0.08em] text-muted-foreground",
                  "transition-colors duration-150 ease-premium hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:outline-none"
                )}
              >
                All fragrances
                <span aria-hidden>→</span>
              </Link>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
