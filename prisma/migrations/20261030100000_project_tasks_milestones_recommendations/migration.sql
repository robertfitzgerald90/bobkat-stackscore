-- SS-UX-013 — ProjectTask, ProjectMilestone, ProjectRecommendation (expand; keep Project.recommendationId)

CREATE TYPE "ProjectTaskStatus" AS ENUM ('not_started', 'in_progress', 'completed');

CREATE TABLE "ProjectTask" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "internalNotes" TEXT,
    "status" "ProjectTaskStatus" NOT NULL DEFAULT 'not_started',
    "dueDate" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectMilestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMilestone_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectRecommendation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectRecommendation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProjectTask_projectId_sortOrder_idx" ON "ProjectTask"("projectId", "sortOrder");
CREATE INDEX "ProjectTask_clientId_idx" ON "ProjectTask"("clientId");
CREATE INDEX "ProjectTask_status_idx" ON "ProjectTask"("status");

CREATE INDEX "ProjectMilestone_projectId_sortOrder_idx" ON "ProjectMilestone"("projectId", "sortOrder");
CREATE INDEX "ProjectMilestone_clientId_idx" ON "ProjectMilestone"("clientId");

CREATE UNIQUE INDEX "ProjectRecommendation_projectId_recommendationId_key" ON "ProjectRecommendation"("projectId", "recommendationId");
CREATE UNIQUE INDEX "ProjectRecommendation_recommendationId_key" ON "ProjectRecommendation"("recommendationId");
CREATE INDEX "ProjectRecommendation_projectId_idx" ON "ProjectRecommendation"("projectId");
CREATE INDEX "ProjectRecommendation_clientId_idx" ON "ProjectRecommendation"("clientId");

ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectRecommendation" ADD CONSTRAINT "ProjectRecommendation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectRecommendation" ADD CONSTRAINT "ProjectRecommendation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectRecommendation" ADD CONSTRAINT "ProjectRecommendation_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "AssessmentRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill join rows from legacy Project.recommendationId (primary links).
INSERT INTO "ProjectRecommendation" ("id", "projectId", "clientId", "recommendationId", "isPrimary", "createdAt")
SELECT gen_random_uuid()::text, p."id", p."clientId", p."recommendationId", true, CURRENT_TIMESTAMP
FROM "Project" p
ON CONFLICT ("recommendationId") DO NOTHING;
