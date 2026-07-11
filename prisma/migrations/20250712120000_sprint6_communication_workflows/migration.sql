-- Sprint 6: Communication workflows, contacts, queue, proposal lifecycle

-- Enums
CREATE TYPE "NotificationDeliveryMode" AS ENUM ('inherit', 'automatic', 'manual');
CREATE TYPE "CommunicationQueueStatus" AS ENUM ('pending_review', 'approved', 'scheduled', 'sending', 'sent', 'cancelled', 'dismissed', 'failed');
CREATE TYPE "QuarterlyReviewReminderStatus" AS ENUM ('pending', 'scheduled', 'sent', 'dismissed', 'delayed');

-- Extend TechnologyImprovementPlanStatus
ALTER TYPE "TechnologyImprovementPlanStatus" ADD VALUE IF NOT EXISTS 'published';
ALTER TYPE "TechnologyImprovementPlanStatus" ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE "TechnologyImprovementPlanStatus" ADD VALUE IF NOT EXISTS 'revision_requested';

-- Extend CommunicationEventType
ALTER TYPE "CommunicationEventType" ADD VALUE IF NOT EXISTS 'VIEWED';
ALTER TYPE "CommunicationEventType" ADD VALUE IF NOT EXISTS 'DOWNLOADED';
ALTER TYPE "CommunicationEventType" ADD VALUE IF NOT EXISTS 'APPROVED';
ALTER TYPE "CommunicationEventType" ADD VALUE IF NOT EXISTS 'REVISION_REQUESTED';
ALTER TYPE "CommunicationEventType" ADD VALUE IF NOT EXISTS 'SIGNED';
ALTER TYPE "CommunicationEventType" ADD VALUE IF NOT EXISTS 'PASSWORD_RESET_COMPLETED';
ALTER TYPE "CommunicationEventType" ADD VALUE IF NOT EXISTS 'TIMELINE_VIEWED';

-- Client notification settings
ALTER TABLE "Client" ADD COLUMN "projectCompletionNotification" "NotificationDeliveryMode" NOT NULL DEFAULT 'inherit';
ALTER TABLE "Client" ADD COLUMN "quarterlyReviewAnchorAt" TIMESTAMP(3);

-- Project notification override
ALTER TABLE "Project" ADD COLUMN "completionNotificationOverride" "NotificationDeliveryMode";

-- TIP / Proposal lifecycle fields
ALTER TABLE "TechnologyImprovementPlan" ADD COLUMN "publishedAt" TIMESTAMP(3);
ALTER TABLE "TechnologyImprovementPlan" ADD COLUMN "publishedByUserId" TEXT;
ALTER TABLE "TechnologyImprovementPlan" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "TechnologyImprovementPlan" ADD COLUMN "approvedByUserId" TEXT;
ALTER TABLE "TechnologyImprovementPlan" ADD COLUMN "approvedByContactId" TEXT;
ALTER TABLE "TechnologyImprovementPlan" ADD COLUMN "signatureJson" JSONB;
ALTER TABLE "TechnologyImprovementPlan" ADD COLUMN "revisionRequestedAt" TIMESTAMP(3);
ALTER TABLE "TechnologyImprovementPlan" ADD COLUMN "revisionNotes" TEXT;

ALTER TABLE "TechnologyImprovementPlan" ADD CONSTRAINT "TechnologyImprovementPlan_publishedByUserId_fkey"
  FOREIGN KEY ("publishedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TechnologyImprovementPlan" ADD CONSTRAINT "TechnologyImprovementPlan_approvedByUserId_fkey"
  FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Snapshot lead ↔ prospect link
ALTER TABLE "TechnologySnapshotLead" ADD COLUMN "prospectId" TEXT;
CREATE UNIQUE INDEX "TechnologySnapshotLead_prospectId_key" ON "TechnologySnapshotLead"("prospectId");
ALTER TABLE "TechnologySnapshotLead" ADD CONSTRAINT "TechnologySnapshotLead_prospectId_fkey"
  FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Communication queue item
ALTER TABLE "CommunicationMessage" ADD COLUMN "queueItemId" TEXT;

CREATE TABLE "CommunicationWorkflowSettings" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "defaultSenderEmail" TEXT,
  "defaultReplyToEmail" TEXT,
  "recipientDefaultsJson" JSONB NOT NULL DEFAULT '{}',
  "ctaDestinationsJson" JSONB NOT NULL DEFAULT '{}',
  "internalNotificationEmailsJson" JSONB NOT NULL DEFAULT '[]',
  "proposalApprovalNotificationEmail" TEXT NOT NULL DEFAULT 'bobby@bobkatit.com',
  "quarterlyReviewDaysAfterAssessment" INTEGER NOT NULL DEFAULT 90,
  "quarterlyReviewLeadDays" INTEGER NOT NULL DEFAULT 14,
  "attachmentDefaultsJson" JSONB NOT NULL DEFAULT '{}',
  "projectCompletionDefault" "NotificationDeliveryMode" NOT NULL DEFAULT 'automatic',
  "updatedByUserId" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunicationWorkflowSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClientContact" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "title" TEXT,
  "rolesJson" JSONB NOT NULL DEFAULT '[]',
  "communicationPreferencesJson" JSONB NOT NULL DEFAULT '{}',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClientContact_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClientContact_clientId_email_key" ON "ClientContact"("clientId", "email");
CREATE INDEX "ClientContact_clientId_idx" ON "ClientContact"("clientId");
CREATE INDEX "ClientContact_email_idx" ON "ClientContact"("email");

ALTER TABLE "ClientContact" ADD CONSTRAINT "ClientContact_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientContact" ADD CONSTRAINT "ClientContact_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TechnologyImprovementPlan" ADD CONSTRAINT "TechnologyImprovementPlan_approvedByContactId_fkey"
  FOREIGN KEY ("approvedByContactId") REFERENCES "ClientContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "CommunicationQueueItem" (
  "id" TEXT NOT NULL,
  "workflowKey" TEXT NOT NULL,
  "templateKey" TEXT NOT NULL,
  "status" "CommunicationQueueStatus" NOT NULL DEFAULT 'pending_review',
  "clientId" TEXT,
  "prospectId" TEXT,
  "assessmentId" TEXT,
  "tipId" TEXT,
  "projectIdsJson" JSONB,
  "recipientSelectionJson" JSONB NOT NULL DEFAULT '{}',
  "payloadJson" JSONB,
  "scheduledFor" TIMESTAMP(3),
  "reviewRequired" BOOLEAN NOT NULL DEFAULT true,
  "autoSend" BOOLEAN NOT NULL DEFAULT false,
  "createdByUserId" TEXT,
  "approvedByUserId" TEXT,
  "sentAt" TIMESTAMP(3),
  "dismissedAt" TIMESTAMP(3),
  "failureReason" TEXT,
  "metadataJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunicationQueueItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommunicationQueueItem_status_idx" ON "CommunicationQueueItem"("status");
CREATE INDEX "CommunicationQueueItem_clientId_idx" ON "CommunicationQueueItem"("clientId");
CREATE INDEX "CommunicationQueueItem_scheduledFor_idx" ON "CommunicationQueueItem"("scheduledFor");
CREATE INDEX "CommunicationQueueItem_workflowKey_idx" ON "CommunicationQueueItem"("workflowKey");

ALTER TABLE "CommunicationQueueItem" ADD CONSTRAINT "CommunicationQueueItem_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunicationQueueItem" ADD CONSTRAINT "CommunicationQueueItem_prospectId_fkey"
  FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunicationQueueItem" ADD CONSTRAINT "CommunicationQueueItem_assessmentId_fkey"
  FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunicationQueueItem" ADD CONSTRAINT "CommunicationQueueItem_tipId_fkey"
  FOREIGN KEY ("tipId") REFERENCES "TechnologyImprovementPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunicationQueueItem" ADD CONSTRAINT "CommunicationQueueItem_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunicationQueueItem" ADD CONSTRAINT "CommunicationQueueItem_approvedByUserId_fkey"
  FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_queueItemId_fkey"
  FOREIGN KEY ("queueItemId") REFERENCES "CommunicationQueueItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_proposalId_fkey"
  FOREIGN KEY ("proposalId") REFERENCES "TechnologyImprovementPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "PasswordResetToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX "PasswordResetToken_tokenHash_idx" ON "PasswordResetToken"("tokenHash");

ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "QuarterlyReviewReminder" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "dueAt" TIMESTAMP(3) NOT NULL,
  "status" "QuarterlyReviewReminderStatus" NOT NULL DEFAULT 'pending',
  "delayedUntil" TIMESTAMP(3),
  "scheduledFor" TIMESTAMP(3),
  "dismissedAt" TIMESTAMP(3),
  "dismissReason" TEXT,
  "lastAssessmentCompletedAt" TIMESTAMP(3),
  "queueItemId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QuarterlyReviewReminder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "QuarterlyReviewReminder_idempotencyKey_key" ON "QuarterlyReviewReminder"("idempotencyKey");
CREATE INDEX "QuarterlyReviewReminder_clientId_idx" ON "QuarterlyReviewReminder"("clientId");
CREATE INDEX "QuarterlyReviewReminder_status_idx" ON "QuarterlyReviewReminder"("status");
CREATE INDEX "QuarterlyReviewReminder_dueAt_idx" ON "QuarterlyReviewReminder"("dueAt");

ALTER TABLE "QuarterlyReviewReminder" ADD CONSTRAINT "QuarterlyReviewReminder_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "CommunicationWorkflowSettings" ("id", "updatedAt")
VALUES ('default', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
