import type { ComponentPropsWithoutRef, ElementType } from "react";

export type PrimitiveProps<
  TElement extends ElementType,
  TOwnProps extends object = object,
> = TOwnProps & {
  as?: TElement;
} & Omit<
  ComponentPropsWithoutRef<TElement>,
  keyof TOwnProps | "as" | "style" | "color"
>;

export type Gap = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type Align = "start" | "center" | "end" | "stretch" | "baseline";
export type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type Tone = "default" | "muted" | "subtle" | "accent" | "success" | "warning" | "danger" | "info";
