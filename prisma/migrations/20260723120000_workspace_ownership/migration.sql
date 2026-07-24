-- Sprint 3.2B: additive subscription-baseline reconciliation and workspace ownership rollout.
-- Existing rows are backfilled from authoritative relations before tenant ownership becomes required.
-- No existing table or column is dropped or renamed.

-- CreateEnum
CREATE TYPE "PlanVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'RETIRED');

-- CreateEnum
CREATE TYPE "PriceCadence" AS ENUM ('FREE', 'MONTH', 'YEAR', 'LIFETIME');

-- CreateEnum
CREATE TYPE "WorkspaceMembershipStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REVOKED');

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "SubscriptionPeriodKind" AS ENUM ('TRIAL', 'PAID', 'FREE', 'COMPLIMENTARY', 'LIFETIME');

-- CreateEnum
CREATE TYPE "SubscriptionChangeType" AS ENUM ('UPGRADE', 'DOWNGRADE', 'CADENCE_CHANGE', 'CANCEL', 'REACTIVATE');

-- CreateEnum
CREATE TYPE "SubscriptionChangeStatus" AS ENUM ('SCHEDULED', 'APPLIED', 'CANCELED', 'FAILED');

-- CreateEnum
CREATE TYPE "InvoiceLineType" AS ENUM ('BASE', 'DISCOUNT', 'TAX', 'PRORATION', 'CREDIT');

-- CreateEnum
CREATE TYPE "PaymentLedgerStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELED', 'PARTIALLY_REFUNDED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "WebhookInboxStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED', 'IGNORED');

-- CreateEnum
CREATE TYPE "OutboxEventStatus" AS ENUM ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "EntitlementGrantSource" AS ENUM ('SUBSCRIPTION', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProviderObjectType" AS ENUM ('CUSTOMER', 'SUBSCRIPTION', 'PAYMENT', 'PAYMENT_METHOD', 'INVOICE', 'REFUND');

-- CreateEnum
CREATE TYPE "ProviderMappingInternalType" AS ENUM ('BILLING_ACCOUNT', 'SUBSCRIPTION', 'PAYMENT', 'INVOICE', 'REFUND');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SubscriptionStatus" ADD VALUE 'DRAFT';
ALTER TYPE "SubscriptionStatus" ADD VALUE 'TRIAL';
ALTER TYPE "SubscriptionStatus" ADD VALUE 'GRACE_PERIOD';
ALTER TYPE "SubscriptionStatus" ADD VALUE 'SUSPENDED';
ALTER TYPE "SubscriptionStatus" ADD VALUE 'ARCHIVED';

-- AlterTable
ALTER TABLE "AnalyticsAggregate" ADD COLUMN     "workspaceId" UUID;

-- AlterTable
ALTER TABLE "AnalyticsEvent" ADD COLUMN     "workspaceId" UUID;

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "workspaceId" UUID;

-- AlterTable
ALTER TABLE "BillingTimelineEntry" ADD COLUMN     "workspaceId" UUID;

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "workspaceId" UUID;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "workspaceId" UUID;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "billingAccountId" UUID,
ADD COLUMN     "dueAt" TIMESTAMP(3),
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "periodEnd" TIMESTAMP(3),
ADD COLUMN     "periodStart" TIMESTAMP(3),
ADD COLUMN     "subscriptionId" UUID,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "workspaceId" UUID;

-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "workspaceId" UUID;

-- AlterTable
ALTER TABLE "MediaFolder" ADD COLUMN     "workspaceId" UUID;

-- AlterTable
ALTER TABLE "NotificationDelivery" ADD COLUMN     "workspaceId" UUID;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "workspaceId" UUID;

-- AlterTable
ALTER TABLE "PaymentSubmission" ADD COLUMN     "workspaceId" UUID;

-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "workspaceId" UUID;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "billingAccountId" UUID,
ADD COLUMN     "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "originOrderId" UUID,
ADD COLUMN     "planPriceId" UUID,
ADD COLUMN     "trialEnd" TIMESTAMP(3),
ADD COLUMN     "trialStart" TIMESTAMP(3),
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "workspaceId" UUID;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "billingAccountId" UUID,
ALTER COLUMN "customerId" DROP NOT NULL,
ALTER COLUMN "primaryCardId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "WorkspaceMembership" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "role" "WorkspaceRole" NOT NULL,
    "status" "WorkspaceMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WorkspaceMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingAccount" (
    "id" UUID NOT NULL,
    "customerId" UUID,
    "displayName" TEXT NOT NULL,
    "billingEmail" TEXT NOT NULL,
    "countryCode" VARCHAR(2),
    "taxIdentifier" TEXT,
    "defaultCurrency" VARCHAR(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "BillingAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLine" (
    "id" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "type" "InvoiceLineType" NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitAmountMinor" BIGINT NOT NULL,
    "amountMinor" BIGINT NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanVersion" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "PlanVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "limits" JSONB NOT NULL DEFAULT '{}',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanVersionFeature" (
    "id" UUID NOT NULL,
    "planVersionId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "limitValue" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanVersionFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanPrice" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "planVersionId" UUID NOT NULL,
    "amountMinor" BIGINT NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "cadence" "PriceCadence" NOT NULL,
    "intervalCount" INTEGER NOT NULL DEFAULT 1,
    "trialDays" INTEGER,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPeriod" (
    "id" UUID NOT NULL,
    "subscriptionId" UUID NOT NULL,
    "kind" "SubscriptionPeriodKind" NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionChange" (
    "id" UUID NOT NULL,
    "subscriptionId" UUID NOT NULL,
    "type" "SubscriptionChangeType" NOT NULL,
    "status" "SubscriptionChangeStatus" NOT NULL DEFAULT 'SCHEDULED',
    "fromPlanPriceId" UUID,
    "toPlanPriceId" UUID,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "reason" TEXT,
    "metadata" JSONB,

    CONSTRAINT "SubscriptionChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "billingAccountId" UUID,
    "amountMinor" BIGINT NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "status" "PaymentLedgerStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "succeededAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "providerAttemptId" TEXT,
    "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'PENDING',
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAllocation" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "amountMinor" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "amountMinor" BIGINT NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "providerRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethodReference" (
    "id" UUID NOT NULL,
    "billingAccountId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "providerObjectId" TEXT NOT NULL,
    "type" TEXT,
    "last4" TEXT,
    "brand" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethodReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntitlementGrant" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "subscriptionId" UUID,
    "key" TEXT NOT NULL,
    "limitValue" INTEGER,
    "source" "EntitlementGrantSource" NOT NULL DEFAULT 'SUBSCRIPTION',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntitlementGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderObjectReference" (
    "id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "providerObjectType" "ProviderObjectType" NOT NULL,
    "externalId" TEXT NOT NULL,
    "internalType" "ProviderMappingInternalType" NOT NULL,
    "internalId" UUID NOT NULL,
    "paymentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderObjectReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookInbox" (
    "id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB,
    "status" "WebhookInboxStatus" NOT NULL DEFAULT 'RECEIVED',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,

    CONSTRAINT "WebhookInbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboxEvent" (
    "id" UUID NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxEventStatus" NOT NULL DEFAULT 'PENDING',
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- Deterministic tenant backfill before enforcing required ownership.
-- Legacy releases stored ownership through Workspace.customerId, but some
-- databases never received workspace rows. Reconstruct that one-to-one anchor
-- before assigning the new canonical workspaceId columns.
INSERT INTO "Workspace" (id, "customerId", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Customer" c
LEFT JOIN "Workspace" w ON w."customerId" = c.id
WHERE w.id IS NULL;

-- Customerless legacy orders and unattached media have no authoritative
-- tenant. Keep them together in one isolated compatibility workspace instead
-- of assigning them to a real customer tenant.
INSERT INTO "Workspace" (id, "createdAt", "updatedAt")
SELECT gen_random_uuid(), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE EXISTS (
  SELECT 1 FROM "Order" WHERE "customerId" IS NULL
  UNION ALL
  SELECT 1 FROM "MediaAsset" WHERE "customerId" IS NULL
)
AND NOT EXISTS (
  SELECT 1 FROM "Workspace"
  WHERE "customerId" IS NULL AND "primaryCardId" IS NULL
);

-- Customer is the legacy ownership anchor. A customer with zero or multiple
-- workspaces is deliberately rejected for manual reconciliation.
UPDATE "Customer" c
SET "workspaceId" = candidate."workspaceId"
FROM (
  SELECT "customerId", MIN(id::text)::uuid AS "workspaceId"
  FROM "Workspace"
  GROUP BY "customerId"
  HAVING COUNT(*) = 1
) candidate
WHERE candidate."customerId" = c.id;

-- Cards prefer their explicit primary-workspace relation and otherwise inherit
-- the owning customer's tenant.
UPDATE "Card" c SET "workspaceId" = w.id
FROM "Workspace" w WHERE w."primaryCardId" = c.id;
UPDATE "Card" c SET "workspaceId" = customer."workspaceId"
FROM "Customer" customer
WHERE customer.id = c."customerId" AND c."workspaceId" IS NULL;

UPDATE "Order" o
SET "workspaceId" = c."workspaceId"
FROM "Customer" c
WHERE c.id = o."customerId";

-- Orders without a customer may still be mapped through their generated card.
UPDATE "Order" o
SET "workspaceId" = candidate."workspaceId"
FROM (
  SELECT "orderId", MIN("workspaceId"::text)::uuid AS "workspaceId"
  FROM "Card"
  WHERE "orderId" IS NOT NULL
  GROUP BY "orderId"
  HAVING COUNT(DISTINCT "workspaceId") = 1
) candidate
WHERE o.id = candidate."orderId" AND o."workspaceId" IS NULL;

UPDATE "Order" o
SET "workspaceId" = legacy.id
FROM (
  SELECT MIN(id::text)::uuid AS id FROM "Workspace"
  WHERE "customerId" IS NULL AND "primaryCardId" IS NULL
) legacy
WHERE o."workspaceId" IS NULL;

UPDATE "PaymentSubmission" p SET "workspaceId" = o."workspaceId"
FROM "Order" o WHERE o.id = p."orderId";
UPDATE "Invoice" i SET "workspaceId" = o."workspaceId"
FROM "Order" o WHERE o.id = i."orderId";
UPDATE "BillingTimelineEntry" b SET "workspaceId" = o."workspaceId"
FROM "Order" o WHERE o.id = b."orderId";
UPDATE "NotificationDelivery" n SET "workspaceId" = o."workspaceId"
FROM "Order" o WHERE o.id = n."orderId";
UPDATE "AnalyticsEvent" e SET "workspaceId" = c."workspaceId"
FROM "Card" c WHERE c.id = e."cardId";
UPDATE "AnalyticsAggregate" a SET "workspaceId" = c."workspaceId"
FROM "Card" c WHERE c.id = a."cardId";

-- Existing nullable subscription/NFC ownership is filled only from unambiguous
-- authoritative relations. AVAILABLE/RESERVED NFC inventory remains global.
UPDATE "Subscription" s SET "workspaceId" = o."workspaceId"
FROM "Order" o WHERE o.id = s."originOrderId" AND s."workspaceId" IS NULL;
UPDATE "Subscription" s SET "workspaceId" = c."workspaceId"
FROM "Customer" c WHERE c.id = s."customerId" AND s."workspaceId" IS NULL;
UPDATE "NfcCard" n SET "workspaceId" = c."workspaceId"
FROM "Customer" c WHERE c.id = n."customerId" AND n."workspaceId" IS NULL;

-- Media ownership can originate from the customer, a card link, or a payment
-- proof. Each set is grouped to prevent arbitrary cross-tenant selection.
UPDATE "MediaAsset" m SET "workspaceId" = c."workspaceId"
FROM "Customer" c WHERE c.id = m."customerId";
UPDATE "MediaAsset" m SET "workspaceId" = x."workspaceId"
FROM (
  SELECT cm."mediaAssetId", MIN(c."workspaceId"::text)::uuid AS "workspaceId"
  FROM "CardMedia" cm JOIN "Card" c ON c.id = cm."cardId"
  GROUP BY cm."mediaAssetId" HAVING COUNT(DISTINCT c."workspaceId") = 1
) x WHERE x."mediaAssetId" = m.id AND m."workspaceId" IS NULL;
UPDATE "MediaAsset" m SET "workspaceId" = x."workspaceId"
FROM (
  SELECT p."paymentProofAssetId", MIN(p."workspaceId"::text)::uuid AS "workspaceId"
  FROM "PaymentSubmission" p WHERE p."paymentProofAssetId" IS NOT NULL
  GROUP BY p."paymentProofAssetId" HAVING COUNT(DISTINCT p."workspaceId") = 1
) x WHERE x."paymentProofAssetId" = m.id AND m."workspaceId" IS NULL;

UPDATE "MediaFolder" f SET "workspaceId" = x."workspaceId"
FROM (
  SELECT "folderId", MIN("workspaceId"::text)::uuid AS "workspaceId"
  FROM "MediaAsset" WHERE "folderId" IS NOT NULL
  GROUP BY "folderId" HAVING COUNT(DISTINCT "workspaceId") = 1
) x WHERE x."folderId" = f.id;

-- Shared legacy folders and unattached assets cannot be attributed to a
-- customer reliably. Retain them in the isolated compatibility workspace;
-- payment proofs already inherited the owning order above.
UPDATE "MediaFolder" f
SET "workspaceId" = legacy.id
FROM (
  SELECT MIN(id::text)::uuid AS id FROM "Workspace"
  WHERE "customerId" IS NULL AND "primaryCardId" IS NULL
) legacy
WHERE f."workspaceId" IS NULL;

UPDATE "MediaAsset" m
SET "workspaceId" = legacy.id
FROM (
  SELECT MIN(id::text)::uuid AS id FROM "Workspace"
  WHERE "customerId" IS NULL AND "primaryCardId" IS NULL
) legacy
WHERE m."workspaceId" IS NULL;

-- Propagate ownership from resolved child folders to their ancestors.
WITH RECURSIVE folder_owners AS (
  SELECT id, "parentId", "workspaceId" FROM "MediaFolder" WHERE "workspaceId" IS NOT NULL
  UNION ALL
  SELECT parent.id, parent."parentId", child."workspaceId"
  FROM "MediaFolder" parent JOIN folder_owners child ON child."parentId" = parent.id
), unique_owners AS (
  SELECT id, MIN("workspaceId"::text)::uuid AS "workspaceId"
  FROM folder_owners GROUP BY id HAVING COUNT(DISTINCT "workspaceId") = 1
)
UPDATE "MediaFolder" f SET "workspaceId" = u."workspaceId"
FROM unique_owners u WHERE u.id = f.id AND f."workspaceId" IS NULL;

UPDATE "Setting" s SET "workspaceId" = c."workspaceId"
FROM "Card" c WHERE c.id = s."cardId";
UPDATE "Setting" s SET "workspaceId" = c."workspaceId"
FROM "Customer" c WHERE c.id = s."customerId" AND s."workspaceId" IS NULL;

-- Ledger payments are tenant-owned only when the billing account maps to one
-- workspace. Ambiguous shared billing accounts abort below.
UPDATE "Payment" p SET "workspaceId" = x."workspaceId"
FROM (
  SELECT "billingAccountId", MIN(id::text)::uuid AS "workspaceId"
  FROM "Workspace" WHERE "billingAccountId" IS NOT NULL
  GROUP BY "billingAccountId" HAVING COUNT(*) = 1
) x WHERE x."billingAccountId" = p."billingAccountId";

-- Tenant audit logs are derived where the resource type is an owned aggregate;
-- platform administration logs intentionally remain workspace-null.
UPDATE "AuditLog" a SET "workspaceId" = c."workspaceId"
FROM "Customer" c WHERE a."resourceType" = 'Customer' AND a."resourceId" = c.id::text;
UPDATE "AuditLog" a SET "workspaceId" = c."workspaceId"
FROM "Card" c WHERE a."resourceType" = 'Card' AND a."resourceId" = c.id::text;
UPDATE "AuditLog" a SET "workspaceId" = o."workspaceId"
FROM "Order" o WHERE a."resourceType" = 'Order' AND a."resourceId" = o.id::text;

DO $$
DECLARE unresolved text;
BEGIN
  SELECT string_agg(label, ', ') INTO unresolved
  FROM (VALUES
    ('Customer', (SELECT COUNT(*) FROM "Customer" WHERE "workspaceId" IS NULL)),
    ('Card', (SELECT COUNT(*) FROM "Card" WHERE "workspaceId" IS NULL)),
    ('Order', (SELECT COUNT(*) FROM "Order" WHERE "workspaceId" IS NULL)),
    ('PaymentSubmission', (SELECT COUNT(*) FROM "PaymentSubmission" WHERE "workspaceId" IS NULL)),
    ('Invoice', (SELECT COUNT(*) FROM "Invoice" WHERE "workspaceId" IS NULL)),
    ('BillingTimelineEntry', (SELECT COUNT(*) FROM "BillingTimelineEntry" WHERE "workspaceId" IS NULL)),
    ('Subscription', (SELECT COUNT(*) FROM "Subscription" WHERE "workspaceId" IS NULL)),
    ('MediaAsset', (SELECT COUNT(*) FROM "MediaAsset" WHERE "workspaceId" IS NULL)),
    ('MediaFolder', (SELECT COUNT(*) FROM "MediaFolder" WHERE "workspaceId" IS NULL)),
    ('AnalyticsEvent', (SELECT COUNT(*) FROM "AnalyticsEvent" WHERE "workspaceId" IS NULL)),
    ('AnalyticsAggregate', (SELECT COUNT(*) FROM "AnalyticsAggregate" WHERE "workspaceId" IS NULL)),
    ('NotificationDelivery', (SELECT COUNT(*) FROM "NotificationDelivery" WHERE "workspaceId" IS NULL)),
    ('Payment', (SELECT COUNT(*) FROM "Payment" WHERE "workspaceId" IS NULL))
  ) AS checks(label, missing) WHERE missing > 0;
  IF unresolved IS NOT NULL THEN
    RAISE EXCEPTION 'Workspace ownership backfill requires reconciliation for: %', unresolved;
  END IF;
END $$;

ALTER TABLE "Customer" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "PaymentSubmission" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "Invoice" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "BillingTimelineEntry" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "Card" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "Subscription" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "MediaAsset" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "MediaFolder" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "AnalyticsEvent" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "AnalyticsAggregate" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "NotificationDelivery" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "workspaceId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "WorkspaceMembership_accountId_status_role_deletedAt_idx" ON "WorkspaceMembership"("accountId", "status", "role", "deletedAt");

-- CreateIndex
CREATE INDEX "WorkspaceMembership_workspaceId_status_role_deletedAt_idx" ON "WorkspaceMembership"("workspaceId", "status", "role", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMembership_workspaceId_accountId_key" ON "WorkspaceMembership"("workspaceId", "accountId");

-- CreateIndex
CREATE INDEX "BillingAccount_customerId_archivedAt_idx" ON "BillingAccount"("customerId", "archivedAt");

-- CreateIndex
CREATE INDEX "BillingAccount_billingEmail_idx" ON "BillingAccount"("billingEmail");

-- CreateIndex
CREATE INDEX "InvoiceLine_invoiceId_type_idx" ON "InvoiceLine"("invoiceId", "type");

-- CreateIndex
CREATE INDEX "PlanVersion_planId_status_effectiveFrom_idx" ON "PlanVersion"("planId", "status", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "PlanVersion_planId_version_key" ON "PlanVersion"("planId", "version");

-- CreateIndex
CREATE INDEX "PlanVersionFeature_key_enabled_idx" ON "PlanVersionFeature"("key", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "PlanVersionFeature_planVersionId_key_key" ON "PlanVersionFeature"("planVersionId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "PlanPrice_key_key" ON "PlanPrice"("key");

-- CreateIndex
CREATE INDEX "PlanPrice_planVersionId_isActive_effectiveFrom_idx" ON "PlanPrice"("planVersionId", "isActive", "effectiveFrom");

-- CreateIndex
CREATE INDEX "PlanPrice_currency_cadence_isActive_idx" ON "PlanPrice"("currency", "cadence", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PlanPrice_planVersionId_currency_cadence_intervalCount_effe_key" ON "PlanPrice"("planVersionId", "currency", "cadence", "intervalCount", "effectiveFrom");

-- CreateIndex
CREATE INDEX "SubscriptionPeriod_subscriptionId_endsAt_idx" ON "SubscriptionPeriod"("subscriptionId", "endsAt");

-- CreateIndex
CREATE INDEX "SubscriptionPeriod_kind_endsAt_idx" ON "SubscriptionPeriod"("kind", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPeriod_subscriptionId_startsAt_kind_key" ON "SubscriptionPeriod"("subscriptionId", "startsAt", "kind");

-- CreateIndex
CREATE INDEX "SubscriptionChange_subscriptionId_status_effectiveAt_idx" ON "SubscriptionChange"("subscriptionId", "status", "effectiveAt");

-- CreateIndex
CREATE INDEX "SubscriptionChange_toPlanPriceId_idx" ON "SubscriptionChange"("toPlanPriceId");

-- CreateIndex
CREATE INDEX "Payment_workspaceId_createdAt_idx" ON "Payment"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_workspaceId_status_createdAt_idx" ON "Payment"("workspaceId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_billingAccountId_createdAt_idx" ON "Payment"("billingAccountId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_idempotencyKey_key" ON "PaymentAttempt"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PaymentAttempt_paymentId_createdAt_idx" ON "PaymentAttempt"("paymentId", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentAttempt_provider_status_nextRetryAt_idx" ON "PaymentAttempt"("provider", "status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "PaymentAllocation_invoiceId_createdAt_idx" ON "PaymentAllocation"("invoiceId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAllocation_paymentId_invoiceId_key" ON "PaymentAllocation"("paymentId", "invoiceId");

-- CreateIndex
CREATE INDEX "Refund_paymentId_createdAt_idx" ON "Refund"("paymentId", "createdAt");

-- CreateIndex
CREATE INDEX "Refund_status_createdAt_idx" ON "Refund"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentMethodReference_billingAccountId_createdAt_idx" ON "PaymentMethodReference"("billingAccountId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethodReference_provider_providerObjectId_key" ON "PaymentMethodReference"("provider", "providerObjectId");

-- CreateIndex
CREATE INDEX "EntitlementGrant_workspaceId_key_startsAt_endsAt_idx" ON "EntitlementGrant"("workspaceId", "key", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "EntitlementGrant_subscriptionId_key_idx" ON "EntitlementGrant"("subscriptionId", "key");

-- CreateIndex
CREATE INDEX "ProviderObjectReference_internalType_internalId_idx" ON "ProviderObjectReference"("internalType", "internalId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderObjectReference_provider_providerObjectType_externa_key" ON "ProviderObjectReference"("provider", "providerObjectType", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderObjectReference_provider_internalType_internalId_pr_key" ON "ProviderObjectReference"("provider", "internalType", "internalId", "providerObjectType");

-- CreateIndex
CREATE INDEX "WebhookInbox_status_receivedAt_idx" ON "WebhookInbox"("status", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookInbox_provider_providerEventId_key" ON "WebhookInbox"("provider", "providerEventId");

-- CreateIndex
CREATE UNIQUE INDEX "OutboxEvent_idempotencyKey_key" ON "OutboxEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "OutboxEvent_status_availableAt_idx" ON "OutboxEvent"("status", "availableAt");

-- CreateIndex
CREATE INDEX "OutboxEvent_aggregateType_aggregateId_occurredAt_idx" ON "OutboxEvent"("aggregateType", "aggregateId", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsAggregate_workspaceId_period_bucketStart_idx" ON "AnalyticsAggregate"("workspaceId", "period", "bucketStart");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsAggregate_workspaceId_cardId_period_bucketStart_ev_key" ON "AnalyticsAggregate"("workspaceId", "cardId", "period", "bucketStart", "eventType", "dimension", "dimensionValue");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_workspaceId_occurredAt_idx" ON "AnalyticsEvent"("workspaceId", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_workspaceId_type_occurredAt_idx" ON "AnalyticsEvent"("workspaceId", "type", "occurredAt");

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_createdAt_idx" ON "AuditLog"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_resourceType_resourceId_createdAt_idx" ON "AuditLog"("workspaceId", "resourceType", "resourceId", "createdAt");

-- CreateIndex
CREATE INDEX "BillingTimelineEntry_workspaceId_createdAt_idx" ON "BillingTimelineEntry"("workspaceId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BillingTimelineEntry_workspaceId_orderId_event_entityType_e_key" ON "BillingTimelineEntry"("workspaceId", "orderId", "event", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "Card_workspaceId_status_deletedAt_idx" ON "Card"("workspaceId", "status", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Card_workspaceId_slug_key" ON "Card"("workspaceId", "slug");

-- CreateIndex
CREATE INDEX "Customer_workspaceId_status_deletedAt_idx" ON "Customer"("workspaceId", "status", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_workspaceId_email_key" ON "Customer"("workspaceId", "email");

-- CreateIndex
CREATE INDEX "Invoice_workspaceId_issuedAt_idx" ON "Invoice"("workspaceId", "issuedAt");

-- CreateIndex
CREATE INDEX "Invoice_workspaceId_status_dueAt_idx" ON "Invoice"("workspaceId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "Invoice_subscriptionId_periodStart_idx" ON "Invoice"("subscriptionId", "periodStart");

-- CreateIndex
CREATE INDEX "Invoice_billingAccountId_status_dueAt_idx" ON "Invoice"("billingAccountId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "Invoice_status_dueAt_idx" ON "Invoice"("status", "dueAt");

-- CreateIndex
CREATE INDEX "MediaAsset_workspaceId_status_deletedAt_idx" ON "MediaAsset"("workspaceId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "MediaAsset_workspaceId_storageKey_idx" ON "MediaAsset"("workspaceId", "storageKey");

-- CreateIndex
CREATE INDEX "MediaFolder_workspaceId_parentId_idx" ON "MediaFolder"("workspaceId", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaFolder_workspaceId_parentId_name_key" ON "MediaFolder"("workspaceId", "parentId", "name");

-- CreateIndex
CREATE INDEX "NotificationDelivery_workspaceId_status_lastAttemptAt_idx" ON "NotificationDelivery"("workspaceId", "status", "lastAttemptAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDelivery_workspaceId_cardId_channel_template_key" ON "NotificationDelivery"("workspaceId", "cardId", "channel", "template");

-- CreateIndex
CREATE INDEX "Order_workspaceId_createdAt_idx" ON "Order"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_workspaceId_status_createdAt_idx" ON "Order"("workspaceId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentSubmission_workspaceId_status_submittedAt_idx" ON "PaymentSubmission"("workspaceId", "status", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentSubmission_workspaceId_orderId_referenceNumber_key" ON "PaymentSubmission"("workspaceId", "orderId", "referenceNumber");

-- CreateIndex
CREATE INDEX "Setting_workspaceId_scope_key_idx" ON "Setting"("workspaceId", "scope", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_workspaceId_scope_customerId_cardId_key_key" ON "Setting"("workspaceId", "scope", "customerId", "cardId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_originOrderId_key" ON "Subscription"("originOrderId");

-- CreateIndex
CREATE INDEX "Subscription_workspaceId_status_idx" ON "Subscription"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Subscription_planPriceId_status_idx" ON "Subscription"("planPriceId", "status");

-- CreateIndex
CREATE INDEX "Subscription_billingAccountId_status_idx" ON "Subscription"("billingAccountId", "status");

-- CreateIndex
CREATE INDEX "Subscription_cancelAtPeriodEnd_currentPeriodEnd_idx" ON "Subscription"("cancelAtPeriodEnd", "currentPeriodEnd");

-- CreateIndex
CREATE INDEX "Workspace_customerId_createdAt_idx" ON "Workspace"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "Workspace_billingAccountId_idx" ON "Workspace"("billingAccountId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_billingAccountId_fkey" FOREIGN KEY ("billingAccountId") REFERENCES "BillingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMembership" ADD CONSTRAINT "WorkspaceMembership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMembership" ADD CONSTRAINT "WorkspaceMembership_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CustomerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingAccount" ADD CONSTRAINT "BillingAccount_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSubmission" ADD CONSTRAINT "PaymentSubmission_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_billingAccountId_fkey" FOREIGN KEY ("billingAccountId") REFERENCES "BillingAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingTimelineEntry" ADD CONSTRAINT "BillingTimelineEntry_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanVersion" ADD CONSTRAINT "PlanVersion_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanVersionFeature" ADD CONSTRAINT "PlanVersionFeature_planVersionId_fkey" FOREIGN KEY ("planVersionId") REFERENCES "PlanVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanPrice" ADD CONSTRAINT "PlanPrice_planVersionId_fkey" FOREIGN KEY ("planVersionId") REFERENCES "PlanVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planPriceId_fkey" FOREIGN KEY ("planPriceId") REFERENCES "PlanPrice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_billingAccountId_fkey" FOREIGN KEY ("billingAccountId") REFERENCES "BillingAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_originOrderId_fkey" FOREIGN KEY ("originOrderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPeriod" ADD CONSTRAINT "SubscriptionPeriod_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionChange" ADD CONSTRAINT "SubscriptionChange_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionChange" ADD CONSTRAINT "SubscriptionChange_fromPlanPriceId_fkey" FOREIGN KEY ("fromPlanPriceId") REFERENCES "PlanPrice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionChange" ADD CONSTRAINT "SubscriptionChange_toPlanPriceId_fkey" FOREIGN KEY ("toPlanPriceId") REFERENCES "PlanPrice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaFolder" ADD CONSTRAINT "MediaFolder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsAggregate" ADD CONSTRAINT "AnalyticsAggregate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_billingAccountId_fkey" FOREIGN KEY ("billingAccountId") REFERENCES "BillingAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethodReference" ADD CONSTRAINT "PaymentMethodReference_billingAccountId_fkey" FOREIGN KEY ("billingAccountId") REFERENCES "BillingAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitlementGrant" ADD CONSTRAINT "EntitlementGrant_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitlementGrant" ADD CONSTRAINT "EntitlementGrant_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderObjectReference" ADD CONSTRAINT "ProviderObjectReference_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Database-only invariants not expressible in Prisma schema.
ALTER TABLE "NfcCard" ADD CONSTRAINT "NfcCard_activated_workspace_check" CHECK (status <> 'ACTIVATED' OR "workspaceId" IS NOT NULL);
CREATE UNIQUE INDEX "WorkspaceMembership_one_active_owner_key" ON "WorkspaceMembership"("workspaceId") WHERE role = 'OWNER' AND status = 'ACTIVE' AND "deletedAt" IS NULL;
