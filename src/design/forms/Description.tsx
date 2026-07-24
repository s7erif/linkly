import type { HTMLAttributes, ReactNode } from "react";
import { Text } from "../primitives";

export type DescriptionProps = {
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLParagraphElement>, "style" | "color">;

export function Description({ children, ...props }: DescriptionProps) {
  return <Text tone="muted" variant="small" {...props}>{children}</Text>;
}
