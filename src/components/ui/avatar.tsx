"use client";

import { forwardRef, useState, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg" | "xl";

const sizeStyles: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-24 h-24 text-2xl",
};

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  size?: AvatarSize;
  fallback?: string;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt = "", size = "md", fallback, className, ...props }, ref) => {
    const [hasError, setHasError] = useState(false);
    const showFallback = !src || hasError;

    const initials = fallback
      ?.split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden",
          "border-2 border-white shadow-sm",
          showFallback && "bg-workspace-primary-muted text-workspace-primary font-semibold",
          sizeStyles[size],
          className,
        )}
        role="img"
        aria-label={alt || fallback || "Avatar"}
        {...props}
      >
        {!showFallback && (
          <img
            src={src!}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
          />
        )}
        {showFallback && (
          <span className="select-none leading-none">{initials}</span>
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";
