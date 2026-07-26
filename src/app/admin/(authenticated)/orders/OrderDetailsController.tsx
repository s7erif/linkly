"use client";

import { Activity, AlertTriangle, Package, WalletCards } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { AdminOrderActions } from "@/features/admin/AdminOrderActions";
import { label } from "@/features/admin/AdminReadUI";
import { Badge, Button, Drawer, ImagePreviewDialog, Skeleton } from "@/design/components";
import { Heading, Inline, Stack, Text } from "@/design/primitives";
import type { AdminOrderDetail } from "@/types/admin-read";
import { loadOrderDrawer } from "../entity-drawer-actions";
import { useCustomerActions } from "../customers/CustomerManager";
import styles from "./orders.module.css";

function badgeVariant(value: string): "success" | "danger" | "warning" | "neutral" {
  return value === "PAID" || value === "COMPLETED" ? "success" : value === "CANCELLED" || value === "FAILED" ? "danger" : value === "PENDING" ? "warning" : "neutral";
}

type OrderDrawerSeed = { customerName?: string; orderNumber?: string; status?: string };
const CACHE_TTL_MS = 60_000;

export function OrderDetailsController({ children }: { children: ReactNode }) {
  const { openViewById } = useCustomerActions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [seed, setSeed] = useState<OrderDrawerSeed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);
  const cacheRef = useRef(new Map<string, { detail: AdminOrderDetail; loadedAt: number }>());
  const inFlightRef = useRef(new Map<string, ReturnType<typeof loadOrderDrawer>>());

  const close = useCallback(() => {
    requestRef.current += 1;
    setSelectedId(null);
    setDetail(null);
    setSeed(null);
    setError(null);
    const url = new URL(window.location.href);
    if (!url.searchParams.has("orderId")) return;
    if (window.history.state?.oiDrawer === "order") window.history.back();
    else {
      url.searchParams.delete("orderId");
      window.history.replaceState(window.history.state, "", url);
    }
  }, []);

  const open = useCallback(async (orderId: string, updateUrl = true, nextSeed?: OrderDrawerSeed) => {
    const request = requestRef.current + 1;
    requestRef.current = request;
    setSelectedId(orderId);
    setSeed(nextSeed ?? null);
    setError(null);
    const cached = cacheRef.current.get(orderId);
    const fresh = cached && Date.now() - cached.loadedAt < CACHE_TTL_MS ? cached.detail : null;
    if (fresh) setDetail(fresh);
    else setDetail(null);
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (url.searchParams.get("orderId") !== orderId) {
        url.searchParams.set("orderId", orderId);
        window.history.pushState({ ...window.history.state, oiDrawer: "order" }, "", url);
      }
    }
    if (fresh) return;
    let requestPromise = inFlightRef.current.get(orderId);
    if (!requestPromise) {
      requestPromise = loadOrderDrawer(orderId);
      inFlightRef.current.set(orderId, requestPromise);
    }
    const result = await requestPromise;
    if (inFlightRef.current.get(orderId) === requestPromise) inFlightRef.current.delete(orderId);
    if (requestRef.current !== request) return;
    if (result.ok) {
      cacheRef.current.set(orderId, { detail: result.detail, loadedAt: Date.now() });
      setDetail(result.detail);
    }
    else setError(result.message);
  }, []);

  useEffect(() => {
    const syncFromUrl = () => {
      const orderId = new URL(window.location.href).searchParams.get("orderId");
      if (orderId) void open(orderId, false);
      else {
        requestRef.current += 1;
        setSelectedId(null);
        setDetail(null);
        setSeed(null);
        setError(null);
      }
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [open]);

  useEffect(() => {
    const refreshUpdatedOrder = (event: Event) => {
      const orderId = (event as CustomEvent<{ orderId?: string }>).detail?.orderId;
      if (!orderId) return;
      cacheRef.current.delete(orderId);
      if (selectedId === orderId) void open(orderId, false, seed ?? undefined);
    };
    window.addEventListener("admin:order-updated", refreshUpdatedOrder);
    return () => window.removeEventListener("admin:order-updated", refreshUpdatedOrder);
  }, [open, seed, selectedId]);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const trigger = (event.target as Element).closest<HTMLElement>("[data-order-detail]");
    const orderId = trigger?.dataset.orderDetail;
    if (!orderId) return;
    event.preventDefault();
    void open(orderId, true, { customerName: trigger.dataset.orderCustomer, orderNumber: trigger.dataset.orderNumber, status: trigger.dataset.orderStatus });
  };

  const latestPayment = detail?.paymentSubmissions[0] ?? null;
  const proof = latestPayment?.proof ?? null;
  const availableProof = proof && proof.publicUrl && proof.status === "READY" && !proof.deletedAt ? { ...proof, publicUrl: proof.publicUrl } : null;

  return (
    <div onClick={handleClick}>
      {children}
      {selectedId ? (
        <Drawer description={detail ? `${detail.order.customerName} · ${label(detail.order.status)}` : seed?.customerName && seed.status ? `${seed.customerName} · ${seed.status}` : "Loading order details"} onClose={close} title={detail?.order.orderNumber ?? seed?.orderNumber ?? "Order details"}>
          {error ? (
            <div className={styles.drawerState} role="alert">
              <AlertTriangle aria-hidden />
              <Heading level={3} variant="title">Unable to load order details</Heading>
              <Text tone="muted" variant="small">{error}</Text>
              <Button onClick={() => { cacheRef.current.delete(selectedId); void open(selectedId, false, seed ?? undefined); }} size="sm" variant="secondary">Try again</Button>
            </div>
          ) : !detail ? (
            seed ? <Stack aria-busy="true" aria-label="Loading complete order details" gap="lg"><section><Heading level={3} variant="title">Order summary</Heading><dl className={styles.detailList}>{seed.orderNumber ? <div><dt>Order</dt><dd>{seed.orderNumber}</dd></div> : null}{seed.customerName ? <div><dt>Customer</dt><dd>{seed.customerName}</dd></div> : null}{seed.status ? <div><dt>Status</dt><dd>{seed.status}</dd></div> : null}</dl></section><Text role="status" tone="muted" variant="small">Loading complete order details…</Text></Stack> : <Stack aria-busy="true" aria-label="Loading order details" gap="lg"><Skeleton variant="title"/><Skeleton variant="card"/></Stack>
          ) : (
            <Stack gap="xl">
              <section><Heading level={3} variant="title">Order summary</Heading><dl className={styles.detailList}><div><dt>Package</dt><dd>{detail.order.planNameSnapshot ?? "Digital service"}</dd></div><div><dt>Total</dt><dd>{detail.order.total != null ? `${(detail.order.total / 100).toLocaleString()} ${detail.order.currency ?? "USD"}` : "Not recorded"}</dd></div><div><dt>Created</dt><dd>{detail.order.createdAt.toLocaleString()}</dd></div></dl></section>
              <section><Heading level={3} variant="title">Customer information</Heading><dl className={styles.detailList}><div><dt>Name</dt><dd>{detail.order.customerName}</dd></div><div><dt>Email</dt><dd>{detail.order.email}</dd></div><div><dt>Phone</dt><dd>{detail.order.phone}</dd></div></dl></section>
              <section><Heading level={3} variant="title">Workspace information</Heading>{detail.cards.length ? <Stack gap="sm">{detail.cards.map((card) => <Inline className={styles.workspaceRow} justify="between" key={card.id}><Stack gap="xs"><Text as="strong" variant="small">{card.name}</Text><Text tone="muted" variant="caption">{card.slug} · {label(card.status)}</Text></Stack><Button as="a" href={`/workspace?adminCardId=${card.id}`} size="xs" variant="secondary">Open workspace</Button></Inline>)}</Stack> : <Text tone="muted" variant="small">Workspace creation has not completed.</Text>}</section>
              <section><Heading level={3} variant="title">Payment information</Heading>{latestPayment ? <dl className={styles.detailList}><div><dt>Payment method</dt><dd>{label(latestPayment.paymentMethod)}</dd></div><div><dt>Payment status</dt><dd><Badge variant={badgeVariant(detail.order.paymentStatus)}>{label(detail.order.paymentStatus)}</Badge></dd></div><div><dt>Amount</dt><dd>{(latestPayment.amount / 100).toLocaleString()}</dd></div><div><dt>Currency</dt><dd>{latestPayment.currency}</dd></div>{latestPayment.referenceNumber ? <div><dt>Reference number</dt><dd>{latestPayment.referenceNumber}</dd></div> : null}<div><dt>Payment date</dt><dd><time dateTime={latestPayment.submittedAt.toISOString()}>{latestPayment.submittedAt.toLocaleString()}</time></dd></div></dl> : <Text tone="muted" variant="small">No payment information recorded.</Text>}</section>
              <section><Heading level={3} variant="title">Payment proof</Heading>{availableProof ? <Stack gap="sm"><ImagePreviewDialog alt={`Payment proof for order ${detail.order.orderNumber}`} downloadName={availableProof.originalFilename ?? availableProof.fileName} height={availableProof.height} src={availableProof.publicUrl} title={availableProof.originalFilename ?? availableProof.fileName} uploadedAt={availableProof.createdAt.toISOString()} width={availableProof.width} /><dl className={styles.proofMeta}><div><dt>Uploaded</dt><dd><time dateTime={availableProof.createdAt.toISOString()}>{availableProof.createdAt.toLocaleString()}</time></dd></div><div><dt>Original filename</dt><dd>{availableProof.originalFilename ?? availableProof.fileName}</dd></div>{availableProof.width && availableProof.height ? <div><dt>Dimensions</dt><dd>{availableProof.width} × {availableProof.height} px</dd></div> : null}</dl></Stack> : <div className={styles.proofFallback}><Text tone="muted" variant="small">{proof ? "Payment proof unavailable. The file may be missing or deleted." : "No payment proof uploaded."}</Text></div>}</section>
              <section><Heading level={3} variant="title">Activity timeline</Heading><ol className={styles.timeline}><li><Activity aria-hidden /><span><strong>Order created</strong><small>{detail.order.createdAt.toLocaleString()}</small></span></li>{detail.paymentSubmissions.map((payment) => <li key={payment.id}><WalletCards aria-hidden /><span><strong>Payment {label(payment.status).toLowerCase()}</strong><small>{payment.submittedAt.toLocaleString()}</small></span></li>)}{detail.approvalHistory.map((entry) => <li key={entry.id}><Package aria-hidden /><span><strong>{label(entry.action)}</strong><small>{entry.createdAt.toLocaleString()}</small></span></li>)}</ol></section>
              <section><Heading level={3} variant="title">Internal notes</Heading><Text tone="muted" variant="small">{detail.order.notes ?? "No internal notes."}</Text></section>
              <Inline gap="sm" wrap>{detail.customer ? <Button onClick={() => openViewById(detail.customer!.id)} size="sm" variant="secondary">Open customer</Button> : null}{["DRAFT", "SUBMITTED", "PENDING"].includes(detail.order.status) ? <AdminOrderActions fulfillmentStatus={detail.order.fulfillmentStatus} orderId={detail.order.id} status={detail.order.status} /> : null}</Inline>
            </Stack>
          )}
        </Drawer>
      ) : null}
    </div>
  );
}
