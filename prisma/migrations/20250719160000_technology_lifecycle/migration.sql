-- AlterEnum DocumentType
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'technology_lifecycle_report';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'technology_budget_report';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'roadmap_progress_report';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'annual_technology_report';

-- CreateEnum
CREATE TYPE "LifecycleOpportunityStatus" AS ENUM ('open', 'accepted', 'deferred', 'dismissed', 'converted');
CREATE TYPE "LifecycleOpportunitySource" AS ENUM ('phase_complete', 'reassessment', 'technology_aging', 'compliance_change', 'business_growth', 'refresh_cycle', 'emerging_risk', 'manual');

-- AlterTable ClientRoadmapInitiative
ALTER TABLE "ClientRoadmapInitiative" ADD COLUMN IF NOT EXISTS "estimatedOneTimeCost" DECIMAL(12,2);
ALTER TABLE "ClientRoadmapInitiative" ADD COLUMN IF NOT EXISTS "actualOneTimeCost" DECIMAL(12,2);
ALTER TABLE "ClientRoadmapInitiative" ADD COLUMN IF NOT EXISTS "actualScoreIncrease" INTEGER;
ALTER TABLE "ClientRoadmapInitiative" ADD COLUMN IF NOT EXISTS "businessValueNotes" TEXT;
ALTER TABLE "ClientRoadmapInitiative" ADD COLUMN IF NOT EXISTS "effectivenessJson" JSONB;

-- AlterTable QuarterlyBusinessReview
ALTER TABLE "QuarterlyBusinessReview" ADD COLUMN IF NOT EXISTS "snapshotJson" JSONB;
ALTER TABLE "QuarterlyBusinessReview" ADD COLUMN IF NOT EXISTS "budgetForecastJson" JSONB;
ALTER TABLE "QuarterlyBusinessReview" ADD COLUMN IF NOT EXISTS "technologyRisksJson" JSONB;
ALTER TABLE "QuarterlyBusinessReview" ADD COLUMN IF NOT EXISTS "strategicRecommendationsJson" JSONB;

-- CreateTable
CREATE TABLE "LifecycleOpportunity" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "roadmapId" TEXT,
    "phaseId" TEXT,
    "recommendationId" TEXT,
    "source" "LifecycleOpportunitySource" NOT NULL,
    "status" "LifecycleOpportunityStatus" NOT NULL DEFAULT 'open',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "estimatedImpactPoints" INTEGER NOT NULL DEFAULT 0,
    "estimatedOneTimeInvestment" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "relatedServiceKey" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dismissedAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "LifecycleOpportunity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LifecycleOpportunity_clientId_status_idx" ON "LifecycleOpportunity"("clientId", "status");
CREATE INDEX "LifecycleOpportunity_roadmapId_idx" ON "LifecycleOpportunity"("roadmapId");
CREATE INDEX "LifecycleOpportunity_phaseId_idx" ON "LifecycleOpportunity"("phaseId");
CREATE INDEX "LifecycleOpportunity_source_idx" ON "LifecycleOpportunity"("source");

ALTER TABLE "LifecycleOpportunity" ADD CONSTRAINT "LifecycleOpportunity_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
