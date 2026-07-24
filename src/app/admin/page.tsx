import {
  Activity,
  ArrowRight,
  Building2,
  Check,
  CircleDollarSign,
  CreditCard,
  Database,
  Mail,
  PackageCheck,
  Plus,
  Server,
  ShoppingBag,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { adminReadService } from "@/lib/composition-root";
import { Badge, Button, Card, EmptyState } from "@/design/components";
import { Box, Grid, Heading, Inline, Stack, Text } from "@/design/primitives";
import styles from "./overview.module.css";

function formatLabel(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/^./, (character) => character.toUpperCase());
}

type Action = {
  href: string;
  icon: LucideIcon;
  label: string;
  primary?: boolean;
};

type AttentionItem = {
  count: number;
  description: string;
  href: string;
  icon: LucideIcon;
  label: string;
};

export default async function AdminOverview() {
  const data = await adminReadService.dashboard();
  const { metrics } = data;
  const revenue = metrics.monthlyRevenueMinor ?? metrics.revenueMinor ?? 0;
  const unpublishedCards = Math.max(metrics.totalCards - metrics.activeCards, 0);
  const ordersInProgress = Math.max(metrics.approvedOrders - metrics.completedOrders, 0);
  const currentDate = new Intl.DateTimeFormat("en", {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(data.generatedAt);

  const snapshot = [
    [UsersRound, "Customers", metrics.totalCustomers.toLocaleString(), `${metrics.activeCustomers.toLocaleString()} active`],
    [CreditCard, "Active cards", metrics.activeCards.toLocaleString(), `${metrics.totalCards.toLocaleString()} total`],
    [Building2, "Active workspaces", metrics.activeCustomers.toLocaleString(), "Customer access"],
    [CircleDollarSign, "Revenue", `${(revenue / 100).toLocaleString()} USD`, "Monthly snapshot"],
    [Activity, "Today’s activations", metrics.cardsCreatedToday.toLocaleString(), "Since 00:00 UTC"],
  ] as const;

  const actions: readonly Action[] = [
    { href: "/admin/orders", icon: ShoppingBag, label: "Digital Orders", primary: true },
    { href: "/admin/cards", icon: CreditCard, label: "Generate cards" },
    { href: "/admin/customers", icon: UsersRound, label: "Customers" },
    { href: "/admin/subscription-activations", icon: Building2, label: "Activation Center" },
  ];

  const attention: readonly AttentionItem[] = [
    {
      count: metrics.pendingOrders,
      description: "New orders awaiting an operator decision.",
      href: "/admin/orders?status=PENDING",
      icon: ShoppingBag,
      label: "Orders waiting review",
    },
    {
      count: unpublishedCards,
      description: "Cards that are not currently published.",
      href: "/admin/cards",
      icon: CreditCard,
      label: "Cards awaiting publication",
    },
    {
      count: ordersInProgress,
      description: "Approved orders still moving through fulfillment.",
      href: "/admin/orders",
      icon: PackageCheck,
      label: "Orders in fulfillment",
    },
  ];

  const services = [
    ["Database", Database, "Connected"],
    ["Storage", Building2, "Not monitored"],
    ["API", Server, "Connected"],
    ["Email", Mail, "Not monitored"],
    ["Workers", Activity, "Not monitored"],
  ] as const;

  const hasActivity = data.recentOrders.length > 0 || data.recentCustomers.length > 0;
  const attentionCount = attention.reduce((total, item) => total + item.count, 0);

  return (
    <Stack className={styles.overview} gap="xl">
      <header className={styles.welcome}>
        <Inline align="end" className={styles.welcomeLayout} gap="lg" justify="between" wrap>
          <Stack gap="xs">
            <Text as="p" className={styles.date} variant="caption">{currentDate}</Text>
            <Heading id="overview-title" level={1} variant="h2">Welcome back.</Heading>
            <Text className={styles.welcomeText} tone="muted" variant="small">
              {attentionCount > 0
                ? `${attentionCount} item${attentionCount === 1 ? "" : "s"} need attention across today’s operations.`
                : "Nothing needs immediate attention. Your operation is clear."}
            </Text>
          </Stack>
          <Text className={styles.updated} tone="subtle" variant="caption">
            Updated {data.generatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </Inline>
      </header>

      <nav aria-labelledby="quick-actions-title" className={styles.quickActionsSection}>
        <Text as="h2" className={styles.sectionLabel} id="quick-actions-title" variant="caption">Quick actions</Text>
        <Inline className={styles.quickActions} gap="sm" wrap>
          {actions.map(({ href, icon: Icon, label, primary }) => (
            <Button
              as="a"
              href={href}
              key={label}
              leftIcon={<Icon />}
              size="sm"
              variant={primary ? "primary" : "secondary"}
            >
              {label}
            </Button>
          ))}
        </Inline>
      </nav>

      <section aria-labelledby="snapshot-title">
        <Inline className={styles.sectionHeading} justify="between">
          <Heading id="snapshot-title" level={2} variant="title">Today’s snapshot</Heading>
          <Text tone="subtle" variant="caption">Live platform totals</Text>
        </Inline>
        <Grid className={styles.snapshotGrid} columns={5} gap="none">
          {snapshot.map(([Icon, label, value, hint]) => (
            <article className={styles.snapshotItem} key={label}>
              <Inline align="center" gap="sm"><Icon aria-hidden className={styles.snapshotIcon} /><Text tone="muted" variant="caption">{label}</Text></Inline>
              <Text as="strong" className={styles.snapshotValue}>{value}</Text>
              <Text tone="subtle" variant="caption">{hint}</Text>
            </article>
          ))}
        </Grid>
      </section>

      <Grid className={styles.commandGrid} columns={1} gap="lg">
        <Stack className={styles.operationsRail} gap="lg">
          <Card aria-labelledby="attention-title" className={styles.attentionCard}>
            <Stack gap="lg">
              <Inline align="start" justify="between">
                <Stack gap="xs">
                  <Heading id="attention-title" level={2} variant="h3">Needs attention</Heading>
                  <Text tone="muted" variant="small">The next decisions in your queue.</Text>
                </Stack>
                <Badge variant="neutral">{attentionCount} open</Badge>
              </Inline>

              <Stack as="ul" className={styles.attentionList} gap="none">
                {attention.map(({ count, description, href, icon: Icon, label }) => (
                  <li key={label}>
                    <Button
                      as="a"
                      aria-label={`${label}: ${count}`}
                      className={styles.attentionLink}
                      fullWidth
                      href={href}
                      rightIcon={<ArrowRight />}
                      variant="ghost"
                    >
                      <Inline className={styles.attentionContent} gap="md">
                        <Box aria-hidden className={styles.iconBox}><Icon /></Box>
                        <Stack className={styles.attentionCopy} gap="xs">
                          <Inline gap="sm">
                            <Text as="strong" variant="small">{label}</Text>
                            <Text as="span" className={styles.count} variant="caption">{count}</Text>
                          </Inline>
                          <Text tone="muted" variant="caption">{description}</Text>
                        </Stack>
                      </Inline>
                    </Button>
                  </li>
                ))}
              </Stack>
            </Stack>
          </Card>

          <Card aria-labelledby="status-title" className={styles.statusCard}>
            <Stack gap="md">
              <Inline justify="between">
                <Stack gap="xs">
                  <Heading id="status-title" level={2} variant="title">Platform status</Heading>
                  <Text tone="muted" variant="caption">Core services</Text>
                </Stack>
                <Inline className={styles.operational} gap="xs">
                  <Check aria-hidden />
                  <Text variant="caption">Read available</Text>
                </Inline>
              </Inline>
              <Grid className={styles.statusGrid} columns={1} gap="none">
                {services.map(([name, Icon, status]) => (
                  <Inline className={styles.statusRow} justify="between" key={name}>
                    <Inline gap="sm">
                      <Icon aria-hidden />
                      <Text variant="caption">{name}</Text>
                    </Inline>
                    <Text tone="subtle" variant="caption">{status}</Text>
                  </Inline>
                ))}
              </Grid>
            </Stack>
          </Card>
        </Stack>

        <Card aria-labelledby="activity-title" className={styles.activityCard}>
          <Stack gap="lg">
            <Inline align="start" justify="between">
              <Stack gap="xs">
                <Heading id="activity-title" level={2} variant="h3">Recent activity</Heading>
                <Text tone="muted" variant="small">The latest movement across your operation.</Text>
              </Stack>
              <Button as="a" href="/admin/orders" rightIcon={<ArrowRight />} size="sm" variant="link">View orders</Button>
            </Inline>

            {hasActivity ? (
              <Stack as="ol" className={styles.timeline} gap="none">
                {data.recentOrders.map((order) => (
                  <li key={`order-${order.id}`}>
                    <Box aria-hidden className={styles.timelineMarker}><ShoppingBag /></Box>
                    <Stack gap="xs">
                      <Text variant="small">
                        <strong>{order.orderNumber}</strong> {formatLabel(order.status).toLowerCase()}
                      </Text>
                      <Text tone="muted" variant="caption">
                        {order.customerName} · Order · {order.createdAt.toLocaleDateString()}
                      </Text>
                    </Stack>
                    <Button
                      aria-label={`Open order ${order.orderNumber}`}
                      data-order-detail={order.id}
                      data-order-customer={order.customerName}
                      data-order-number={order.orderNumber}
                      data-order-status={formatLabel(order.status)}
                      iconOnly
                      leftIcon={<ArrowRight />}
                      size="xs"
                      variant="ghost"
                    />
                  </li>
                ))}
                {data.recentCustomers.map((customer) => (
                  <li key={`customer-${customer.id}`}>
                    <Box aria-hidden className={styles.timelineMarker}><UsersRound /></Box>
                    <Stack gap="xs">
                      <Text variant="small"><strong>{customer.displayName}</strong> joined the platform</Text>
                      <Text tone="muted" variant="caption">
                        Customer · {customer.cardCount} card{customer.cardCount === 1 ? "" : "s"} · {customer.createdAt.toLocaleDateString()}
                      </Text>
                    </Stack>
                    <Button
                      aria-label={`View customer ${customer.displayName}`}
                      data-customer-detail={customer.id}
                      iconOnly
                      leftIcon={<ArrowRight />}
                      size="xs"
                      variant="ghost"
                    />
                  </li>
                ))}
              </Stack>
            ) : (
              <EmptyState
                icon={<Activity />}
                title="No recent activity"
                description="New customers and order changes will appear here."
              />
            )}
          </Stack>
        </Card>
      </Grid>
    </Stack>
  );
}
