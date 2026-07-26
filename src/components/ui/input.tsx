import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[10px] font-bold uppercase tracking-[0.12em] text-workspace-text-muted"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "workspace-field-card flex items-center",
            error && "!border-red-300",
          )}
        >
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-transparent border-none p-4 text-sm text-workspace-text-primary placeholder:text-workspace-text-muted/50 focus:outline-none",
              className,
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500 font-medium" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-workspace-text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
