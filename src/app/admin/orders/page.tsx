import { CalendarDays, CircleDollarSign, Clock3, Download, Search, ShoppingBag, WalletCards } from "lucide-react";
import { adminReadService } from "@/lib/composition-root";
import { AdminPageHeader, Button, Card } from "@/design/components";
import { Box, Grid, Heading, Inline, Stack, Text } from "@/design/primitives";
import { Pagination, label } from "@/features/admin/AdminReadUI";
import { first, pageHref, type SearchRecord } from "@/features/admin/admin-query";
import { OrdersDataGrid, type OrderGridRow } from "./OrdersDataGrid";
import styles from "./orders.module.css";

const orderStatuses = ["DRAFT","SUBMITTED","PENDING","APPROVED","FULFILLED","COMPLETED","CANCELLED"] as const;
const paymentStatuses = ["PENDING","PAID","REFUNDED","FAILED"] as const;
function badgeVariant(value:string):"success"|"danger"|"warning"|"neutral"{return value==="PAID"||value==="COMPLETED"?"success":value==="CANCELLED"||value==="FAILED"?"danger":value==="PENDING"?"warning":"neutral"}

export default async function AdminOrdersPage({searchParams}:{searchParams:Promise<SearchRecord>}){
 const params=await searchParams;
 const query={search:first(params.search),status:first(params.status),paymentStatus:first(params.paymentStatus),from:first(params.from),to:first(params.to),page:first(params.page),pageSize:first(params.pageSize),sortBy:first(params.sortBy),sortDirection:first(params.sortDirection),package:"DIGITAL" as const};
 const result=await adminReadService.listOrders(query);
 const orders=result.items;
 const today=new Date();today.setHours(0,0,0,0);
 const snapshot=[
  [CalendarDays,"Today’s orders",orders.filter(order=>order.createdAt>=today).length,"Current page"],
  [WalletCards,"Paid orders",orders.filter(order=>order.paymentStatus==="PAID").length,"Current page"],
  [Clock3,"Pending payments",orders.filter(order=>order.paymentStatus==="PENDING").length,"Current page"],
  [ShoppingBag,"Cancelled orders",orders.filter(order=>order.status==="CANCELLED").length,"Current page"],
  [CircleDollarSign,"Monthly revenue",orders.filter(order=>order.paymentStatus==="PAID").reduce((sum,order)=>sum+(order.total??0),0)/100,"USD · current page"],
 ] as const;
 const csvRows=[["Order","Customer","Email","Package","Payment","Status","Workspace","Created"],...orders.map(order=>[order.orderNumber,order.customerName,order.email,order.planNameSnapshot??"Digital service",label(order.paymentStatus),label(order.status),label(order.fulfillmentStatus),order.createdAt.toISOString()])];
 const csv="data:text/csv;charset=utf-8,"+encodeURIComponent(csvRows.map(row=>row.map(value=>`"${String(value).replaceAll(`"`,`""`)}"`).join(",")).join("\n"));
 const resetHref="/admin/orders";
 const gridRows:readonly OrderGridRow[]=orders.map(order=>({billing:order.billingIntervalSnapshot?label(order.billingIntervalSnapshot):"One-time",created:order.createdAt.toLocaleDateString(),createdIso:order.createdAt.toISOString(),customer:order.customerName,email:order.email,id:order.id,number:order.orderNumber,packageName:order.planNameSnapshot??"Digital service",payment:label(order.paymentStatus),status:label(order.status),workspace:order.fulfillmentStatus==="COMPLETED"?"Ready":label(order.fulfillmentStatus)}));
 return <Stack className={styles.page} gap="xl">
  <AdminPageHeader actions={<Inline gap="lg"><Stack gap="xs"><Text tone="subtle" variant="caption">Last updated</Text><Text variant="small">{new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</Text></Stack><Stack gap="xs"><Text tone="subtle" variant="caption">Total results</Text><Text as="strong" variant="small">{result.total.toLocaleString()}</Text></Stack></Inline>} breadcrumbs={[{id:"overview",label:"Overview",href:"/admin"},{id:"orders",label:"Digital Orders",current:true}]} description="Manage digital business card purchases, subscriptions, and customer workspaces." eyebrow="Digital orders" title="Digital Orders"/>
  <section aria-labelledby="snapshot-title"><Heading className={styles.sectionTitle} id="snapshot-title" level={2} variant="title">Today’s snapshot</Heading><Grid className={styles.snapshot} columns={5} gap="md">{snapshot.map(([Icon,title,value,context])=><Card className={styles.metric} key={title}><Stack gap="md"><Inline justify="between"><Box aria-hidden className={styles.metricIcon}><Icon/></Box><Text tone="subtle" variant="caption">{context}</Text></Inline><Stack gap="xs"><Text tone="muted" variant="caption">{title}</Text><Text as="strong" className={styles.metricValue}>{typeof value==="number"?value.toLocaleString():value}</Text></Stack></Stack></Card>)}</Grid></section>
  <form className={styles.toolbar}><div className={styles.searchField}><label htmlFor="orders-search">Search</label><span><Search aria-hidden/><input defaultValue={query.search} id="orders-search" name="search" placeholder="Order, customer, email, company" type="search"/></span></div><label>Status<select defaultValue={query.status??""} name="status"><option value="">All statuses</option>{orderStatuses.map(value=><option key={value} value={value}>{label(value)}</option>)}</select></label><label>Payment<select defaultValue={query.paymentStatus??""} name="paymentStatus"><option value="">All payments</option>{paymentStatuses.map(value=><option key={value} value={value}>{label(value)}</option>)}</select></label><label>From<input defaultValue={query.from} name="from" type="date"/></label><label>To<input defaultValue={query.to} name="to" type="date"/></label><label>Sort<select defaultValue={query.sortBy??"createdAt"} name="sortBy"><option value="createdAt">Created</option><option value="orderNumber">Order number</option><option value="customerName">Customer</option><option value="status">Status</option></select></label><input name="sortDirection" type="hidden" value={query.sortDirection??"desc"}/><div className={styles.toolbarActions}><Button size="sm" type="submit" variant="primary">Apply</Button><Button as="a" href={resetHref} size="sm" variant="ghost">Reset filters</Button><Button as="a" download="digital-orders.csv" href={csv} leftIcon={<Download/>} size="sm" variant="secondary">Export CSV</Button></div></form>
  <section aria-labelledby="orders-table-title"><Inline className={styles.tableHeader} justify="between"><Stack gap="xs"><Heading id="orders-table-title" level={2} variant="title">Orders</Heading><Text tone="muted" variant="caption">{orders.length} digital order{orders.length===1?"":"s"} on this page</Text></Stack></Inline><OrdersDataGrid pagination={<Pagination page={result.page} totalPages={result.totalPages} href={page=>pageHref("/admin/orders",params,page)}/>} rows={gridRows}/></section>
 </Stack>
}
