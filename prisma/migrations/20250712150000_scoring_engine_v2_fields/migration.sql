-- V2 scoring fields present in schema but missing from earlier migration history

CREATE TYPE "ScoringEngineVersion" AS ENUM ('v1', 'v2');

ALTER TABLE "Assessment" ADD COLUMN "scoringEngineVersion" "ScoringEngineVersion" NOT NULL DEFAULT 'v2';

ALTER TABLE "ClientScoreHistory" ADD COLUMN "pillarScores" JSONB;

ALTER TABLE "AssessmentRecommendation" ALTER COLUMN "lastTriggeredAt" SET DEFAULT CURRENT_TIMESTAMP;
