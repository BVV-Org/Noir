"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Layers, Package, ShoppingBag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { bottomNav, isActivePath, type NavIcon } from "@/lib/config/nav";

/**
 * MobileBottomNav — the primary navigation on small screens (TDD §14).
 *
 * Hidden from `lg` up, where the navbar carries the same links. Sits above the
 * home indicator via `env(safe-area-inset-bottom)`; the matching bottom padding
 * on `<main>` in the root layout keeps the last line of content clear of it.
 *
 * The config stores icon *names*, so the mapping to components lives here —
 * `lib/config/nav.ts` stays free of UI imports.
 */
const icons: Record<NavIcon, LucideIcon> = {
  home: Home,
  shop: ShoppingBag,
  collections: Layers,
  kits: Package,
  wishlist: Heart,
};

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    // The surface is spelled out rather than using `.glass`, which borders all
    // four sides and would draw a hairline down the screen edges.
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="flex items-stretch justify-around">
        {bottomNav.map((item) => {
          const Icon = icons[item.icon];
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[3.5rem] flex-col items-center justify-center gap-1 px-1 py-2",
                  "transition-colors duration-150 ease-premium",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="text-caption leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
