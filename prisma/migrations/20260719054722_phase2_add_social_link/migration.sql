-- Phase 2: Add SocialLink model

CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "businessCardId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialLink_businessCardId_idx" ON "SocialLink"("businessCardId");

-- AddForeignKey
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_businessCardId_fkey" FOREIGN KEY ("businessCardId") REFERENCES "BusinessCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
