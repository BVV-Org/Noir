import * as React from "react";
import { cn } from "@/lib/utils";

/** Input — a field on the dark surface. 44px tall to satisfy touch targets. */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-input bg-background px-3.5 py-2 text-small text-foreground",
        "placeholder:text-muted-foreground",
        "transition-colors duration-150 ease-premium hover:border-border/80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-28 w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-small text-foreground",
      "placeholder:text-muted-foreground",
      "transition-colors duration-150 ease-premium hover:border-border/80",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

const Label = React.forwardRef<HTMLLabelElement, React.ComponentProps<"label">>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-small font-medium text-foreground peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

/**
 * Field — label, control, and error message wired together (DESIGN_SYSTEM.md §4).
 *
 * The control receives `id`, `aria-describedby`, and `aria-invalid` from here
 * rather than from the call site, which is where those attributes get forgotten.
 * `children` is a render prop so the field owns the ids it hands out.
 */
export function Field({
  label,
  error,
  hint,
  id,
  required,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  id: string;
  required?: boolean;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
    required?: boolean;
  }) => React.ReactNode;
  className?: string;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-muted-foreground">
            *
          </span>
        )}
      </Label>

      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
        required,
      })}

      {hint && !error && (
        <p id={hintId} className="text-caption text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-caption text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export { Input, Textarea, Label };
