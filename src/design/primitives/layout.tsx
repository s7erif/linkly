import type { ElementType } from "react";
import styles from "./primitives.module.css";
import { alignClasses, gapClasses, justifyClasses, responsiveGapClasses } from "./primitive-classes";
import type { Align, Gap, Justify, PrimitiveProps } from "./types";
import { cx } from "./utils";

type FlexProps = {
  align?: Align;
  gap?: Gap;
  gapSm?: Gap;
  gapMd?: Gap;
  gapLg?: Gap;
  justify?: Justify;
  wrap?: boolean;
};

function flexClasses(props: FlexProps) {
  return cx(
    gapClasses[props.gap ?? "none"],
    props.gapSm && responsiveGapClasses.sm[props.gapSm],
    props.gapMd && responsiveGapClasses.md[props.gapMd],
    props.gapLg && responsiveGapClasses.lg[props.gapLg],
    alignClasses[props.align ?? "stretch"],
    justifyClasses[props.justify ?? "start"],
    props.wrap ? styles.wrap : styles.noWrap,
  );
}

export type StackProps<TElement extends ElementType = "div"> =
  PrimitiveProps<TElement, FlexProps>;

export function Stack<TElement extends ElementType = "div">({
  as,
  align,
  className,
  gap,
  gapSm,
  gapMd,
  gapLg,
  justify,
  wrap,
  ...props
}: StackProps<TElement>) {
  const Component: ElementType = as ?? "div";
  return (
    <Component
      className={cx(styles.stack, flexClasses({ align, gap, gapSm, gapMd, gapLg, justify, wrap }), className)}
      {...props}
    />
  );
}

export type InlineProps<TElement extends ElementType = "div"> =
  PrimitiveProps<TElement, FlexProps>;

export function Inline<TElement extends ElementType = "div">({
  as,
  align = "center",
  className,
  gap,
  gapSm,
  gapMd,
  gapLg,
  justify,
  wrap,
  ...props
}: InlineProps<TElement>) {
  const Component: ElementType = as ?? "div";
  return (
    <Component
      className={cx(styles.inline, flexClasses({ align, gap, gapSm, gapMd, gapLg, justify, wrap }), className)}
      {...props}
    />
  );
}

type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12;
type GridPropsOwn = {
  align?: Align;
  columns?: GridColumns;
  gap?: Gap;
  gapSm?: Gap;
  gapMd?: Gap;
  gapLg?: Gap;
  justify?: Justify;
};

const columnClasses: Record<GridColumns, string> = {
  1: styles.columns1, 2: styles.columns2, 3: styles.columns3, 4: styles.columns4,
  5: styles.columns5, 6: styles.columns6, 12: styles.columns12,
};

export type GridProps<TElement extends ElementType = "div"> =
  PrimitiveProps<TElement, GridPropsOwn>;

export function Grid<TElement extends ElementType = "div">({
  as,
  align = "stretch",
  className,
  columns = 1,
  gap,
  gapSm,
  gapMd,
  gapLg,
  justify = "start",
  ...props
}: GridProps<TElement>) {
  const Component: ElementType = as ?? "div";
  return (
    <Component
      className={cx(
        styles.grid,
        columnClasses[columns],
        gapClasses[gap ?? "none"],
        gapSm && responsiveGapClasses.sm[gapSm],
        gapMd && responsiveGapClasses.md[gapMd],
        gapLg && responsiveGapClasses.lg[gapLg],
        alignClasses[align],
        justifyClasses[justify],
        className,
      )}
      {...props}
    />
  );
}
