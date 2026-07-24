-- Permanent NFC inventory identifiers, batches, lifecycle, and multi-card workspaces.
ALTER TYPE "NfcCardStatus" RENAME VALUE 'ACTIVATION_PENDING' TO 'RESERVED';
ALTER TYPE "NfcCardStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';

CREATE TYPE "NfcCardEventType" AS ENUM (
  'IMPORTED', 'PROVISIONED', 'RESERVED', 'ACTIVATED', 'DISABLED',
  'REACTIVATED', 'LOST', 'ARCHIVED', 'VISITED'
);

CREATE SEQUENCE IF NOT EXISTS "NfcActivationCodeSequence" START 1;
CREATE SEQUENCE IF NOT EXISTS "NfcBatchCodeSequence" START 1;

CREATE TABLE "NfcBatch" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" VARCHAR(32) NOT NULL,
  "name" TEXT NOT NULL,
  "supplier" TEXT,
  "purchaseDate" TIMESTAMP(3),
  "quantity" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NfcBatch_pkey" PRIMARY KEY ("id")
);

INSERT INTO "NfcBatch" ("code", "name", "quantity")
SELECT 'BATCH-LEGACY', 'Legacy Inventory', COUNT(*) FROM "NfcCard";

ALTER TABLE "NfcCard"
  ADD COLUMN "activationCode" TEXT,
  ADD COLUMN "publicIdentifier" VARCHAR(12),
  ADD COLUMN "batchId" UUID,
  ADD COLUMN "cardType" VARCHAR(32) NOT NULL DEFAULT 'STANDARD',
  ADD COLUMN "workspaceId" UUID,
  ADD COLUMN "firstVisitAt" TIMESTAMP(3),
  ADD COLUMN "lastVisitAt" TIMESTAMP(3),
  ADD COLUMN "visitCount" INTEGER NOT NULL DEFAULT 0;

WITH numbered AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS position
  FROM "NfcCard"
)
UPDATE "NfcCard" AS card
SET
  "activationCode" = 'ACT-' || EXTRACT(YEAR FROM CURRENT_DATE)::text || '-' || LPAD(numbered.position::text, 6, '0'),
  "publicIdentifier" = UPPER(SUBSTRING(MD5(card."id"::text) FROM 1 FOR 8)),
  "batchId" = (SELECT "id" FROM "NfcBatch" WHERE "code" = 'BATCH-LEGACY')
FROM numbered
WHERE card."id" = numbered."id";

SELECT setval('"NfcActivationCodeSequence"', GREATEST((SELECT COUNT(*) FROM "NfcCard"), 1));
SELECT setval('"NfcBatchCodeSequence"', 1);

ALTER TABLE "NfcCard"
  ALTER COLUMN "activationCode" SET NOT NULL,
  ALTER COLUMN "publicIdentifier" SET NOT NULL,
  ALTER COLUMN "batchId" SET NOT NULL;

ALTER TABLE "NfcCard" DROP CONSTRAINT IF EXISTS "NfcCard_digitalCardId_key";

CREATE TABLE "NfcCardEvent" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "nfcCardId" UUID NOT NULL,
  "type" "NfcCardEventType" NOT NULL,
  "detail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NfcCardEvent_pkey" PRIMARY KEY ("id")
);

INSERT INTO "NfcCardEvent" ("nfcCardId", "type", "detail", "createdAt")
SELECT "id", 'IMPORTED', 'Migrated into permanent NFC inventory', "createdAt" FROM "NfcCard";

CREATE UNIQUE INDEX "NfcBatch_code_key" ON "NfcBatch"("code");
CREATE INDEX "NfcBatch_createdAt_idx" ON "NfcBatch"("createdAt");
CREATE INDEX "NfcBatch_name_idx" ON "NfcBatch"("name");
CREATE UNIQUE INDEX "NfcCard_activationCode_key" ON "NfcCard"("activationCode");
CREATE UNIQUE INDEX "NfcCard_publicIdentifier_key" ON "NfcCard"("publicIdentifier");
CREATE INDEX "NfcCard_workspaceId_status_idx" ON "NfcCard"("workspaceId", "status");
CREATE INDEX "NfcCard_digitalCardId_status_idx" ON "NfcCard"("digitalCardId", "status");
CREATE INDEX "NfcCard_batchId_status_idx" ON "NfcCard"("batchId", "status");
CREATE INDEX "NfcCard_cardType_status_idx" ON "NfcCard"("cardType", "status");
CREATE INDEX "NfcCardEvent_nfcCardId_createdAt_idx" ON "NfcCardEvent"("nfcCardId", "createdAt");
CREATE INDEX "NfcCardEvent_type_createdAt_idx" ON "NfcCardEvent"("type", "createdAt");

ALTER TABLE "NfcCard" ADD CONSTRAINT "NfcCard_batchId_fkey"
  FOREIGN KEY ("batchId") REFERENCES "NfcBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NfcCard" ADD CONSTRAINT "NfcCard_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NfcCardEvent" ADD CONSTRAINT "NfcCardEvent_nfcCardId_fkey"
  FOREIGN KEY ("nfcCardId") REFERENCES "NfcCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
