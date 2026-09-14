import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { MaskRise } from "@/components/motion/mask-rise";

/**
 * Section — the vertical building block for pages. Provides consistent spacing
 * and an optional header: a 12px caption eyebrow, a tight semibold title, a
 * mid-gray supporting line, and a quiet "view all" pill.
 */
export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Small uppercase kicker above the title. */
  eyebrow?: string;
  /** Section heading. */
  title?: string;
  /** Supporting line under the title. */
  description?: string;
  /** Optional "view all" style link shown beside the title. */
  action?: { label: string; href: string };
  /** Remove the default max-width container (for full-bleed sections). */
  bleed?: boolean;
  /** Vertical padding scale. */
  spacing?: "sm" | "md" | "lg";
}

const spacingMap = {
  sm: "py-12 sm:py-16",
  md: "py-16 sm:py-24",
  lg: "py-24 sm:py-32",
} as const;

export function Section({
  eyebrow,
  title,
  description,
  action,
  bleed = false,
  spacing = "md",
  className,
  children,
  ...props
}: SectionProps) {
  const hasHeader = eyebrow || title || description || action;
  const Body = bleed ? React.Fragment : Container;

  return (
    <section className={cn(spacingMap[spacing], className)} {...props}>
      <Body>
        {hasHeader && (
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6 sm:mb-12">
            <div className="max-w-2xl">
              {eyebrow && <p className="mb-3 overline">{eyebrow}</p>}
              {title && (
                <MaskRise>
                  <h2 className="text-h2">{title}</h2>
                </MaskRise>
              )}
              {description && (
                <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
                  {description}
                </p>
              )}
            </div>

            {action && (
              <Link
                href={action.href}
                className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-small font-medium text-foreground transition-colors duration-150 ease-premium hover:bg-secondary"
              >
                {action.label}
                <ArrowRight className="size-3.5 transition-transform duration-150 ease-premium group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        )}
        {children}
      </Body>
    </section>
  );
}
