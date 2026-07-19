-- CreateEnum
CREATE TYPE "ClientRoadmapStatus" AS ENUM ('draft', 'active', 'completed', 'superseded');

-- CreateEnum
CREATE TYPE "RoadmapPhaseStatus" AS ENUM ('planned', 'awaiting_approval', 'approved', 'in_progress', 'completed', 'deferred', 'cancelled');

-- CreateTable
CREATE TABLE "ClientRoadmap" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "tipId" TEXT,
    "status" "ClientRoadmapStatus" NOT NULL DEFAULT 'draft',
    "title" TEXT NOT NULL,
    "baselineScore" INTEGER NOT NULL,
    "projectedFinalScore" INTEGER NOT NULL,
    "activatedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientRoadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientRoadmapPhase" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "phaseKey" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "executiveSummary" TEXT NOT NULL,
    "status" "RoadmapPhaseStatus" NOT NULL DEFAULT 'planned',
    "oneTimeInvestment" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "monthlyRecurringInvestment" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "annualRecurringInvestment" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "expectedScoreImprovement" INTEGER NOT NULL DEFAULT 0,
    "projectedScoreAfterPhase" INTEGER NOT NULL DEFAULT 0,
    "approvedAt" TIMESTAMP(3),
    "approvedByUserId" TEXT,
    "approvedByContactId" TEXT,
    "proposalGeneratedAt" TIMESTAMP(3),
    "proposalAcceptedAt" TIMESTAMP(3),
    "projectStartedAt" TIMESTAMP(3),
    "projectCompletedAt" TIMESTAMP(3),
    "actualCost" DECIMAL(12,2),
    "actualCompletionDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientRoadmapPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientRoadmapInitiative" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "estimatedImpactPoints" INTEGER NOT NULL DEFAULT 0,
    "businessOutcomeTitle" TEXT,
    "businessOutcomeDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientRoadmapInitiative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientRoadmapPhaseEvent" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "fromStatus" "RoadmapPhaseStatus",
    "toStatus" "RoadmapPhaseStatus" NOT NULL,
    "changedByUserId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientRoadmapPhaseEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientRoadmap_clientId_status_idx" ON "ClientRoadmap"("clientId", "status");

-- CreateIndex
CREATE INDEX "ClientRoadmap_assessmentId_idx" ON "ClientRoadmap"("assessmentId");

-- CreateIndex
CREATE INDEX "ClientRoadmap_tipId_idx" ON "ClientRoadmap"("tipId");

-- CreateIndex
CREATE INDEX "ClientRoadmapPhase_roadmapId_sortOrder_idx" ON "ClientRoadmapPhase"("roadmapId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ClientRoadmapPhase_roadmapId_phaseKey_key" ON "ClientRoadmapPhase"("roadmapId", "phaseKey");

-- CreateIndex
CREATE INDEX "ClientRoadmapInitiative_recommendationId_idx" ON "ClientRoadmapInitiative"("recommendationId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientRoadmapInitiative_phaseId_recommendationId_key" ON "ClientRoadmapInitiative"("phaseId", "recommendationId");

-- CreateIndex
CREATE INDEX "ClientRoadmapPhaseEvent_phaseId_createdAt_idx" ON "ClientRoadmapPhaseEvent"("phaseId", "createdAt");

-- AddForeignKey
ALTER TABLE "ClientRoadmap" ADD CONSTRAINT "ClientRoadmap_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRoadmap" ADD CONSTRAINT "ClientRoadmap_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRoadmap" ADD CONSTRAINT "ClientRoadmap_tipId_fkey" FOREIGN KEY ("tipId") REFERENCES "TechnologyImprovementPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRoadmapPhase" ADD CONSTRAINT "ClientRoadmapPhase_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "ClientRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRoadmapPhase" ADD CONSTRAINT "ClientRoadmapPhase_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRoadmapPhase" ADD CONSTRAINT "ClientRoadmapPhase_approvedByContactId_fkey" FOREIGN KEY ("approvedByContactId") REFERENCES "ClientContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRoadmapInitiative" ADD CONSTRAINT "ClientRoadmapInitiative_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "ClientRoadmapPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRoadmapInitiative" ADD CONSTRAINT "ClientRoadmapInitiative_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "AssessmentRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRoadmapPhaseEvent" ADD CONSTRAINT "ClientRoadmapPhaseEvent_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "ClientRoadmapPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRoadmapPhaseEvent" ADD CONSTRAINT "ClientRoadmapPhaseEvent_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
