import type { HTMLAttributes, ReactNode } from "react";
import { Heading, Stack, Surface } from "../primitives";
import { Description } from "./Description";
import styles from "./forms.module.css";

export type FormSectionProps = {
  children: ReactNode;
  description?: ReactNode;
  nested?: boolean;
  title?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "style" | "color" | "title">;

export function FormSection({ children, description, nested = false, title, ...props }: FormSectionProps) {
  return (
    <Surface
      as="section"
      className={nested ? styles.sectionNested : styles.section}
      radius="lg"
      variant={nested ? "standard" : "elevated"}
      {...props}
    >
      <Stack gap="md">
        {title || description ? (
          <Stack gap="xs">
            {title ? <Heading level={3} variant="title">{title}</Heading> : null}
            {description ? <Description>{description}</Description> : null}
          </Stack>
        ) : null}
        {children}
      </Stack>
    </Surface>
  );
}
