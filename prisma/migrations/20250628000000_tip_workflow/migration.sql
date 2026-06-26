-- CreateEnum
CREATE TYPE "TechnologyImprovementPlanStatus" AS ENUM ('draft', 'generated', 'superseded');

-- CreateEnum
CREATE TYPE "TipWorkflowStep" AS ENUM ('profile', 'recommendations', 'playbooks', 'investment', 'roadmap', 'preview', 'complete');

-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'technology_improvement_plan';

-- CreateTable
CREATE TABLE "TechnologyImprovementPlan" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "assessmentId" TEXT,
    "status" "TechnologyImprovementPlanStatus" NOT NULL DEFAULT 'draft',
    "currentStep" "TipWorkflowStep" NOT NULL DEFAULT 'profile',
    "version" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "wizardState" JSONB NOT NULL,
    "executiveSummary" TEXT,
    "generatedAt" TIMESTAMP(3),
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnologyImprovementPlan_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Document" ADD COLUMN "tipId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Document_tipId_key" ON "Document"("tipId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_tipId_fkey" FOREIGN KEY ("tipId") REFERENCES "TechnologyImprovementPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnologyImprovementPlan" ADD CONSTRAINT "TechnologyImprovementPlan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnologyImprovementPlan" ADD CONSTRAINT "TechnologyImprovementPlan_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnologyImprovementPlan" ADD CONSTRAINT "TechnologyImprovementPlan_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
