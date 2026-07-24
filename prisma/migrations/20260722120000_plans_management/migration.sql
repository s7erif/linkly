ALTER TABLE "Plan" ADD COLUMN "isPopular" BOOLEAN NOT NULL DEFAULT false, ADD COLUMN "badge" TEXT, ADD COLUMN "limits" JSONB NOT NULL DEFAULT '{}'::jsonb, ADD COLUMN "archivedAt" TIMESTAMP(3);

WITH ordered AS (SELECT "id", ROW_NUMBER() OVER (ORDER BY "sortOrder", "createdAt", "id") - 1 AS position FROM "Plan") UPDATE "Plan" SET "sortOrder" = ordered.position FROM ordered WHERE "Plan"."id" = ordered."id";

CREATE UNIQUE INDEX "Plan_sortOrder_key" ON "Plan"("sortOrder");
