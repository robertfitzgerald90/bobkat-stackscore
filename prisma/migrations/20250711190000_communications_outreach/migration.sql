-- Sprint 4: Campaign & Quick Invite outreach models

CREATE TYPE "ProspectStatus" AS ENUM (
  'new',
  'invited',
  'opened',
  'clicked',
  'assessment_started',
  'assessment_completed',
  'converted',
  'archived'
);

CREATE TYPE "ProspectLeadSource" AS ENUM (
  'quick_invite',
  'csv_import',
  'campaign',
  'referral',
  'networking',
  'website',
  'manual',
  'other'
);

CREATE TYPE "CommunicationCampaignStatus" AS ENUM (
  'draft',
  'ready',
  'sending',
  'completed',
  'archived'
);

CREATE TABLE "Prospect" (
  "id" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "industry" TEXT,
  "employeeCount" INTEGER,
  "leadSource" "ProspectLeadSource" NOT NULL DEFAULT 'quick_invite',
  "notes" TEXT,
  "status" "ProspectStatus" NOT NULL DEFAULT 'new',
  "clientId" TEXT,
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "lastContactAt" TIMESTAMP(3),

  CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunicationCampaign" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "templateKey" TEXT NOT NULL DEFAULT 'EMAIL-009',
  "status" "CommunicationCampaignStatus" NOT NULL DEFAULT 'draft',
  "createdByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),

  CONSTRAINT "CommunicationCampaign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CampaignRecipient" (
  "id" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "prospectId" TEXT NOT NULL,
  "clientId" TEXT,
  "userId" TEXT,
  "assessmentId" TEXT,
  "communicationMessageId" TEXT,
  "invitedAt" TIMESTAMP(3),
  "openedAt" TIMESTAMP(3),
  "clickedAt" TIMESTAMP(3),
  "assessmentStartedAt" TIMESTAMP(3),
  "assessmentCompletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CampaignRecipient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CampaignEvent" (
  "id" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadataJson" JSONB,
  "actorUserId" TEXT,
  "recipientId" TEXT,

  CONSTRAINT "CampaignEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Prospect_email_key" ON "Prospect"("email");
CREATE UNIQUE INDEX "Prospect_clientId_key" ON "Prospect"("clientId");
CREATE INDEX "Prospect_company_idx" ON "Prospect"("company");
CREATE INDEX "Prospect_status_idx" ON "Prospect"("status");
CREATE INDEX "Prospect_industry_idx" ON "Prospect"("industry");
CREATE INDEX "Prospect_createdAt_idx" ON "Prospect"("createdAt");
CREATE INDEX "Prospect_lastContactAt_idx" ON "Prospect"("lastContactAt");

CREATE INDEX "CommunicationCampaign_status_idx" ON "CommunicationCampaign"("status");
CREATE INDEX "CommunicationCampaign_createdAt_idx" ON "CommunicationCampaign"("createdAt");
CREATE INDEX "CommunicationCampaign_createdByUserId_idx" ON "CommunicationCampaign"("createdByUserId");

CREATE UNIQUE INDEX "CampaignRecipient_communicationMessageId_key" ON "CampaignRecipient"("communicationMessageId");
CREATE UNIQUE INDEX "CampaignRecipient_campaignId_prospectId_key" ON "CampaignRecipient"("campaignId", "prospectId");
CREATE INDEX "CampaignRecipient_campaignId_idx" ON "CampaignRecipient"("campaignId");
CREATE INDEX "CampaignRecipient_prospectId_idx" ON "CampaignRecipient"("prospectId");
CREATE INDEX "CampaignRecipient_clientId_idx" ON "CampaignRecipient"("clientId");

CREATE INDEX "CampaignEvent_campaignId_occurredAt_idx" ON "CampaignEvent"("campaignId", "occurredAt");
CREATE INDEX "CampaignEvent_eventType_idx" ON "CampaignEvent"("eventType");

CREATE INDEX "CommunicationMessage_campaignId_idx" ON "CommunicationMessage"("campaignId");

ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CommunicationCampaign" ADD CONSTRAINT "CommunicationCampaign_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "CommunicationCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_communicationMessageId_fkey" FOREIGN KEY ("communicationMessageId") REFERENCES "CommunicationMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CampaignEvent" ADD CONSTRAINT "CampaignEvent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "CommunicationCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CampaignEvent" ADD CONSTRAINT "CampaignEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CampaignEvent" ADD CONSTRAINT "CampaignEvent_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "CampaignRecipient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "CommunicationCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
