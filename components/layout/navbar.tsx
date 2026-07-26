"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { isActivePath, mainNav } from "@/lib/config/nav";
import { useScrolled } from "@/hooks/use-scrolled";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ShopMenu } from "@/components/layout/shop-menu";
import { CartTrigger } from "@/components/commerce/cart-trigger";

/**
 * Navbar — the sticky global header (DESIGN_SYSTEM.md §4).
 *
 * The bar is a floating glass capsule rather than a full-bleed strip: it insets
 * from all three edges so the page runs *under* it on every side, which is what
 * makes the blur legible — a full-width bar with a bottom hairline reads as a
 * solid band no matter how much backdrop-blur it carries.
 *
 * Glass here is four things stacked, not one: a translucent fill, the backdrop
 * blur itself, a hairline border, and an inset top highlight standing in for a
 * light source above. Drop any one and it flattens into a grey box.
 *
 * Still sticky, not fixed: it stays in flow, so no page has to reserve a top
 * offset and full-bleed sections keep working. Opacity firms up once content
 * scrolls beneath it — over the hero it should be barely there.
 *
 * The cart trigger is the last action and is always visible, including on
 * mobile where Wishlist and Account fold into the bottom bar — a shopper must
 * be able to reach their bag from any screen at any width.
 */
const navActions = [
  // Search lives on /shop, which owns the query params (TDD §9).
  { label: "Search", href: "/shop", icon: Search },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Account", href: "/account", icon: User },
];

const navItemClass =
  "whitespace-nowrap font-mono text-overline uppercase tracking-[0.08em] [word-spacing:-0.22em] transition-colors duration-150 ease-premium";

export function Navbar() {
  const scrolled = useScrolled();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full pt-3 sm:pt-4">
      <Container>
        <div
          className={cn(
            "flex h-16 items-center justify-between gap-4 px-4 lg:h-[4.5rem] lg:px-6",
            // Capsule: half the bar's height, so the ends read as true
            // semicircles at both the 64px and 72px heights.
            "rounded-full border backdrop-blur-xl",
            "transition-[background-color,border-color] duration-150 ease-premium",
            scrolled
              ? "border-foreground/15 bg-background/70"
              : "border-foreground/10 bg-background/35",
            // The inset highlight is what sells it as glass rather than a tint:
            // a bright top edge for the light above, a soft dark bottom edge for
            // the thickness, then an outer drop shadow to lift it off the page.
            "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),inset_0_-1px_0_0_rgba(0,0,0,0.06),0_8px_28px_-12px_rgba(0,0,0,0.45)]",
            "dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_-1px_0_0_rgba(0,0,0,0.35),0_10px_34px_-14px_rgba(0,0,0,0.85)]",
            // Positions the shine's clipping layer below.
            "relative"
          )}
        >
          {/*
            The sweep gets its OWN clipping layer rather than `overflow-hidden`
            on the capsule: the Shop mega-menu is absolutely positioned at
            `top-full` inside this same element, so clipping the capsule would
            cut the dropdown off at the bar's edge.

            `z-0` here with `z-10` on the three content groups keeps the shine
            behind the wordmark and links — passing a blurred highlight over the
            type would wash it out mid-sweep.
          */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-full"
          >
            <span className="nav-shine" />
          </div>
          {/* `shrink-0` + `nowrap`: the capsule's padding leaves less room than
              the old full-bleed bar, and without these the wordmark is the first
              thing to wrap, which forces the capsule taller. */}
          <div className="relative z-10 flex shrink-0 items-center gap-1 whitespace-nowrap">
            <MobileMenu />
            <Logo />
          </div>

          <nav
            aria-label="Main"
            className="relative z-10 hidden items-center gap-7 lg:flex"
          >
            {mainNav.map((item) => {
              const active = isActivePath(pathname, item.href);
              // Shop carries the audience mega-menu; the rest are plain links.
              if (item.href === "/shop") {
                return (
                  <ShopMenu
                    key={item.href}
                    active={active}
                    triggerClassName={navItemClass}
                  />
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    navItemClass,
                    "relative py-2",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 -bottom-px h-px bg-foreground transition-opacity duration-150 ease-premium",
                      active ? "opacity-100" : "opacity-0"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="relative z-10 flex shrink-0 items-center gap-1">
            <ThemeToggle
              className={cn(
                // Always visible — including mobile, where it's the only way to
                // reach dark mode. Matches the icon actions' ≥44px target.
                "inline-flex size-11 items-center justify-center rounded-md text-muted-foreground",
                "transition-colors duration-150 ease-premium hover:bg-accent hover:text-foreground"
              )}
            />
            {navActions.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className={cn(
                  // ≥44px targets even though these read as small icons (TDD §14).
                  "inline-flex size-11 items-center justify-center rounded-md text-muted-foreground",
                  "transition-colors duration-150 ease-premium hover:bg-accent hover:text-foreground",
                  // Wishlist and Account are one tap away in the bottom bar.
                  label === "Search" ? "" : "hidden sm:inline-flex"
                )}
              >
                <Icon className="size-5" strokeWidth={1.5} />
              </Link>
            ))}
            <CartTrigger />
          </div>
        </div>
      </Container>
    </header>
  );
}
