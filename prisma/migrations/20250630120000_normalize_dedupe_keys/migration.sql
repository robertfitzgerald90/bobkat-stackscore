-- Normalize dedupe keys to template:{catalogCode} and merge duplicate active rows.

UPDATE "AssessmentRecommendation" ar
SET "dedupeKey" = 'template:' || rt.code
FROM "RecommendationTemplate" rt
WHERE ar."recommendationTemplateId" = rt.id;

-- Bare catalog codes from earlier backfills (no template: prefix)
UPDATE "AssessmentRecommendation" ar
SET "dedupeKey" = 'template:' || ar."dedupeKey"
WHERE ar."dedupeKey" NOT LIKE 'template:%'
  AND ar."dedupeKey" NOT LIKE 'category:%'
  AND ar."dedupeKey" NOT LIKE 'type:%'
  AND ar."recommendationTemplateId" IS NOT NULL;

-- UUID-based template keys from interim runtime
UPDATE "AssessmentRecommendation" ar
SET "dedupeKey" = 'template:' || rt.code
FROM "RecommendationTemplate" rt
WHERE ar."recommendationTemplateId" = rt.id
  AND ar."dedupeKey" = 'template:' || rt.id;

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

    INSERT INTO "RecommendationAssessmentTrigger" ("id", "recommendationId", "assessmentId", "triggeredAt", "triggerReason")
    SELECT
      gen_random_uuid()::text,
      keeper_id,
      t."assessmentId",
      t."triggeredAt",
      t."triggerReason"
    FROM "RecommendationAssessmentTrigger" t
    INNER JOIN "AssessmentRecommendation" ar ON ar.id = t."recommendationId"
    WHERE ar."clientId" = dup."clientId"
      AND ar."dedupeKey" = dup."dedupeKey"
      AND ar.id <> keeper_id
    ON CONFLICT ("recommendationId", "assessmentId") DO NOTHING;

    DELETE FROM "AssessmentRecommendation"
    WHERE "clientId" = dup."clientId"
      AND "dedupeKey" = dup."dedupeKey"
      AND status IN ('open', 'accepted', 'in_progress', 'deferred')
      AND id <> keeper_id;
  END LOOP;
END $$;
