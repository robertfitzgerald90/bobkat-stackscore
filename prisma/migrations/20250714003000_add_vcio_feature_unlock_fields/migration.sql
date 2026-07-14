-- AlterEnum
ALTER TYPE "NoteType" ADD VALUE IF NOT EXISTS 'executive';
ALTER TYPE "NoteType" ADD VALUE IF NOT EXISTS 'strategy_session';

-- AlterTable
ALTER TABLE "Note"
    ADD COLUMN "title" TEXT,
    ADD COLUMN "scheduledAt" TIMESTAMP(3),
    ADD COLUMN "completedAt" TIMESTAMP(3),
    ADD COLUMN "actionItemsJson" JSONB,
    ADD COLUMN "metadataJson" JSONB,
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ClientTechnology"
    ADD COLUMN "licenseCount" INTEGER,
    ADD COLUMN "licenseRenewalDate" TIMESTAMP(3),
    ADD COLUMN "purchaseDate" TIMESTAMP(3),
    ADD COLUMN "warrantyExpiresAt" TIMESTAMP(3),
    ADD COLUMN "plannedReplacementDate" TIMESTAMP(3),
    ADD COLUMN "budgetAmountCents" INTEGER,
    ADD COLUMN "budgetPeriod" TEXT,
    ADD COLUMN "budgetNotes" TEXT;

-- CreateIndex
CREATE INDEX "Note_noteType_scheduledAt_idx" ON "Note"("noteType", "scheduledAt");
CREATE INDEX "ClientTechnology_renewalDate_idx" ON "ClientTechnology"("renewalDate");
CREATE INDEX "ClientTechnology_warrantyExpiresAt_idx" ON "ClientTechnology"("warrantyExpiresAt");
CREATE INDEX "ClientTechnology_plannedReplacementDate_idx" ON "ClientTechnology"("plannedReplacementDate");
