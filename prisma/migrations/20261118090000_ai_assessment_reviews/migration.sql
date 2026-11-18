CREATE TABLE "AssessmentAiReview" (
  "id" TEXT NOT NULL, "assessmentId" TEXT NOT NULL, "clientId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'queued', "createdByUserId" TEXT NOT NULL,
  "approvedByUserId" TEXT, "inputHash" TEXT NOT NULL, "snapshot" JSONB NOT NULL,
  "draft" JSONB, "model" TEXT NOT NULL, "promptVersion" TEXT NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 0, "usage" JSONB, "errorCode" TEXT,
  "startedAt" TIMESTAMP(3), "finishedAt" TIMESTAMP(3), "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AssessmentAiReview_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AssessmentAiReview_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AssessmentAiReview_status_check" CHECK ("status" IN ('queued', 'generating', 'draft', 'approved', 'failed'))
);
CREATE INDEX "AssessmentAiReview_assessmentId_createdAt_idx" ON "AssessmentAiReview"("assessmentId", "createdAt");
CREATE INDEX "AssessmentAiReview_clientId_status_idx" ON "AssessmentAiReview"("clientId", "status");
CREATE INDEX "AssessmentAiReview_createdAt_idx" ON "AssessmentAiReview"("createdAt");
CREATE UNIQUE INDEX "AssessmentAiReview_one_active" ON "AssessmentAiReview"("assessmentId") WHERE "status" IN ('queued', 'generating');
