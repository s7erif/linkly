-- CreateIndex
CREATE UNIQUE INDEX "AccessCode_one_active_per_card" ON "AccessCode"("cardId") WHERE ("status" = 'ACTIVE');
