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
import { CartTrigger } from "@/components/commerce/cart-trigger";

/**
 * Navbar — the sticky global header (DESIGN_SYSTEM.md §4).
 *
 * Everything in the bar lives in the telemetry layer: small uppercase mono,
 * one line, no decoration. Sticky rather than fixed: it stays in flow, so no
 * page has to reserve a top offset and full-bleed sections keep working. At
 * rest the bar is transparent against the substrate; once content scrolls
 * beneath it the glass surface and hairline fade in over 150ms.
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
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-colors duration-150 ease-premium",
        // Not the `.glass` utility: it borders all four sides, which paints a
        // stray hairline across the top of the viewport on a full-bleed bar.
        scrolled
          ? "border-foreground/15 bg-background/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
          <div className="flex items-center gap-1">
            <MobileMenu />
            <Logo />
          </div>

          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
            {mainNav.map((item) => {
              const active = isActivePath(pathname, item.href);
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

          <div className="flex items-center gap-1">
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
