-- Quarterly Business Review (Phase C3)

CREATE TYPE "QuarterlyBusinessReviewStatus" AS ENUM ('draft', 'generated');

ALTER TYPE "DocumentType" ADD VALUE 'quarterly_business_review';

CREATE TABLE "QuarterlyBusinessReview" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "reviewPeriodStart" TIMESTAMP(3) NOT NULL,
  "reviewPeriodEnd" TIMESTAMP(3) NOT NULL,
  "title" TEXT NOT NULL,
  "status" "QuarterlyBusinessReviewStatus" NOT NULL DEFAULT 'draft',
  "executiveSummary" TEXT,
  "generatedAt" TIMESTAMP(3),
  "createdByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "QuarterlyBusinessReview_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Document" ADD COLUMN "qbrId" TEXT;

CREATE UNIQUE INDEX "Document_qbrId_key" ON "Document"("qbrId");

ALTER TABLE "QuarterlyBusinessReview"
  ADD CONSTRAINT "QuarterlyBusinessReview_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "QuarterlyBusinessReview"
  ADD CONSTRAINT "QuarterlyBusinessReview_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Document"
  ADD CONSTRAINT "Document_qbrId_fkey"
  FOREIGN KEY ("qbrId") REFERENCES "QuarterlyBusinessReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;
