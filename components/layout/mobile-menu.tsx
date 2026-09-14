"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { isActivePath, mainNav, shopMenu } from "@/lib/config/nav";
import { siteConfig } from "@/lib/config/site";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * MobileMenu — the navbar's off-canvas menu on small screens.
 *
 * Holds the full `mainNav` plus the destinations the bottom bar has no room
 * for. Radix supplies the focus trap and `Esc` handling; wrapping each link in
 * `SheetClose` dismisses the panel on navigation without a `usePathname`
 * effect, which would fire a frame late and let the sheet linger over the new
 * page.
 */
const secondaryNav = [
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Account", href: "/account" },
];

export function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-full text-foreground lg:hidden",
          "transition-colors duration-150 ease-premium hover:bg-secondary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        <Menu className="size-5" strokeWidth={1.75} />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[min(88vw,22rem)] gap-0 sm:max-w-sm"
      >
        <SheetTitle className="overline">Menu</SheetTitle>
        <SheetDescription className="sr-only">
          {siteConfig.tagline}
        </SheetDescription>

        <nav aria-label="Mobile" className="mt-8 flex flex-col">
          {mainNav.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <React.Fragment key={item.href}>
                <SheetClose asChild>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center border-b border-border py-3 text-h4 font-semibold",
                      "transition-colors duration-150 ease-premium",
                      active
                        ? "text-foreground"
                        : "text-foreground/70 hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                </SheetClose>

                {/* The audience cut lives directly beneath Shop, indented so it
                    reads as a subset rather than a peer destination. */}
                {item.href === "/shop" &&
                  shopMenu.map((sub) => (
                    <SheetClose asChild key={sub.href}>
                      <Link
                        href={sub.href}
                        className={cn(
                          "flex min-h-11 items-center border-b border-border py-2.5 pl-4 text-small",
                          "text-muted-foreground transition-colors duration-150 ease-premium hover:text-foreground"
                        )}
                      >
                        {sub.label}
                      </Link>
                    </SheetClose>
                  ))}
              </React.Fragment>
            );
          })}
        </nav>

        <nav aria-label="Secondary" className="mt-8 flex flex-col gap-1">
          {secondaryNav.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <SheetClose asChild key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center text-small font-medium",
                    "transition-colors duration-150 ease-premium",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        <p className="mt-auto pt-8 text-caption text-muted-foreground">
          {siteConfig.tagline}
        </p>
      </SheetContent>
    </Sheet>
  );
}
