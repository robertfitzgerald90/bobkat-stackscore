-- SS-SNAP-003: additive Snapshot 2.0 lead fields (staging)
ALTER TABLE "TechnologySnapshotLead" ADD COLUMN IF NOT EXISTS "catalogVersion" TEXT NOT NULL DEFAULT 'snap-1.0';
ALTER TABLE "TechnologySnapshotLead" ADD COLUMN IF NOT EXISTS "findingsJson" JSONB;
ALTER TABLE "TechnologySnapshotLead" ADD COLUMN IF NOT EXISTS "categoryScores" JSONB;
ALTER TABLE "TechnologySnapshotLead" ADD COLUMN IF NOT EXISTS "marketingConsentAt" TIMESTAMP(3);
ALTER TABLE "TechnologySnapshotLead" ADD COLUMN IF NOT EXISTS "campaignId" TEXT;
ALTER TABLE "TechnologySnapshotLead" ADD COLUMN IF NOT EXISTS "sourcePath" TEXT;
CREATE INDEX IF NOT EXISTS "TechnologySnapshotLead_catalogVersion_idx" ON "TechnologySnapshotLead"("catalogVersion");
