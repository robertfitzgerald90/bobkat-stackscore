-- CreateEnum
CREATE TYPE "PhaseProposalStatus" AS ENUM ('draft', 'internal_review', 'sent', 'viewed', 'approved', 'rejected', 'expired', 'superseded');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN "phaseProposalId" TEXT;

-- CreateTable
CREATE TABLE "PhaseProposal" (
    "id" TEXT NOT NULL,
    "proposalNumber" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PhaseProposalStatus" NOT NULL DEFAULT 'draft',
    "clientId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "executiveSummary" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "phaseName" TEXT NOT NULL,
    "phaseSubtitle" TEXT NOT NULL,
    "oneTimeInvestment" DECIMAL(12,2) NOT NULL,
    "monthlyRecurringInvestment" DECIMAL(12,2) NOT NULL,
    "annualRecurringInvestment" DECIMAL(12,2) NOT NULL,
    "expectedScoreImprovement" INTEGER NOT NULL DEFAULT 0,
    "snapshotJson" JSONB NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedByUserId" TEXT,
    "approvedByContactId" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "signatureJson" JSONB,
    "clientComments" TEXT,
    "supersedesProposalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhaseProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_phaseProposalId_key" ON "Document"("phaseProposalId");

-- CreateIndex
CREATE UNIQUE INDEX "PhaseProposal_proposalNumber_version_key" ON "PhaseProposal"("proposalNumber", "version");

-- CreateIndex
CREATE INDEX "PhaseProposal_clientId_status_idx" ON "PhaseProposal"("clientId", "status");

-- CreateIndex
CREATE INDEX "PhaseProposal_phaseId_status_idx" ON "PhaseProposal"("phaseId", "status");

-- CreateIndex
CREATE INDEX "PhaseProposal_roadmapId_idx" ON "PhaseProposal"("roadmapId");

-- CreateIndex
CREATE INDEX "PhaseProposal_assessmentId_idx" ON "PhaseProposal"("assessmentId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_phaseProposalId_fkey" FOREIGN KEY ("phaseProposalId") REFERENCES "PhaseProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseProposal" ADD CONSTRAINT "PhaseProposal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseProposal" ADD CONSTRAINT "PhaseProposal_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseProposal" ADD CONSTRAINT "PhaseProposal_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "ClientRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseProposal" ADD CONSTRAINT "PhaseProposal_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "ClientRoadmapPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseProposal" ADD CONSTRAINT "PhaseProposal_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseProposal" ADD CONSTRAINT "PhaseProposal_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseProposal" ADD CONSTRAINT "PhaseProposal_approvedByContactId_fkey" FOREIGN KEY ("approvedByContactId") REFERENCES "ClientContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseProposal" ADD CONSTRAINT "PhaseProposal_supersedesProposalId_fkey" FOREIGN KEY ("supersedesProposalId") REFERENCES "PhaseProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
