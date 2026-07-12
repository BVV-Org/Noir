import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { MaskRise } from "@/components/motion/mask-rise";

/**
 * Section — the vertical building block for pages. Provides consistent spacing
 * (8px rhythm) and an optional header with an overline, title, and "view all"
 * link. Homepage modules and content blocks compose from this.
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
  md: "py-20 sm:py-28",
  lg: "py-28 sm:py-36",
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
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-4xl">
              {eyebrow && <p className="mb-4 overline">{eyebrow}</p>}
              {title && (
                <MaskRise>
                  <h2 className="text-h2 text-foreground">{title}</h2>
                </MaskRise>
              )}
              {description && (
                <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                  {description}
                </p>
              )}
            </div>

            {action && (
              <Link
                href={action.href}
                className="group inline-flex items-center gap-1.5 pb-2 text-foreground overline transition-opacity hover:opacity-70"
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
