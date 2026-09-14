import * as React from "react";
import { cn } from "@/lib/utils";
import { SmoothCaretInput } from "@/components/ui/smooth-caret-input";

/**
 * Input — a soft gray pill. No border at rest: the fill separates it from the
 * white surface beneath, and focus swaps the fill for a hairline plus ring.
 * 44px tall to satisfy touch targets.
 *
 * Renders through `SmoothCaretInput`, so every field in the app gets the
 * spring-tracked caret. That primitive falls back to a plain input for types
 * without selection support (`number`, `email`, dates), so this stays safe to
 * use for any field.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => (
    <SmoothCaretInput
      ref={ref}
      type={type}
      wrapperClassName="w-full"
      className={cn(
        "flex h-11 w-full rounded-full border border-transparent bg-secondary px-4 py-2 text-small text-foreground",
        "placeholder:text-muted-foreground",
        "transition-[background-color,border-color,box-shadow] duration-150 ease-premium hover:bg-accent/70",
        "focus-visible:border-input focus-visible:bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15 focus-visible:ring-offset-0",
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
      "flex min-h-28 w-full rounded-lg border border-transparent bg-secondary px-4 py-3 text-small text-foreground",
      "placeholder:text-muted-foreground",
      "transition-[background-color,border-color,box-shadow] duration-150 ease-premium hover:bg-accent/70",
      "focus-visible:border-input focus-visible:bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15 focus-visible:ring-offset-0",
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
