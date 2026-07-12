import Link from "next/link";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { footerNav } from "@/lib/config/nav";
import { siteConfig } from "@/lib/config/site";

/**
 * Footer — the closing landmark of every page (DESIGN_SYSTEM.md §4).
 *
 * A Server Component: nothing here is interactive, so it ships zero JS.
 * Set entirely in the telemetry layer: mono caps columns over a full-width
 * ink rule, the way a print document ends. The root layout positions it as
 * a curtain reveal (sticky under the page content), so it must keep an
 * opaque background of its own.
 */
export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn("border-t border-foreground/20 bg-background", className)}
    >
      <Container>
        <div className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-6 text-small text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerNav.map((group) => (
              // The landmark borrows the visible heading as its accessible name,
              // rather than repeating it in an aria-label.
              <nav key={group.title} aria-labelledby={`footer-${group.title}`}>
                <h2
                  id={`footer-${group.title}`}
                  className="font-bold text-foreground overline"
                >
                  {group.title}
                </h2>
                <ul className="mt-5 flex flex-col gap-3">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground transition-colors duration-150 ease-premium hover:text-foreground"
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
          <p className="font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="overline">{siteConfig.tagline}</p>
        </div>
      </Container>
    </footer>
  );
}
