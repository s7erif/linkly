-- CreateEnum
CREATE TYPE "SubscriptionReminderType" AS ENUM ('EXPIRY_7_DAYS', 'EXPIRY_3_DAYS', 'EXPIRY_1_DAY', 'EXPIRED', 'RENEWED');

-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'PENDING_PAYMENT';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "activatedAt" TIMESTAMP(3),
ADD COLUMN     "expiredAt" TIMESTAMP(3),
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "startsAt" TIMESTAMP(3);

-- Preserve existing service periods while introducing the canonical manual lifecycle dates.
UPDATE "Subscription"
SET "startsAt" = "currentPeriodStart",
    "expiresAt" = "currentPeriodEnd",
    "activatedAt" = CASE WHEN status = 'ACTIVE' THEN COALESCE("currentPeriodStart", "createdAt") ELSE NULL END,
    "expiredAt" = CASE WHEN status = 'EXPIRED' THEN COALESCE("currentPeriodEnd", "updatedAt") ELSE NULL END;

-- CreateTable
CREATE TABLE "SubscriptionReminder" (
    "id" UUID NOT NULL,
    "subscriptionId" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "type" "SubscriptionReminderType" NOT NULL,
    "periodExpiresAt" TIMESTAMP(3) NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionReminder_idempotencyKey_key" ON "SubscriptionReminder"("idempotencyKey");

-- CreateIndex
CREATE INDEX "SubscriptionReminder_workspaceId_status_createdAt_idx" ON "SubscriptionReminder"("workspaceId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SubscriptionReminder_status_lastAttemptAt_idx" ON "SubscriptionReminder"("status", "lastAttemptAt");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionReminder_subscriptionId_type_periodExpiresAt_key" ON "SubscriptionReminder"("subscriptionId", "type", "periodExpiresAt");

-- CreateIndex
CREATE INDEX "Subscription_status_expiresAt_idx" ON "Subscription"("status", "expiresAt");

-- AddForeignKey
ALTER TABLE "SubscriptionReminder" ADD CONSTRAINT "SubscriptionReminder_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionReminder" ADD CONSTRAINT "SubscriptionReminder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
