CREATE TYPE "NfcCardStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'ACTIVATED', 'DISABLED');

CREATE TABLE "NfcCard" (
    "id" UUID NOT NULL,
    "activationCodeHash" BYTEA NOT NULL,
    "activationCodeHint" TEXT NOT NULL,
    "status" "NfcCardStatus" NOT NULL DEFAULT 'AVAILABLE',
    "assignedCustomerId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "NfcCard_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NfcCard_activationCodeHash_key" ON "NfcCard"("activationCodeHash");
CREATE INDEX "NfcCard_status_deletedAt_createdAt_idx" ON "NfcCard"("status", "deletedAt", "createdAt");
CREATE INDEX "NfcCard_assignedCustomerId_status_idx" ON "NfcCard"("assignedCustomerId", "status");
CREATE INDEX "NfcCard_activationCodeHint_idx" ON "NfcCard"("activationCodeHint");
ALTER TABLE "NfcCard" ADD CONSTRAINT "NfcCard_assignedCustomerId_fkey" FOREIGN KEY ("assignedCustomerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
