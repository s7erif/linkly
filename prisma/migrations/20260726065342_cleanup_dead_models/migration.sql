-- DropForeignKey
ALTER TABLE "InvoiceLine" DROP CONSTRAINT "InvoiceLine_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "BillingTimelineEntry" DROP CONSTRAINT "BillingTimelineEntry_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_themeId_fkey";

-- DropForeignKey
ALTER TABLE "PlanVersion" DROP CONSTRAINT "PlanVersion_planId_fkey";

-- DropForeignKey
ALTER TABLE "PlanVersionFeature" DROP CONSTRAINT "PlanVersionFeature_planVersionId_fkey";

-- DropForeignKey
ALTER TABLE "PlanPrice" DROP CONSTRAINT "PlanPrice_planVersionId_fkey";

-- DropForeignKey
ALTER TABLE "SubscriptionPeriod" DROP CONSTRAINT "SubscriptionPeriod_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "SubscriptionChange" DROP CONSTRAINT "SubscriptionChange_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "SubscriptionChange" DROP CONSTRAINT "SubscriptionChange_fromPlanPriceId_fkey";

-- DropForeignKey
ALTER TABLE "SubscriptionChange" DROP CONSTRAINT "SubscriptionChange_toPlanPriceId_fkey";

-- DropForeignKey
ALTER TABLE "MediaUsage" DROP CONSTRAINT "MediaUsage_mediaAssetId_fkey";

-- DropForeignKey
ALTER TABLE "AnalyticsAggregate" DROP CONSTRAINT "AnalyticsAggregate_cardId_fkey";

-- DropForeignKey
ALTER TABLE "AnalyticsAggregate" DROP CONSTRAINT "AnalyticsAggregate_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "BusinessCard" DROP CONSTRAINT "BusinessCard_userId_fkey";

-- DropForeignKey
ALTER TABLE "SocialLink" DROP CONSTRAINT "SocialLink_businessCardId_fkey";

-- DropForeignKey
ALTER TABLE "Analytics" DROP CONSTRAINT "Analytics_businessCardId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentAttempt" DROP CONSTRAINT "PaymentAttempt_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentAllocation" DROP CONSTRAINT "PaymentAllocation_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentAllocation" DROP CONSTRAINT "PaymentAllocation_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentMethodReference" DROP CONSTRAINT "PaymentMethodReference_billingAccountId_fkey";

-- DropForeignKey
ALTER TABLE "EntitlementGrant" DROP CONSTRAINT "EntitlementGrant_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "EntitlementGrant" DROP CONSTRAINT "EntitlementGrant_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "ProviderObjectReference" DROP CONSTRAINT "ProviderObjectReference_paymentId_fkey";

-- DropIndex
DROP INDEX "Card_themeId_idx";

-- DropIndex
DROP INDEX "PlanPrice_planVersionId_isActive_effectiveFrom_idx";

-- DropIndex
DROP INDEX "PlanPrice_planVersionId_currency_cadence_intervalCount_effe_key";

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "themeId";

-- AlterTable
-- AlterTable
ALTER TABLE "PlanPrice" DROP COLUMN "planVersionId";

-- AlterTable
ALTER TABLE "BusinessCard" DROP COLUMN "userId";

-- DropTable
DROP TABLE "InvoiceLine";

-- DropTable
DROP TABLE "BillingTimelineEntry";

-- DropTable
DROP TABLE "Theme";

-- DropTable
DROP TABLE "PlanVersion";

-- DropTable
DROP TABLE "PlanVersionFeature";

-- DropTable
DROP TABLE "SubscriptionPeriod";

-- DropTable
DROP TABLE "SubscriptionChange";

-- DropTable
DROP TABLE "MediaUsage";

-- DropTable
DROP TABLE "AnalyticsAggregate";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "VerificationToken";

-- DropTable
DROP TABLE "SocialLink";

-- DropTable
DROP TABLE "Analytics";

-- DropTable
DROP TABLE "PaymentAttempt";

-- DropTable
DROP TABLE "PaymentAllocation";

-- DropTable
DROP TABLE "Refund";

-- DropTable
DROP TABLE "PaymentMethodReference";

-- DropTable
DROP TABLE "EntitlementGrant";

-- DropTable
DROP TABLE "ProviderObjectReference";

-- DropTable
DROP TABLE "WebhookInbox";

-- DropTable
DROP TABLE "OutboxEvent";

-- DropEnum
DROP TYPE "PlanVersionStatus";

-- DropEnum
DROP TYPE "SubscriptionPeriodKind";

-- DropEnum
DROP TYPE "SubscriptionChangeType";

-- DropEnum
DROP TYPE "SubscriptionChangeStatus";

-- DropEnum
DROP TYPE "InvoiceLineType";

-- DropEnum
DROP TYPE "PaymentAttemptStatus";

-- DropEnum
DROP TYPE "RefundStatus";

-- DropEnum
DROP TYPE "WebhookInboxStatus";

-- DropEnum
DROP TYPE "OutboxEventStatus";

-- DropEnum
DROP TYPE "EntitlementGrantSource";

-- DropEnum
DROP TYPE "ProviderObjectType";

-- DropEnum
DROP TYPE "ProviderMappingInternalType";

