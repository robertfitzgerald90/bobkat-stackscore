-- Recommendation deduplication: stable keys, trigger history, partial unique index for active rows.

-- Step 1: Add nullable columns
ALTER TABLE "AssessmentRecommendation"
  ADD COLUMN "dedupeKey" TEXT,
  ADD COLUMN "latestAssessmentId" TEXT,
  ADD COLUMN "lastTriggeredAt" TIMESTAMP(3),
  ADD COLUMN "latestTriggerReason" TEXT,
  ADD COLUMN "triggeredInLatestAssessment" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "isRecurrence" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "recurrenceCount" INTEGER NOT NULL DEFAULT 0;

-- Step 2: Backfill dedupe key and latest assessment metadata
UPDATE "AssessmentRecommendation" ar
SET
  "dedupeKey" = COALESCE(
    (SELECT rt.code FROM "RecommendationTemplate" rt WHERE rt.id = ar."recommendationTemplateId"),
    'category:' || ar."categoryId" || ':type:' || ar."title"
  ),
  "latestAssessmentId" = ar."assessmentId",
  "lastTriggeredAt" = ar."createdAt"
WHERE "dedupeKey" IS NULL;

-- Step 3: Merge duplicate active recommendations (keep oldest createdAt, re-link projects and triggers)
DO $$
DECLARE
  dup RECORD;
  keeper_id TEXT;
BEGIN
  FOR dup IN
    SELECT "clientId", "dedupeKey"
    FROM "AssessmentRecommendation"
    WHERE status IN ('open', 'accepted', 'in_progress', 'deferred')
    GROUP BY "clientId", "dedupeKey"
    HAVING COUNT(*) > 1
  LOOP
    SELECT id INTO keeper_id
    FROM "AssessmentRecommendation"
    WHERE "clientId" = dup."clientId"
      AND "dedupeKey" = dup."dedupeKey"
      AND status IN ('open', 'accepted', 'in_progress', 'deferred')
    ORDER BY "createdAt" ASC, id ASC
    LIMIT 1;

    UPDATE "Project" p
    SET "recommendationId" = keeper_id
    WHERE p."recommendationId" IN (
      SELECT id FROM "AssessmentRecommendation"
      WHERE "clientId" = dup."clientId"
        AND "dedupeKey" = dup."dedupeKey"
        AND status IN ('open', 'accepted', 'in_progress', 'deferred')
        AND id <> keeper_id
    )
    AND NOT EXISTS (
      SELECT 1 FROM "Project" existing WHERE existing."recommendationId" = keeper_id
    );

    DELETE FROM "AssessmentRecommendation"
    WHERE "clientId" = dup."clientId"
      AND "dedupeKey" = dup."dedupeKey"
      AND status IN ('open', 'accepted', 'in_progress', 'deferred')
      AND id <> keeper_id;
  END LOOP;
END $$;

-- Step 4: Enforce NOT NULL on required columns
ALTER TABLE "AssessmentRecommendation"
  ALTER COLUMN "dedupeKey" SET NOT NULL,
  ALTER COLUMN "latestAssessmentId" SET NOT NULL,
  ALTER COLUMN "lastTriggeredAt" SET NOT NULL;

-- Step 5: Foreign key for latest assessment
ALTER TABLE "AssessmentRecommendation"
  ADD CONSTRAINT "AssessmentRecommendation_latestAssessmentId_fkey"
  FOREIGN KEY ("latestAssessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 6: Trigger history table
CREATE TABLE "RecommendationAssessmentTrigger" (
  "id" TEXT NOT NULL,
  "recommendationId" TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "triggerReason" TEXT,

  CONSTRAINT "RecommendationAssessmentTrigger_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RecommendationAssessmentTrigger_recommendationId_assessmentId_key"
  ON "RecommendationAssessmentTrigger"("recommendationId", "assessmentId");

CREATE INDEX "RecommendationAssessmentTrigger_assessmentId_idx"
  ON "RecommendationAssessmentTrigger"("assessmentId");

ALTER TABLE "RecommendationAssessmentTrigger"
  ADD CONSTRAINT "RecommendationAssessmentTrigger_recommendationId_fkey"
  FOREIGN KEY ("recommendationId") REFERENCES "AssessmentRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecommendationAssessmentTrigger"
  ADD CONSTRAINT "RecommendationAssessmentTrigger_assessmentId_fkey"
  FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 7: Backfill one trigger row per existing recommendation
INSERT INTO "RecommendationAssessmentTrigger" ("id", "recommendationId", "assessmentId", "triggeredAt", "triggerReason")
SELECT
  gen_random_uuid()::text,
  ar.id,
  ar."assessmentId",
  ar."lastTriggeredAt",
  ar."latestTriggerReason"
FROM "AssessmentRecommendation" ar
WHERE NOT EXISTS (
  SELECT 1
  FROM "RecommendationAssessmentTrigger" existing
  WHERE existing."recommendationId" = ar.id
    AND existing."assessmentId" = ar."assessmentId"
);

-- Step 8: Index and partial unique constraint for active deduplication
CREATE INDEX "AssessmentRecommendation_clientId_dedupeKey_idx"
  ON "AssessmentRecommendation"("clientId", "dedupeKey");

CREATE UNIQUE INDEX "AssessmentRecommendation_clientId_dedupeKey_active_key"
  ON "AssessmentRecommendation"("clientId", "dedupeKey")
  WHERE status IN ('open', 'accepted', 'in_progress', 'deferred');
