-- CreateEnum
CREATE TYPE "WebsiteLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONSULTATION_BOOKED', 'CONVERTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "WebsiteLeadSource" AS ENUM ('BOBKAT_WEBSITE_CONTACT', 'TECHNOLOGY_SNAPSHOT', 'MANUAL', 'OTHER');

-- CreateTable
CREATE TABLE "WebsiteLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" "WebsiteLeadSource" NOT NULL,
    "status" "WebsiteLeadStatus" NOT NULL DEFAULT 'NEW',
    "internalNotes" TEXT,
    "submissionId" TEXT,
    "websiteUrl" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastContactedAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),
    "linkedClientId" TEXT,
    "linkedAssessmentId" TEXT,

    CONSTRAINT "WebsiteLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteLead_submissionId_key" ON "WebsiteLead"("submissionId");

-- CreateIndex
CREATE INDEX "WebsiteLead_status_idx" ON "WebsiteLead"("status");

-- CreateIndex
CREATE INDEX "WebsiteLead_source_idx" ON "WebsiteLead"("source");

-- CreateIndex
CREATE INDEX "WebsiteLead_submittedAt_idx" ON "WebsiteLead"("submittedAt");

-- CreateIndex
CREATE INDEX "WebsiteLead_email_idx" ON "WebsiteLead"("email");

-- CreateIndex
CREATE INDEX "WebsiteLead_linkedClientId_idx" ON "WebsiteLead"("linkedClientId");

-- AddForeignKey
ALTER TABLE "WebsiteLead" ADD CONSTRAINT "WebsiteLead_linkedClientId_fkey" FOREIGN KEY ("linkedClientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteLead" ADD CONSTRAINT "WebsiteLead_linkedAssessmentId_fkey" FOREIGN KEY ("linkedAssessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
