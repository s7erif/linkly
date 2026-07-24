import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Icon, Inline, Text } from "../primitives";
import type { BreadcrumbItemModel } from "./types";
import styles from "./navigation.module.css";

export type BreadcrumbProps = {
  items: readonly BreadcrumbItemModel[];
  label?: string;
};

export function Breadcrumb({ items, label = "Breadcrumb" }: BreadcrumbProps) {
  return (
    <nav aria-label={label}>
      <Inline as="ol" className={styles.breadcrumbList} gap="xs">
        {items.map((item, index) => {
          const current = item.current ?? index === items.length - 1;
          return (
            <li className={styles.breadcrumbItem} key={item.id}>
              {index > 0 ? (
                <Icon className={styles.breadcrumbSeparator} size="xs">
                  <ChevronRight />
                </Icon>
              ) : null}
              {item.href && !current ? (
                <Link className={styles.breadcrumbLink} href={item.href}><Text as="span" variant="small">{item.label}</Text></Link>
              ) : (
                <Text
                  aria-current={current ? "page" : undefined}
                  as="span"
                  className={styles.breadcrumbCurrent}
                  variant="small"
                >
                  {item.label}
                </Text>
              )}
            </li>
          );
        })}
      </Inline>
    </nav>
  );
}
