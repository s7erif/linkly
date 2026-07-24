import { Building2, ChevronsUpDown } from "lucide-react";
import { Button } from "../components";
import type { WorkspaceSwitcherModel } from "./types";
import styles from "./navigation.module.css";

export type WorkspaceSwitcherProps = {
  model: WorkspaceSwitcherModel;
  onTrigger?: () => void;
};

export function WorkspaceSwitcher({ model, onTrigger }: WorkspaceSwitcherProps) {
  return (
    <Button
      aria-haspopup="menu"
      className={styles.workspaceSwitcher}
      leftIcon={<Building2 />}
      onClick={onTrigger}
      rightIcon={<ChevronsUpDown />}
      size="sm"
      variant="secondary"
    >
      {model.current.label}
    </Button>
  );
}
