import type { ElementType } from "react";
import styles from "./primitives.module.css";
import { toneClasses } from "./primitive-classes";
import type { PrimitiveProps, Tone } from "./types";
import { cx } from "./utils";

export type TextVariant =
  | "displayXl"
  | "displayLg"
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "title"
  | "bodyLarge"
  | "body"
  | "small"
  | "caption"
  | "button"
  | "label"
  | "muted";
type TextOwnProps = { tone?: Tone; variant?: TextVariant };

const variantClasses: Record<TextVariant, string> = {
  displayXl: styles.displayXl, displayLg: styles.displayLg,
  display: styles.display, h1: styles.h1, h2: styles.h2, h3: styles.h3,
  h4: styles.h4, title: styles.title, bodyLarge: styles.bodyLarge,
  body: styles.body, small: styles.small, caption: styles.caption,
  button: styles.buttonText, label: styles.label, muted: styles.muted,
};

export type TextProps<TElement extends ElementType = "p"> =
  PrimitiveProps<TElement, TextOwnProps>;

export function Text<TElement extends ElementType = "p">({
  as,
  className,
  tone,
  variant = "body",
  ...props
}: TextProps<TElement>) {
  const Component: ElementType = as ?? "p";
  return <Component className={cx(styles.text, variantClasses[variant], toneClasses[tone ?? (variant === "muted" ? "muted" : "default")], className)} {...props} />;
}

type HeadingLevel = 1 | 2 | 3 | 4;
type HeadingVariant = "displayXl" | "displayLg" | "display" | "h1" | "h2" | "h3" | "h4" | "title";
type HeadingOwnProps = { level?: HeadingLevel; tone?: Tone; variant?: HeadingVariant };

const headingTags = { 1: "h1", 2: "h2", 3: "h3", 4: "h4" } as const;

export type HeadingProps = Omit<PrimitiveProps<"h1", HeadingOwnProps>, "as">;

export function Heading({
  className,
  level = 2,
  tone = "default",
  variant = level === 1 ? "h1" : level === 2 ? "h2" : level === 3 ? "h3" : "h4",
  ...props
}: HeadingProps) {
  const Component = headingTags[level];
  return <Component className={cx(styles.text, variantClasses[variant], toneClasses[tone], className)} {...props} />;
}
