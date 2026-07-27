"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import type { AccountCenterData } from "@/types/account-center";

// ═══════════════════════════════════════════════════════════════════════════
// Context — bridges server→client data without prop drilling through layout
// ═══════════════════════════════════════════════════════════════════════════

const AccountDataContext = createContext<AccountCenterData | null | undefined>(undefined);

/** Provide account data to the sidebar without prop-drilling through the layout. */
export function AccountDataProvider({
  data,
  children,
}: {
  data: AccountCenterData | null;
  children: ReactNode;
}) {
  console.log("[TRACE:AccountDataProvider] MOUNTED — data:", data);
  console.log("[TRACE:AccountDataProvider] MOUNTED — data type:", typeof data, ", is null?", data === null, ", is undefined?", data === undefined);
  console.log("[TRACE:AccountDataProvider] MOUNTED — data JSON:", JSON.stringify(data));
  return (
    <AccountDataContext.Provider value={data}>
      {children}
    </AccountDataContext.Provider>
  );
}

/** Consume account data from the nearest AccountDataProvider. */
export function useAccountData(): AccountCenterData | null {
  const ctx = useContext(AccountDataContext);
  console.log("[TRACE:useAccountData] context value:", ctx);
  console.log("[TRACE:useAccountData] context type:", typeof ctx, ", is null?", ctx === null, ", is undefined?", ctx === undefined);
  // undefined = no provider mounted (e.g. admin workspace), gracefully return null
  if (ctx === undefined) {
    console.log("[TRACE:useAccountData] returning null because ctx is undefined (no provider mounted)");
    return null;
  }
  console.log("[TRACE:useAccountData] returning ctx as-is:", ctx);
  return ctx;
}

// ═══════════════════════════════════════════════════════════════════════════
// Inline SVG Icons (same pattern as sidebar.tsx nav icons)
// ═══════════════════════════════════════════════════════════════════════════

const ICONS: Record<string, ReactNode> = {
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  mail: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 4-10 8L2 4" />
    </svg>
  ),
  atSign: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  ),
  crown: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 4 3 12h14l3-12-6 4-4-8-4 8-6-4z" />
      <path d="M6 19h12" />
      <path d="M8 22h8" />
    </svg>
  ),
  calendar: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  clock: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  building: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="9" y1="6" x2="9" y2="6.01" />
      <line x1="15" y1="6" x2="15" y2="6.01" />
      <line x1="9" y1="10" x2="9" y2="10.01" />
      <line x1="15" y1="10" x2="15" y2="10.01" />
      <line x1="9" y1="14" x2="9" y2="14.01" />
      <line x1="15" y1="14" x2="15" y2="14.01" />
      <path d="M9 18h6v4H9z" />
    </svg>
  ),
  id: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <line x1="7" y1="9" x2="17" y2="9" />
      <line x1="7" y1="13" x2="13" y2="13" />
    </svg>
  ),
  card: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  settings: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  billing: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10v1" />
      <path d="M12 13v1" />
    </svg>
  ),
  invoice: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  bell: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  shield: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  help: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  logout: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  chevronRight: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  alert: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  infinity: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4z" />
    </svg>
  ),
  sparkles: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  ),
  profile: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function truncateId(id: string): string {
  if (id.length <= 12) return id;
  return id.slice(0, 6) + "…" + id.slice(-4);
}

// ═══════════════════════════════════════════════════════════════════════════
// Status badge
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  TRIAL: "bg-violet-50 text-violet-700 border-violet-200",
  TRIALING: "bg-violet-50 text-violet-700 border-violet-200",
  EXPIRED: "bg-red-50 text-red-600 border-red-200",
  CANCELED: "bg-slate-100 text-slate-500 border-slate-200",
  PAST_DUE: "bg-amber-50 text-amber-700 border-amber-200",
  SUSPENDED: "bg-slate-100 text-slate-500 border-slate-200",
  PENDING_PAYMENT: "bg-sky-50 text-sky-600 border-sky-200",
};

function StatusBadge({ status }: { status: string }) {
  const style =
    STATUS_STYLES[status] ??
    "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
        style,
      )}
    >
      {status === "ACTIVE" && ICONS.check}
      {status === "EXPIRED" && ICONS.alert}
      {status === "TRIAL" && ICONS.sparkles}
      {status === "TRIALING" && ICONS.sparkles}
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Section: Account Header
// ═══════════════════════════════════════════════════════════════════════════

function AccountHeader({ data }: { data: AccountCenterData }) {
  const { user } = data;
  const username = user.email?.split("@")[0] ?? "user";

  return (
    <div className="flex items-center gap-3 px-1">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-xl border-2 border-white/80 shadow-sm bg-workspace-primary-muted flex items-center justify-center text-workspace-primary font-bold text-sm shrink-0 overflow-hidden">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          initials(user.displayName)
        )}
      </div>

      {/* Name + email + username */}
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-bold text-workspace-text-primary leading-tight truncate">
          {user.displayName}
        </span>
        {user.email && (
          <span className="text-[11px] text-workspace-text-secondary truncate flex items-center gap-1">
            {ICONS.mail}
            {user.email}
          </span>
        )}
        <span className="text-[10px] text-workspace-text-muted font-medium">
          @{username}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Section: Subscription Card
// ═══════════════════════════════════════════════════════════════════════════

function SubscriptionCard({ data }: { data: AccountCenterData }) {
  const sub = data.subscription;

  // ── Empty: no subscription ──────────────────────────────────────────
  if (!sub) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 space-y-2">
        <div className="flex items-center gap-2">
          {ICONS.crown}
          <span className="text-xs font-bold text-slate-600">Free Plan</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Upgrade to unlock more cards, custom domains, and premium features.
        </p>
        <button
          type="button"
          className="text-[11px] font-semibold text-workspace-primary hover:underline"
        >
          View Plans →
        </button>
      </div>
    );
  }

  // ── Expired ─────────────────────────────────────────────────────────
  if (sub.status === "EXPIRED") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {ICONS.alert}
            <span className="text-xs font-bold text-red-700">Subscription Expired</span>
          </div>
          <StatusBadge status="EXPIRED" />
        </div>
        <p className="text-[11px] text-red-600 leading-relaxed">
          Renew to continue using premium features.
        </p>
      </div>
    );
  }

  // ── Active / Trial / Other ──────────────────────────────────────────
  return (
    <div className="rounded-xl border border-slate-100 bg-white/60 p-4 space-y-3">
      {/* Plan name + status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-workspace-primary">{ICONS.crown}</span>
          <span className="text-xs font-bold text-workspace-text-primary">
            {sub.planName}
          </span>
        </div>
        <StatusBadge status={sub.status} />
      </div>

      {/* Dates */}
      <div className="space-y-1.5">
        {sub.isLifetime ? (
          <div className="flex items-center gap-2 text-[11px] text-workspace-text-muted">
            {ICONS.infinity}
            <span className="font-medium text-workspace-text-secondary">
              Lifetime Plan
            </span>
          </div>
        ) : (
          <>
            {sub.startsAt && (
              <div className="flex items-center gap-2 text-[11px] text-workspace-text-muted">
                {ICONS.calendar}
                <span>
                  Started{" "}
                  <span className="font-medium text-workspace-text-secondary">
                    {formatDate(sub.startsAt)}
                  </span>
                </span>
              </div>
            )}
            {sub.expiresAt && (
              <div className="flex items-center gap-2 text-[11px] text-workspace-text-muted">
                {ICONS.clock}
                <span>
                  {sub.status === "ACTIVE" ? "Renews" : "Expires"}{" "}
                  <span className="font-medium text-workspace-text-secondary">
                    {formatDate(sub.expiresAt)}
                  </span>
                </span>
              </div>
            )}
            {sub.renewedAt && (
              <div className="flex items-center gap-2 text-[11px] text-workspace-text-muted">
                {ICONS.check}
                <span>
                  Renewed{" "}
                  <span className="font-medium text-workspace-text-secondary">
                    {formatDate(sub.renewedAt)}
                  </span>
                </span>
              </div>
            )}
            {/* Billing interval */}
            {sub.billingInterval && (
              <div className="flex items-center gap-2 text-[10px] text-workspace-text-muted uppercase tracking-wider">
                {ICONS.card}
                <span>{sub.billingInterval.toLowerCase()}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Section: Usage
// ═══════════════════════════════════════════════════════════════════════════

function UsageSection({ data }: { data: AccountCenterData }) {
  const { cardsUsed, cardsLimit } = data.usage;
  const isUnlimited = cardsLimit === null;
  const pct = isUnlimited ? 100 : Math.min(100, Math.round((cardsUsed / Math.max(1, cardsLimit)) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-widest">
          Cards
        </span>
        <span className="text-[11px] font-semibold text-workspace-text-primary">
          {isUnlimited ? (
            <span className="flex items-center gap-1 text-workspace-primary">
              {ICONS.infinity}
              Unlimited
            </span>
          ) : (
            <>
              <span className="text-workspace-primary">{cardsUsed}</span>
              <span className="text-workspace-text-muted">
                {" / "}
                {cardsLimit} Used
              </span>
            </>
          )}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              pct >= 90
                ? "bg-red-400"
                : pct >= 70
                  ? "bg-amber-400"
                  : "bg-workspace-primary",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {isUnlimited && (
        <div className="h-1.5 rounded-full bg-workspace-primary-muted/50 overflow-hidden">
          <div
            className="h-full rounded-full bg-workspace-primary/30"
            style={{ width: "100%" }}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Section: Workspace
// ═══════════════════════════════════════════════════════════════════════════

function WorkspaceSection({ data }: { data: AccountCenterData }) {
  const ws = data.workspace;
  if (!ws) return null;

  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-widest">
        Workspace
      </span>
      <div className="flex items-center gap-2 text-[11px]">
        {ICONS.building}
        <span className="font-semibold text-workspace-text-primary">
          {ws.name}
        </span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-workspace-text-muted">
        {ICONS.id}
        <span className="font-mono">{truncateId(ws.id)}</span>
      </div>
      <div className="flex items-center gap-2 text-[10px]">
        <span
          className={cn(
            "inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
            ws.role === "OWNER"
              ? "bg-workspace-primary-muted text-workspace-primary"
              : ws.role === "ADMIN"
                ? "bg-amber-50 text-amber-700"
                : "bg-slate-100 text-slate-500",
          )}
        >
          {ws.role.toLowerCase()}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Section: Account Details
// ═══════════════════════════════════════════════════════════════════════════

function AccountDetails({ data }: { data: AccountCenterData }) {
  const { account } = data;
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-widest">
        Account
      </span>
      <div className="flex items-center gap-2 text-[11px] text-workspace-text-muted">
        {ICONS.id}
        <span>
          Customer ID:{" "}
          <span className="font-mono font-medium text-workspace-text-secondary">
            {truncateId(account.customerId)}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-workspace-text-muted">
        {ICONS.calendar}
        <span>
          Created:{" "}
          <span className="font-medium text-workspace-text-secondary">
            {formatDate(account.createdAt)}
          </span>
        </span>
      </div>
      {account.lastLoginAt && (
        <div className="flex items-center gap-2 text-[11px] text-workspace-text-muted">
          {ICONS.clock}
          <span>
            Last login:{" "}
            <span className="font-medium text-workspace-text-secondary">
              {formatDate(account.lastLoginAt)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Section: Quick Actions
// ═══════════════════════════════════════════════════════════════════════════

const QUICK_ACTIONS = [
  { id: "profile", label: "Profile", icon: ICONS.profile },
  { id: "workspace-settings", label: "Workspace Settings", icon: ICONS.settings },
  { id: "billing", label: "Billing", icon: ICONS.billing },
  { id: "invoices", label: "Invoices", icon: ICONS.invoice },
  { id: "notifications", label: "Notifications", icon: ICONS.bell },
  { id: "security", label: "Security", icon: ICONS.shield },
  { id: "help", label: "Help Center", icon: ICONS.help },
];

function QuickActions() {
  return (
    <div className="space-y-0.5">
      <span className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-widest px-1">
        Quick Actions
      </span>
      <div className="space-y-0.5">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium text-workspace-text-secondary hover:bg-workspace-surface-dim hover:text-workspace-primary transition-all group"
          >
            <span className="shrink-0 text-workspace-text-muted group-hover:text-workspace-primary transition-colors">
              {action.icon}
            </span>
            <span>{action.label}</span>
            <span className="ml-auto text-workspace-text-muted/40 group-hover:text-workspace-primary/60 transition-colors">
              {ICONS.chevronRight}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Logout
// ═══════════════════════════════════════════════════════════════════════════

function LogoutButton() {
  const handleLogout = useCallback(() => {
    // Post to logout action
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/customer/logout";
    document.body.appendChild(form);
    form.submit();
  }, []);

  return (
    <>
      {/* Divider */}
      <div className="border-t border-slate-100" />
      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-medium text-workspace-text-muted hover:bg-red-50 hover:text-red-600 transition-all group"
        aria-label="Sign out"
      >
        <span className="shrink-0 text-workspace-text-muted group-hover:text-red-500 transition-colors">
          {ICONS.logout}
        </span>
        <span>Sign Out</span>
      </button>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main AccountCenter popover
// ═══════════════════════════════════════════════════════════════════════════

export interface AccountCenterProps {
  data: AccountCenterData | null;
}

export function AccountCenter({ data }: AccountCenterProps) {
  console.log("[TRACE:AccountCenter] RENDER — data:", data);
  console.log("[TRACE:AccountCenter] RENDER — data type:", typeof data, ", is null?", data === null, ", is undefined?", data === undefined);
  console.log("[TRACE:AccountCenter] RENDER — data JSON:", JSON.stringify(data));
  console.log("[TRACE:AccountCenter] RENDER — truthy check (!!data):", !!data);
  console.log("[TRACE:AccountCenter] RENDER — will render:", data ? "CONTENT" : "UNABLE TO LOAD MESSAGE");

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    // Use a short timeout so the opening click doesn't immediately close it
    const id = setTimeout(() => {
      document.addEventListener("click", onClick, { capture: true });
    }, 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, [open]);

  // Lock body scroll when panel is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const displayName = data?.user.displayName ?? "User";
  const userEmail = data?.user.email;
  const avatarUrl = data?.user.avatarUrl;

  return (
    <>
      {/* ── Trigger button ─────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
          open
            ? "bg-workspace-primary-muted/60 text-workspace-primary"
            : "hover:bg-workspace-surface-dim",
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Open account menu"
      >
        <div className="w-9 h-9 rounded-full border-2 border-white shadow-sm bg-workspace-primary-muted flex items-center justify-center text-workspace-primary font-semibold text-xs overflow-hidden shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            initials(displayName)
          )}
        </div>
        <div className="flex flex-col min-w-0 text-left flex-1">
          <span className="text-xs font-bold text-workspace-text-primary leading-tight truncate">
            {displayName}
          </span>
          {userEmail && (
            <span className="text-[10px] text-workspace-text-muted truncate">
              {userEmail}
            </span>
          )}
        </div>
        <span
          className={cn(
            "shrink-0 text-workspace-text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* ── Panel (portal) ─────────────────────────────────────────── */}
      {mounted &&
        open &&
        createPortal(
          <>
            {/* Mobile backdrop */}
            <div
              className="lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Panel */}
            <div
              ref={panelRef}
              role="dialog"
              aria-label="Account Center"
              className={cn(
                // Desktop: popover positioned to the right of sidebar
                "fixed z-[70]",
                "lg:left-[264px] lg:bottom-4 lg:top-auto lg:right-auto",
                "lg:w-[340px] lg:max-h-[calc(100dvh-32px)]",
                // Mobile: bottom sheet
                "max-lg:inset-x-0 max-lg:bottom-0 max-lg:max-h-[90dvh]",
                "max-lg:rounded-t-3xl",
                // Shared
                "workspace-glass-strong",
                "rounded-2xl",
                "overflow-hidden",
                "flex flex-col",
                "shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)]",
                "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200",
              )}
              style={{
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
              }}
            >
              {/* Mobile drag handle */}
              <div className="lg:hidden shrink-0 flex justify-center pt-3 pb-1">
                <div className="w-10 h-1.5 rounded-full bg-slate-300" />
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto workspace-scrollbar px-5 py-5 space-y-5">
                {data ? (
                  <>
                    <AccountHeader data={data} />
                    <SubscriptionCard data={data} />
                    <UsageSection data={data} />
                    <WorkspaceSection data={data} />
                    <AccountDetails data={data} />
                    <QuickActions />
                    <LogoutButton />
                  </>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-sm text-workspace-text-muted">
                      Unable to load account data.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
