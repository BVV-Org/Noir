import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * EmptyState — nothing to show, and what to do about it.
 *
 * An empty screen is an invitation to act, not an apology. The copy says what
 * happened and offers the next move; the icon is decorative and hidden from
 * assistive tech, since the heading already carries the meaning.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-20 text-center",
        className
      )}
    >
      {Icon && (
        <div
          aria-hidden
          className="mb-6 flex size-12 items-center justify-center rounded-full bg-secondary/60"
        >
          <Icon className="size-5 text-muted-foreground" />
        </div>
      )}
      <h2 className="text-h5 font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="mt-3 max-w-sm text-small text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
