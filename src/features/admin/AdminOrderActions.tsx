"use client";

import { CheckCircle2, Copy } from "lucide-react";
import { useState, useTransition } from "react";
import type { FulfillmentStatus, OrderStatus } from "@/types/order";
import s from "@/features/admin/admin-records.module.css";
import { advanceOrderAction, approveOrderAction, cancelOrderAction, type AdminOrderActionResult } from "./order-actions";

export function AdminOrderActions({ orderId, status, fulfillmentStatus }: { orderId:string; status:OrderStatus; fulfillmentStatus:FulfillmentStatus }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<AdminOrderActionResult | null>(null);
  const run = (action:(id:string)=>Promise<AdminOrderActionResult>) => startTransition(async()=>{
    const next = await action(orderId);
    setResult(next);
    if (next.ok) window.dispatchEvent(new CustomEvent("admin:order-updated", { detail: { orderId } }));
  });
  const nextLabel = fulfillmentStatus === "ACCESS_CODE_ISSUED" ? "Start printing" : fulfillmentStatus === "PRINTING" ? "Mark delivered" : fulfillmentStatus === "DELIVERED" ? "Complete" : null;
  return <div className={s.issue}>
    <div className={s.actions}>
      {status === "PENDING" && <button className={s.primary} disabled={pending} onClick={()=>run(approveOrderAction)}>{pending?"Working…":"Approve"}</button>}
      {["DRAFT","SUBMITTED","PENDING"].includes(status) && <button className={s.secondary} disabled={pending} onClick={()=>run(cancelOrderAction)}>Cancel</button>}
      {status === "FULFILLED" && nextLabel && <button className={s.primary} disabled={pending} onClick={()=>run(advanceOrderAction)}>{pending?"Working…":nextLabel}</button>}
    </div>
    {result && !result.ok && <p className={s.error} role="alert">{result.message}</p>}
    {result?.ok && <section className={s.successResult} role="status"><header className={s.successHeader}><CheckCircle2 aria-hidden /><div><strong>Action completed</strong><p>{result.message}</p></div></header>{result.issuedCodes?.length ? <div aria-label="Generated card access codes" className={s.issuedCodes}>{result.issuedCodes.map((item,index)=><article className={s.issuedCodeCard} key={item.cardId}><span>Card #{index+1}</span><strong>{item.cardName}</strong><code>{item.code}</code><button aria-label={`Copy access code for ${item.cardName}`} className={s.secondary} onClick={()=>void navigator.clipboard.writeText(item.code)}><Copy aria-hidden />Copy code</button></article>)}</div> : null}{result.issuedCodes?.length ? <p className={s.successNotice}>These plaintext codes are shown once. Copy or print them before leaving this page.</p> : null}</section>}
  </div>;
}
