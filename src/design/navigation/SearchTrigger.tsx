import { Search } from "lucide-react";
import { Button } from "../components";
import styles from "./navigation.module.css";

export type SearchTriggerProps = {
  label?: string;
  onTrigger?: () => void;
  shortcut?: string;
};

export function SearchTrigger({
  label = "Search",
  onTrigger,
  shortcut = "⌘ K",
}: SearchTriggerProps) {
  const unavailable = !onTrigger;
  return (
    <Button
      className={styles.searchTrigger}
      disabled={unavailable}
      leftIcon={<Search />}
      onClick={onTrigger}
      size="sm"
      title={unavailable ? "Global search is not available" : undefined}
      variant="secondary"
    >
      <span>{label}</span>
      {!unavailable ? <kbd aria-hidden className={styles.searchShortcut}>{shortcut}</kbd> : null}
    </Button>
  );
}
