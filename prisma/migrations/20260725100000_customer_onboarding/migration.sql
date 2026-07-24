-- Link each physical NFC token to the Card it resolves after activation.
ALTER TABLE "NfcCard" ADD COLUMN "cardId" UUID;

-- Existing activated inventory resolved through the Workspace primary Card.
UPDATE "NfcCard" AS n
SET "cardId" = w."primaryCardId"
FROM "Workspace" AS w
WHERE n."workspaceId" = w."id"
  AND n."cardId" IS NULL;

CREATE INDEX "NfcCard_cardId_status_idx" ON "NfcCard"("cardId", "status");
ALTER TABLE "NfcCard" ADD CONSTRAINT "NfcCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Single-use password recovery challenges. Only hashes are persisted.
CREATE TABLE "CustomerPasswordReset" (
  "id" UUID NOT NULL,
  "accountId" UUID NOT NULL,
  "tokenHash" BYTEA NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerPasswordReset_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CustomerPasswordReset_tokenHash_key" ON "CustomerPasswordReset"("tokenHash");
CREATE INDEX "CustomerPasswordReset_accountId_expiresAt_usedAt_idx" ON "CustomerPasswordReset"("accountId", "expiresAt", "usedAt");
ALTER TABLE "CustomerPasswordReset" ADD CONSTRAINT "CustomerPasswordReset_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
