import type { ReactNode } from "react";
import { Inline } from "../primitives";
import styles from "./navigation.module.css";

export type HeaderActionsProps = {
  children: ReactNode;
};

export function HeaderActions({ children }: HeaderActionsProps) {
  return (
    <Inline className={styles.headerActions} gap="xs" justify="end">
      {children}
    </Inline>
  );
}
