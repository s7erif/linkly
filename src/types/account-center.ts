/**
 * Account Center — data contract for the premium account panel.
 *
 * All date fields are ISO-8601 strings so the data is serializable
 * from server components to client components without transformation.
 */

export type SubscriptionStatusLabel =
  | "ACTIVE"
  | "TRIAL"
  | "TRIALING"
  | "EXPIRED"
  | "CANCELED"
  | "PAST_DUE"
  | "SUSPENDED"
  | "PENDING_PAYMENT"
  | "NONE";

export type BillingIntervalLabel =
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY"
  | "LIFETIME";

export type WorkspaceRoleLabel =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "MEMBER"
  | "VIEWER";

export interface AccountCenterData {
  user: {
    displayName: string;
    email: string | null;
    avatarUrl: string | null;
  };
  subscription: {
    planName: string;
    status: SubscriptionStatusLabel;
    billingInterval: BillingIntervalLabel | null;
    startsAt: string | null;
    expiresAt: string | null;
    renewedAt: string | null;
    isLifetime: boolean;
  } | null;
  usage: {
    cardsUsed: number;
    cardsLimit: number | null; // null = unlimited
  };
  workspace: {
    name: string;
    id: string;
    role: WorkspaceRoleLabel;
  } | null;
  account: {
    customerId: string;
    createdAt: string;
    lastLoginAt: string | null;
  };
}
