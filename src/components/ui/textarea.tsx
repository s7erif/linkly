"use client";

import { forwardRef, useRef, useEffect, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  autoResize?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, autoResize = false, className, id, onChange, ...props }, forwardedRef) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const ref = (forwardedRef ?? internalRef) as React.RefObject<HTMLTextAreaElement>;
    const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    useEffect(() => {
      if (!autoResize || !internalRef.current) return;
      const el = internalRef.current;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
      onChange?.(e);
    };

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-[10px] font-bold uppercase tracking-[0.12em] text-workspace-text-muted"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "workspace-field-card flex",
            error && "!border-red-300",
          )}
        >
          <textarea
            ref={internalRef}
            id={textareaId}
            className={cn(
              "w-full bg-transparent border-none p-4 text-sm text-workspace-text-secondary leading-relaxed resize-none min-h-[100px] placeholder:text-workspace-text-muted/50 focus:outline-none",
              className,
            )}
            onChange={handleChange}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${textareaId}-error`} className="text-xs text-red-500 font-medium" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${textareaId}-hint`} className="text-xs text-workspace-text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";
