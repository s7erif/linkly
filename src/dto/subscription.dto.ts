export type BillingIntervalDTO = "MONTHLY" | "QUARTERLY" | "YEARLY";
export type SubscriptionStatusDTO = "PENDING_PAYMENT" | "DRAFT" | "TRIAL" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "GRACE_PERIOD" | "SUSPENDED" | "PAUSED" | "CANCELED" | "EXPIRED" | "ARCHIVED";
export type ManualSubscriptionStatusDTO = "PENDING_PAYMENT" | "ACTIVE" | "EXPIRED" | "CANCELED" | "SUSPENDED";
export type ManualSubscriptionDuration = "MONTHLY" | "YEARLY";
export interface PlanFeatureDTO { key:string; enabled:boolean; limitValue:number|null }
export interface PlanLimitsDTO { maxCards?:number; maxLinks?:number; maxTeamMembers?:number; customDomain?:boolean; analytics?:boolean; prioritySupport?:boolean; [key:string]:number|boolean|undefined }
export interface PlanDTO { id:string; key:string; name:string; description:string|null; currency:string; monthlyMinor:number|null; quarterlyMinor:number|null; yearlyMinor:number|null; active:boolean; popular:boolean; badge:string|null; limits:PlanLimitsDTO; sortOrder:number; archivedAt:Date|null; features:readonly PlanFeatureDTO[]; createdAt:Date; updatedAt:Date }
export interface SubscriptionDTO { id:string; workspaceId:string; customerId:string; customerName:string; customerEmail:string|null; plan:PlanDTO; status:SubscriptionStatusDTO; billingInterval:BillingIntervalDTO; startsAt:Date|null; expiresAt:Date|null; activatedAt:Date|null; renewedAt:Date|null; expiredAt:Date|null; canceledAt:Date|null; cancelledAt:Date|null; suspendedAt:Date|null; currentPeriodStart:Date|null; currentPeriodEnd:Date|null; createdAt:Date; updatedAt:Date }
export interface CustomerPlanSummaryDTO { subscription:SubscriptionDTO|null; enabledFeatures:readonly PlanFeatureDTO[]; disabledFeatures:readonly PlanFeatureDTO[] }
