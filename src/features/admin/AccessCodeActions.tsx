"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { revokeCardAccessCode } from "./actions";
import s from "@/features/admin/admin-records.module.css";

export function AccessCodeActions({ cardId, active }: { cardId: string; active: boolean }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  function disable() {
    if (!window.confirm("Disable the active access code? Customers will need a newly issued code.")) return;
    startTransition(async () => {
      const result = await revokeCardAccessCode(cardId);
      setMessage(result.ok ? "Disabled" : result.message);
    });
  }
  return <div className={s.actions}><Link className={s.secondary} href={`/admin/cards/${cardId}`}>Issue new</Link>{active && <button type="button" className={s.danger} disabled={pending} onClick={disable}>{pending ? "Disabling…" : "Disable"}</button>}{message && <small role="status">{message}</small>}</div>;
}
