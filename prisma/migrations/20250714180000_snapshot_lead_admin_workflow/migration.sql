-- Extend snapshot lead status enum
ALTER TYPE "TechnologySnapshotLeadStatus" ADD VALUE IF NOT EXISTS 'follow_up';
ALTER TYPE "TechnologySnapshotLeadStatus" ADD VALUE IF NOT EXISTS 'assessment_invited';
ALTER TYPE "TechnologySnapshotLeadStatus" ADD VALUE IF NOT EXISTS 'archived';

-- Lead contact, conversion, and activity timestamps
ALTER TABLE "TechnologySnapshotLead"
  ADD COLUMN IF NOT EXISTS "firstName" TEXT,
  ADD COLUMN IF NOT EXISTS "lastName" TEXT,
  ADD COLUMN IF NOT EXISTS "clientId" TEXT,
  ADD COLUMN IF NOT EXISTS "contactConsentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "contactedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "assessmentInvitedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "convertedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "TechnologySnapshotLead_clientId_idx" ON "TechnologySnapshotLead"("clientId");
CREATE INDEX IF NOT EXISTS "TechnologySnapshotLead_classification_idx" ON "TechnologySnapshotLead"("classification");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TechnologySnapshotLead_clientId_fkey'
  ) THEN
    ALTER TABLE "TechnologySnapshotLead"
      ADD CONSTRAINT "TechnologySnapshotLead_clientId_fkey"
      FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Admin-only internal notes
CREATE TABLE IF NOT EXISTS "TechnologySnapshotLeadNote" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "authorUserId" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TechnologySnapshotLeadNote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TechnologySnapshotLeadNote_leadId_idx" ON "TechnologySnapshotLeadNote"("leadId");
CREATE INDEX IF NOT EXISTS "TechnologySnapshotLeadNote_createdAt_idx" ON "TechnologySnapshotLeadNote"("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TechnologySnapshotLeadNote_leadId_fkey'
  ) THEN
    ALTER TABLE "TechnologySnapshotLeadNote"
      ADD CONSTRAINT "TechnologySnapshotLeadNote_leadId_fkey"
      FOREIGN KEY ("leadId") REFERENCES "TechnologySnapshotLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TechnologySnapshotLeadNote_authorUserId_fkey'
  ) THEN
    ALTER TABLE "TechnologySnapshotLeadNote"
      ADD CONSTRAINT "TechnologySnapshotLeadNote_authorUserId_fkey"
      FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
