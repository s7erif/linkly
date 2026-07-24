import { Inbox } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { EmptyState } from "../components";
import styles from "./data-grid.module.css";

export type EmptyTableStateProps = {
  actions?: ReactNode;
  description?: ReactNode;
  icon?: ReactElement;
  title?: ReactNode;
};

export function EmptyTableState({
  actions,
  description = "No records match the current view.",
  icon = <Inbox />,
  title = "No data",
}: EmptyTableStateProps) {
  return (
    <div className={styles.emptyTableState}>
      <EmptyState actions={actions} description={description} icon={icon} title={title} />
    </div>
  );
}
