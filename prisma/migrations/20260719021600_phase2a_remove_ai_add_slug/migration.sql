-- Phase 2A: Remove AI/billing columns, add slug + isActive
-- This migration is safe for both empty and populated databases.

-- ============================================================
-- 1. Remove AI-only fields
-- ============================================================

-- Drop AI columns from BusinessCard
ALTER TABLE "BusinessCard" DROP COLUMN IF EXISTS "showAiAssistant";
ALTER TABLE "BusinessCard" DROP COLUMN IF EXISTS "htmlContent";
ALTER TABLE "BusinessCard" DROP COLUMN IF EXISTS "userPrompt";

-- Drop credits column from User
ALTER TABLE "User" DROP COLUMN IF EXISTS "credits";

-- ============================================================
-- 2. Add new columns
-- ============================================================

-- Add isActive with default (non-breaking, instant)
ALTER TABLE "BusinessCard" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Add slug as nullable first (so we can backfill before enforcing NOT NULL)
ALTER TABLE "BusinessCard" ADD COLUMN "slug" TEXT;

-- ============================================================
-- 3. Backfill slugs from existing card names
-- ============================================================
-- Generates deterministic slugs: lowercase, non-alphanumeric → hyphens,
-- collapsed, trimmed. Appends -2, -3, ... for duplicates (ordered by createTime).

DO $$
DECLARE
  rec RECORD;
  base_slug TEXT;
  final_slug TEXT;
  suffix INT;
BEGIN
  FOR rec IN
    SELECT id, name, "createTime"
    FROM "BusinessCard"
    WHERE slug IS NULL
    ORDER BY "createTime" ASC
  LOOP
    -- Slugify: lowercase, replace non-alnum with hyphens, collapse, trim
    base_slug := trim(both '-' from regexp_replace(
      regexp_replace(lower(rec.name), '[^a-z0-9]+', '-', 'g'),
      '-+', '-', 'g'
    ));

    -- Fallback for empty names
    IF base_slug = '' OR base_slug IS NULL THEN
      base_slug := 'card';
    END IF;

    -- Find unique slug: try base, then base-2, base-3, ...
    final_slug := base_slug;
    suffix := 1;
    WHILE EXISTS (SELECT 1 FROM "BusinessCard" WHERE slug = final_slug) LOOP
      suffix := suffix + 1;
      final_slug := base_slug || '-' || suffix::text;
    END LOOP;

    UPDATE "BusinessCard" SET slug = final_slug WHERE id = rec.id;
  END LOOP;
END $$;

-- ============================================================
-- 4. Enforce constraints
-- ============================================================

-- Make slug NOT NULL now that all rows are backfilled
ALTER TABLE "BusinessCard" ALTER COLUMN "slug" SET NOT NULL;

-- Add unique constraint
ALTER TABLE "BusinessCard" ADD CONSTRAINT "BusinessCard_slug_key" UNIQUE ("slug");
