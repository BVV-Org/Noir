import Link from "next/link";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { footerNav } from "@/lib/config/nav";
import { siteConfig } from "@/lib/config/site";

/**
 * Footer — the closing landmark of every page.
 *
 * A Server Component: nothing here is interactive, so it ships zero JS. Sits on
 * the `surface` tone one step off the page, so it reads as a separate layer
 * without a heavy rule. The root layout positions it as a curtain reveal
 * (sticky under the page content), so it keeps an opaque background of its own.
 */
export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-border bg-surface", className)}>
      <Container>
        <div className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-small text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerNav.map((group) => (
              // The landmark borrows the visible heading as its accessible name.
              <nav key={group.title} aria-labelledby={`footer-${group.title}`}>
                <h2
                  id={`footer-${group.title}`}
                  className="text-small font-medium text-foreground"
                >
                  {group.title}
                </h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="rounded-sm text-small text-muted-foreground transition-colors duration-150 ease-premium hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="rule" />

        <div className="flex flex-col items-start justify-between gap-2 py-8 sm:flex-row sm:items-center">
          <p className="text-caption text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-caption text-muted-foreground">
            {siteConfig.tagline}
          </p>
        </div>
      </Container>
    </footer>
  );
}
