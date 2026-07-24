import { Activity, CalendarDays, CalendarRange, Download, Gauge, RadioTower, Search, Upload } from "lucide-react";
import { AdminPageHeader, Badge, Button, Card } from "@/design/components";
import { Box, Grid, Heading, Inline, Stack, Text } from "@/design/primitives";
import { getNfcCardService } from "@/lib/composition-root";
import { buildProfileUrl } from "@/lib/public-links";
import styles from "./activation-center.module.css";

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export default async function ActivationCenterPage() {
  const service = getNfcCardService();
  const [recent, summary] = await Promise.all([
    service.listForExport({ status: "ACTIVATED", sortDirection: "desc" }),
    service.summary(),
  ]);
  const now = new Date();
  const today = startOfDay(now);
  const week = new Date(today); week.setDate(week.getDate() - 6);
  const month = new Date(today.getFullYear(), today.getMonth(), 1);
  const activated = recent.filter((card) => card.activatedAt).sort((a, b) => (b.activatedAt?.getTime() ?? 0) - (a.activatedAt?.getTime() ?? 0));
  const activeInventory = Math.max(0, summary.TOTAL - summary.ARCHIVED);
  const successRate = activeInventory ? Math.round((summary.ACTIVATED / activeInventory) * 100) : 0;
  const metrics = [
    { icon: Gauge, label: "Activation success rate", value: `${successRate}%`, context: "Activated active inventory" },
    { icon: CalendarDays, label: "Today’s activations", value: activated.filter((card) => card.activatedAt && card.activatedAt >= today).length, context: "Since midnight" },
    { icon: CalendarRange, label: "This week", value: activated.filter((card) => card.activatedAt && card.activatedAt >= week).length, context: "Last seven days" },
    { icon: Activity, label: "This month", value: activated.filter((card) => card.activatedAt && card.activatedAt >= month).length, context: now.toLocaleString([], { month: "long" }) },
  ];
  const recentActivations = activated.slice(0, 6);
  const linkedCustomers = [...new Map(activated.filter((card) => card.customer).map((card) => [card.customer!.id, { ...card.customer!, activatedAt: card.activatedAt!, token: card.activationToken }])).values()].slice(0, 5);
  const linkedWorkspaces = [...new Map(activated.filter((card) => card.workspace).map((card) => [card.workspace!.id, { id: card.workspace!.id, slug: card.workspace!.primaryCard?.slug, activatedAt: card.activatedAt!, token: card.activationToken }])).values()].slice(0, 5);

  return <Stack className={styles.page} gap="xl">
    <AdminPageHeader actions={<Button as="a" href="/admin/cards" size="sm">Open NFC Cards</Button>} breadcrumbs={[{id:"overview",label:"Overview",href:"/admin"},{id:"activations",label:"Activation Center",current:true}]} description="Monitor activations, locate tokens, and move quickly into inventory workflows." eyebrow="Activation operations" title="Activation Center"/>

    <Grid aria-label="Activation overview" as="section" className={styles.metrics} columns={4} gap="md">
      {metrics.map(({ icon: Icon, label, value, context }) => <Card className={styles.metric} key={label}><Stack gap="md"><Inline justify="between"><Box aria-hidden className={styles.metricIcon}><Icon /></Box><Text tone="subtle" variant="caption">{context}</Text></Inline><Stack gap="xs"><Text tone="muted" variant="caption">{label}</Text><Text as="strong" className={styles.metricValue}>{value}</Text></Stack></Stack></Card>)}
    </Grid>

    <Grid as="section" className={styles.actionGrid} columns={2} gap="md">
      <Card className={styles.panel}>
        <Stack gap="md"><Stack gap="xs"><Heading level={2} variant="title">Quick activation lookup</Heading><Text tone="muted" variant="small">Enter an activation token to open the matching inventory result.</Text></Stack><form action="/admin/cards" className={styles.lookup}><label htmlFor="activation-token-search">Activation token</label><Inline gap="sm"><div className={styles.lookupField}><Search aria-hidden /><input autoComplete="off" id="activation-token-search" maxLength={10} minLength={8} name="search" placeholder="ABCD2345" required /></div><Button size="sm" type="submit" variant="secondary">Find token</Button></Inline></form></Stack>
      </Card>
      <Card className={styles.panel}>
        <Stack gap="md"><Stack gap="xs"><Heading level={2} variant="title">Quick actions</Heading><Text tone="muted" variant="small">Inventory operations remain in NFC Cards.</Text></Stack><Inline gap="sm" wrap><Button as="a" href="/admin/cards?action=generate" leftIcon={<RadioTower />} size="sm" variant="secondary">Generate tokens</Button><Button disabled leftIcon={<Upload />} size="sm" title="Card import is not available yet" variant="secondary">Import cards</Button><Button as="a" href="/api/admin/cards/export" leftIcon={<Download />} size="sm" variant="secondary">Export</Button></Inline></Stack>
      </Card>
    </Grid>

    <Grid as="section" className={styles.operationsGrid} columns={2} gap="md">
      <Card className={styles.timelinePanel}><Stack gap="md"><Stack gap="xs"><Heading level={2} variant="title">Activation activity</Heading><Text tone="muted" variant="small">Latest successful activation events.</Text></Stack>{recentActivations.length ? <ol className={styles.timeline}>{recentActivations.map((card) => <li key={card.id}><Box aria-hidden className={styles.timelineIcon}><Activity /></Box><span><strong>{card.activationToken} activated</strong><small>{card.customer?.displayName ?? "Customer linked"} · {card.activatedAt!.toLocaleString()}</small></span></li>)}</ol> : <Text className={styles.empty} tone="muted" variant="small">No activation activity yet.</Text>}</Stack></Card>
      <Card className={styles.panel}><Stack gap="md"><Inline justify="between"><Stack gap="xs"><Heading level={2} variant="title">Recent activations</Heading><Text tone="muted" variant="small">Newest linked physical cards.</Text></Stack><Badge variant="neutral">{recentActivations.length}</Badge></Inline>{recentActivations.length ? <ul className={styles.recordList}>{recentActivations.map((card) => <li key={card.id}><Stack gap="xs"><Button as="a" href={`/admin/cards?search=${encodeURIComponent(card.activationToken)}`} size="sm" variant="link">{card.activationToken}</Button><Text tone="muted" variant="caption">{card.customer?.displayName ?? "Customer linked"} · {card.workspace?.primaryCard?.slug ?? "Workspace pending"}</Text></Stack><time dateTime={card.activatedAt!.toISOString()}>{card.activatedAt!.toLocaleDateString()}</time></li>)}</ul> : <Text className={styles.empty} tone="muted" variant="small">No activated cards found.</Text>}</Stack></Card>
    </Grid>

    <Grid as="section" className={styles.operationsGrid} columns={2} gap="md">
      <Card className={styles.panel}><Stack gap="md"><Stack gap="xs"><Heading level={2} variant="title">Recently linked customers</Heading><Text tone="muted" variant="small">Customers connected through recent activations.</Text></Stack>{linkedCustomers.length ? <ul className={styles.recordList}>{linkedCustomers.map((customer) => <li key={customer.id}><Stack gap="xs"><Button data-customer-detail={customer.id} size="sm" variant="link">{customer.displayName}</Button><Text tone="muted" variant="caption">{customer.email ?? customer.token}</Text></Stack><time dateTime={customer.activatedAt.toISOString()}>{customer.activatedAt.toLocaleDateString()}</time></li>)}</ul> : <Text className={styles.empty} tone="muted" variant="small">No recently linked customers.</Text>}</Stack></Card>
      <Card className={styles.panel}><Stack gap="md"><Stack gap="xs"><Heading level={2} variant="title">Recently linked workspaces</Heading><Text tone="muted" variant="small">Workspaces reached through recent activations.</Text></Stack>{linkedWorkspaces.length ? <ul className={styles.recordList}>{linkedWorkspaces.map((workspace) => <li key={workspace.id}><Stack gap="xs">{workspace.slug ? <Button as="a" href={buildProfileUrl(workspace.slug)} size="sm" variant="link">{workspace.slug}</Button> : <Text tone="muted" variant="small">Workspace pending</Text>}<Text tone="muted" variant="caption">Token {workspace.token}</Text></Stack><time dateTime={workspace.activatedAt.toISOString()}>{workspace.activatedAt.toLocaleDateString()}</time></li>)}</ul> : <Text className={styles.empty} tone="muted" variant="small">No recently linked workspaces.</Text>}</Stack></Card>
    </Grid>
  </Stack>;
}
