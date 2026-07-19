-- Phase 2: Add Analytics model

CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "businessCardId" TEXT NOT NULL,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "qrScans" INTEGER NOT NULL DEFAULT 0,
    "linkClicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_businessCardId_key" ON "Analytics"("businessCardId");

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_businessCardId_fkey" FOREIGN KEY ("businessCardId") REFERENCES "BusinessCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
