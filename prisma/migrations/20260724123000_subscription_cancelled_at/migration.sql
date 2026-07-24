-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "cancelledAt" TIMESTAMP(3);
UPDATE "Subscription" SET "cancelledAt" = "canceledAt" WHERE "canceledAt" IS NOT NULL;
