import { Bell } from "lucide-react";
import { Badge, Button } from "../components";
import { Box } from "../primitives";
import styles from "./navigation.module.css";

export type NotificationButtonProps = {
  count?: number;
  onTrigger?: () => void;
};

export function NotificationButton({ count = 0, onTrigger }: NotificationButtonProps) {
  const label = count > 0
    ? "Notifications, " + count + " unread"
    : "Notifications";

  return (
    <Box className={styles.notification}>
      <Button
        aria-label={label}
        iconOnly
        leftIcon={<Bell />}
        onClick={onTrigger}
        size="sm"
        variant="ghost"
      />
      {count > 0 ? (
        <Badge className={styles.notificationBadge} size="sm" variant="danger">
          {count > 99 ? "99+" : String(count)}
        </Badge>
      ) : null}
    </Box>
  );
}
