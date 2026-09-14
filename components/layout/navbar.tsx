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
 * Navbar — the sticky global header.
 *
 * A full-width frosted bar: translucent paper with a backdrop blur, and a
 * hairline that fades in only once content scrolls beneath it. At rest over the
 * top of a page there is no line at all, so the header belongs to the page
 * instead of sitting on it like a toolbar.
 *
 * Links are 14px/500 sentence case in mid gray, with the current section in
 * ink. No underline, no caps, no tracking — position and tone carry it.
 *
 * Still sticky, not fixed: it stays in flow, so no page has to reserve a top
 * offset and full-bleed sections keep working. The cart trigger is always
 * visible, including on mobile where Wishlist and Account fold into the
 * bottom bar.
 */
const navActions = [
  // Search lives on /shop, which owns the query params (TDD §9).
  { label: "Search", href: "/shop", icon: Search },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Account", href: "/account", icon: User },
];

const navItemClass =
  "whitespace-nowrap rounded-full px-3 py-1.5 text-small font-medium transition-colors duration-150 ease-premium";

const iconButtonClass = cn(
  "inline-flex size-10 items-center justify-center rounded-full text-muted-foreground",
  "transition-colors duration-150 ease-premium hover:bg-secondary hover:text-foreground"
);

export function Navbar() {
  const scrolled = useScrolled();
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b backdrop-blur-xl backdrop-saturate-150",
        "transition-[background-color,border-color] duration-200 ease-premium",
        scrolled
          ? "border-border bg-background/80"
          : "border-transparent bg-background/60"
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex shrink-0 items-center gap-1">
            <MobileMenu />
            <Logo />
          </div>

          <nav
            aria-label="Main"
            className="hidden items-center gap-0.5 lg:flex"
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
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-0.5">
            <ThemeToggle className={iconButtonClass} />
            {navActions.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className={cn(
                  iconButtonClass,
                  // Wishlist and Account are one tap away in the bottom bar.
                  label === "Search" ? "" : "hidden sm:inline-flex"
                )}
              >
                <Icon className="size-[18px]" strokeWidth={1.75} />
              </Link>
            ))}
            <CartTrigger />
          </div>
        </div>
      </Container>
    </header>
  );
}
