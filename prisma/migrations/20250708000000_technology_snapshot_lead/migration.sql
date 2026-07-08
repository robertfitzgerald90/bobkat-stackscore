-- Technology Snapshot public lead capture (MVP)

CREATE TYPE "TechnologySnapshotLeadStatus" AS ENUM (
  'new',
  'contacted',
  'assessment_interested',
  'assessment_purchased',
  'not_interested',
  'converted'
);

CREATE TYPE "SnapshotItManagementModel" AS ENUM (
  'in_house',
  'outsourced',
  'part_time_internal',
  'none',
  'unsure'
);

CREATE TABLE "TechnologySnapshotLead" (
  "id" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "industry" TEXT NOT NULL,
  "companySize" TEXT,
  "itManagementModel" "SnapshotItManagementModel" NOT NULL,
  "answers" JSONB NOT NULL,
  "totalScore" INTEGER NOT NULL,
  "classification" TEXT NOT NULL,
  "lowestPillars" JSONB NOT NULL,
  "status" "TechnologySnapshotLeadStatus" NOT NULL DEFAULT 'new',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TechnologySnapshotLead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TechnologySnapshotLead_status_idx" ON "TechnologySnapshotLead"("status");
CREATE INDEX "TechnologySnapshotLead_createdAt_idx" ON "TechnologySnapshotLead"("createdAt");
CREATE INDEX "TechnologySnapshotLead_email_idx" ON "TechnologySnapshotLead"("email");
