-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'technician', 'client');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('prospect', 'active', 'inactive', 'archived');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('initial', 'quarterly', 'annual', 'followup');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('draft', 'completed', 'archived');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('open', 'accepted', 'in_progress', 'completed', 'deferred', 'declined', 'archived');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('proposed', 'approved', 'scheduled', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "Rating" AS ENUM ('exceptional', 'strong', 'stable', 'at_risk', 'critical');

-- CreateEnum
CREATE TYPE "ResponseType" AS ENUM ('binary', 'ternary', 'maturity');

-- CreateEnum
CREATE TYPE "MaturityTier" AS ENUM ('nascent', 'foundational', 'developing', 'mature', 'optimized');

-- CreateEnum
CREATE TYPE "TrendDirection" AS ENUM ('improving', 'stable', 'declining');

-- CreateEnum
CREATE TYPE "ProfileSnapshotTrigger" AS ENUM ('assessment_completed', 'project_completed', 'scheduled_review', 'manual');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('report', 'diagram', 'contract', 'proposal', 'evidence', 'other');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('general', 'assessment', 'recommendation', 'project', 'system');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('internal', 'client_visible');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'technician',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "primaryContactName" TEXT NOT NULL,
    "primaryContactEmail" TEXT NOT NULL,
    "primaryContactPhone" TEXT,
    "industry" TEXT,
    "employeeCount" INTEGER,
    "deviceCount" INTEGER,
    "locationCity" TEXT,
    "locationState" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'prospect',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentCategory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxPoints" INTEGER NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "v2CategoryCode" TEXT,
    "v2DisplayName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentQuestion" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "v2QuestionId" TEXT,
    "categoryId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "helpText" TEXT,
    "purpose" TEXT,
    "capability" TEXT,
    "responseType" "ResponseType" NOT NULL DEFAULT 'ternary',
    "evidenceRequired" TEXT,
    "relatedService" TEXT,
    "relatedPlaybook" TEXT,
    "relatedTechnologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "adminNotes" TEXT,
    "weight" INTEGER NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'medium',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "scoreValue" INTEGER NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "triggersRecommendation" BOOLEAN NOT NULL DEFAULT false,
    "triggersCriticalFlag" BOOLEAN NOT NULL DEFAULT false,
    "recommendationTemplateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnswerOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "assessorUserId" TEXT NOT NULL,
    "assessmentName" TEXT NOT NULL,
    "assessmentType" "AssessmentType" NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'draft',
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "overallScore" DECIMAL(5,2),
    "securityScore" DECIMAL(5,2),
    "backupScore" DECIMAL(5,2),
    "infrastructureScore" DECIMAL(5,2),
    "endpointScore" DECIMAL(5,2),
    "documentationScore" DECIMAL(5,2),
    "bcdrScore" DECIMAL(5,2),
    "strategicScore" DECIMAL(5,2),
    "hasCriticalExposure" BOOLEAN NOT NULL DEFAULT false,
    "executiveSummary" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "sourceAssessmentId" TEXT,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnologyProfile" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "overallStackScore" DECIMAL(5,2),
    "maturityTier" "MaturityTier",
    "categoryScores" JSONB,
    "riskSummary" JSONB,
    "currentAssessmentId" TEXT,
    "lastAssessedAt" TIMESTAMP(3),
    "nextRecommendedAssessmentAt" TIMESTAMP(3),
    "trendDirection" "TrendDirection",
    "criticalExposureCount" INTEGER NOT NULL DEFAULT 0,
    "openRecommendationCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnologyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnologyProfileSnapshot" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "technologyProfileId" TEXT NOT NULL,
    "triggerType" "ProfileSnapshotTrigger" NOT NULL,
    "triggerAssessmentId" TEXT,
    "snapshotAt" TIMESTAMP(3) NOT NULL,
    "overallStackScore" DECIMAL(5,2) NOT NULL,
    "maturityTier" "MaturityTier" NOT NULL,
    "categoryScores" JSONB NOT NULL,
    "riskSummary" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechnologyProfileSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentResponse" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedAnswerOptionId" TEXT NOT NULL,
    "scoreEarned" INTEGER NOT NULL,
    "notes" TEXT,
    "evidence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentCategoryScore" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "pointsEarned" DECIMAL(6,2) NOT NULL,
    "pointsPossible" DECIMAL(6,2) NOT NULL,
    "percentScore" DECIMAL(5,2) NOT NULL,
    "rating" "Rating" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentCategoryScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationTemplate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessImpact" TEXT NOT NULL,
    "suggestedService" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,
    "estimatedImpactPoints" INTEGER NOT NULL,
    "consolidationGroupId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentRecommendation" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "recommendationTemplateId" TEXT,
    "consolidationGroupId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessImpact" TEXT NOT NULL,
    "suggestedService" TEXT,
    "priority" "Priority" NOT NULL,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'open',
    "estimatedImpactPoints" INTEGER NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AssessmentRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "assignedUserId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'proposed',
    "priority" "Priority" NOT NULL,
    "categoryId" TEXT NOT NULL,
    "estimatedImpactPoints" INTEGER,
    "actualImpactPoints" INTEGER,
    "estimatedCost" DECIMAL(10,2),
    "startDate" TIMESTAMP(3),
    "targetCompletionDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientScoreHistory" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "assessmentId" TEXT,
    "recordedDate" TIMESTAMP(3) NOT NULL,
    "overallScore" DECIMAL(5,2) NOT NULL,
    "securityScore" DECIMAL(5,2),
    "backupScore" DECIMAL(5,2),
    "infrastructureScore" DECIMAL(5,2),
    "endpointScore" DECIMAL(5,2),
    "documentationScore" DECIMAL(5,2),
    "bcdrScore" DECIMAL(5,2),
    "strategicScore" DECIMAL(5,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientScoreHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "assessmentId" TEXT,
    "projectId" TEXT,
    "documentType" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "assessmentId" TEXT,
    "projectId" TEXT,
    "userId" TEXT NOT NULL,
    "noteType" "NoteType" NOT NULL DEFAULT 'general',
    "visibility" "Visibility" NOT NULL DEFAULT 'internal',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentCategory_code_key" ON "AssessmentCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentQuestion_code_key" ON "AssessmentQuestion"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentQuestion_v2QuestionId_key" ON "AssessmentQuestion"("v2QuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "TechnologyProfile_clientId_key" ON "TechnologyProfile"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentResponse_assessmentId_questionId_key" ON "AssessmentResponse"("assessmentId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentCategoryScore_assessmentId_categoryId_key" ON "AssessmentCategoryScore"("assessmentId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationTemplate_code_key" ON "RecommendationTemplate"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Project_recommendationId_key" ON "Project"("recommendationId");

-- AddForeignKey
ALTER TABLE "AssessmentQuestion" ADD CONSTRAINT "AssessmentQuestion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AssessmentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerOption" ADD CONSTRAINT "AnswerOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AssessmentQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerOption" ADD CONSTRAINT "AnswerOption_recommendationTemplateId_fkey" FOREIGN KEY ("recommendationTemplateId") REFERENCES "RecommendationTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_assessorUserId_fkey" FOREIGN KEY ("assessorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_sourceAssessmentId_fkey" FOREIGN KEY ("sourceAssessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnologyProfile" ADD CONSTRAINT "TechnologyProfile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnologyProfile" ADD CONSTRAINT "TechnologyProfile_currentAssessmentId_fkey" FOREIGN KEY ("currentAssessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnologyProfileSnapshot" ADD CONSTRAINT "TechnologyProfileSnapshot_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnologyProfileSnapshot" ADD CONSTRAINT "TechnologyProfileSnapshot_technologyProfileId_fkey" FOREIGN KEY ("technologyProfileId") REFERENCES "TechnologyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnologyProfileSnapshot" ADD CONSTRAINT "TechnologyProfileSnapshot_triggerAssessmentId_fkey" FOREIGN KEY ("triggerAssessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResponse" ADD CONSTRAINT "AssessmentResponse_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResponse" ADD CONSTRAINT "AssessmentResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AssessmentQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResponse" ADD CONSTRAINT "AssessmentResponse_selectedAnswerOptionId_fkey" FOREIGN KEY ("selectedAnswerOptionId") REFERENCES "AnswerOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentCategoryScore" ADD CONSTRAINT "AssessmentCategoryScore_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentCategoryScore" ADD CONSTRAINT "AssessmentCategoryScore_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AssessmentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationTemplate" ADD CONSTRAINT "RecommendationTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AssessmentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentRecommendation" ADD CONSTRAINT "AssessmentRecommendation_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentRecommendation" ADD CONSTRAINT "AssessmentRecommendation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentRecommendation" ADD CONSTRAINT "AssessmentRecommendation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AssessmentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentRecommendation" ADD CONSTRAINT "AssessmentRecommendation_recommendationTemplateId_fkey" FOREIGN KEY ("recommendationTemplateId") REFERENCES "RecommendationTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentRecommendation" ADD CONSTRAINT "AssessmentRecommendation_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "AssessmentRecommendation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AssessmentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientScoreHistory" ADD CONSTRAINT "ClientScoreHistory_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientScoreHistory" ADD CONSTRAINT "ClientScoreHistory_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
