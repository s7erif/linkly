-- One immutable short token is the only public and support identifier for an NFC card.
ALTER TABLE "NfcCard" ADD COLUMN "activationToken" VARCHAR(10);

UPDATE "NfcCard"
SET "activationToken" = UPPER(SUBSTRING(COALESCE(NULLIF("publicIdentifier", ''), MD5("id"::text)) FROM 1 FOR 8));

ALTER TABLE "NfcCard" ALTER COLUMN "activationToken" SET NOT NULL;
CREATE UNIQUE INDEX "NfcCard_activationToken_key" ON "NfcCard"("activationToken");

ALTER TABLE "NfcCard" DROP CONSTRAINT IF EXISTS "NfcCard_assignedCustomerId_fkey";
ALTER TABLE "NfcCard" DROP CONSTRAINT IF EXISTS "NfcCard_digitalCardId_fkey";
ALTER TABLE "NfcCard" DROP CONSTRAINT IF EXISTS "NfcCard_batchId_fkey";
ALTER TABLE "NfcCard" RENAME COLUMN "assignedCustomerId" TO "customerId";
ALTER TABLE "NfcCard" ADD CONSTRAINT "NfcCard_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP INDEX IF EXISTS "NfcCard_activationCodeHash_key";
DROP INDEX IF EXISTS "NfcCard_activationCode_key";
DROP INDEX IF EXISTS "NfcCard_publicIdentifier_key";
DROP INDEX IF EXISTS "NfcCard_status_deletedAt_createdAt_idx";
DROP INDEX IF EXISTS "NfcCard_assignedCustomerId_status_idx";
DROP INDEX IF EXISTS "NfcCard_digitalCardId_status_idx";
DROP INDEX IF EXISTS "NfcCard_batchId_status_idx";
DROP INDEX IF EXISTS "NfcCard_cardType_status_idx";
DROP INDEX IF EXISTS "NfcCard_activationCodeHint_idx";

CREATE INDEX "NfcCard_status_createdAt_idx" ON "NfcCard"("status", "createdAt");
CREATE INDEX "NfcCard_customerId_status_idx" ON "NfcCard"("customerId", "status");

DROP TABLE IF EXISTS "ActivationEvent";
DROP TABLE IF EXISTS "Activation";
DROP TABLE IF EXISTS "NfcCardEvent";

ALTER TABLE "NfcCard"
  DROP COLUMN "activationCodeHash",
  DROP COLUMN "activationCodeHint",
  DROP COLUMN "activationCode",
  DROP COLUMN "publicIdentifier",
  DROP COLUMN "batchId",
  DROP COLUMN "cardType",
  DROP COLUMN "digitalCardId",
  DROP COLUMN "firstVisitAt",
  DROP COLUMN "lastVisitAt",
  DROP COLUMN "visitCount",
  DROP COLUMN "updatedAt",
  DROP COLUMN "deletedAt";

DROP TABLE IF EXISTS "NfcBatch";
DROP TYPE IF EXISTS "NfcCardEventType";
DROP TYPE IF EXISTS "ActivationEventType";
DROP TYPE IF EXISTS "ActivationStatus";
DROP SEQUENCE IF EXISTS "NfcActivationCodeSequence";
DROP SEQUENCE IF EXISTS "NfcBatchCodeSequence";
