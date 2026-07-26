import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "glass" | "elevated" | "interactive";
type CardPadding = "none" | "sm" | "md" | "lg";

const variantStyles: Record<CardVariant, string> = {
  default: "workspace-card",
  glass: "workspace-glass",
  elevated: "bg-white border border-workspace-outline shadow-workspace-floating",
  interactive: "workspace-card cursor-pointer hover:shadow-workspace-hover hover:-translate-y-0.5",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-workspace-studio",
          variantStyles[variant],
          paddingStyles[padding],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
