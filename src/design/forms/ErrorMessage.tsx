import type { HTMLAttributes, ReactNode } from "react";
import { Text } from "../primitives";

export type ErrorMessageProps = {
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLSpanElement>, "style" | "color">;

export function ErrorMessage({ children, ...props }: ErrorMessageProps) {
  return <Text as="span" role="alert" tone="danger" variant="small" {...props}>{children}</Text>;
}
