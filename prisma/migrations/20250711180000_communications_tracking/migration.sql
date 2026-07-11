-- CreateEnum
CREATE TYPE "CommunicationChannel" AS ENUM ('email');

-- CreateEnum
CREATE TYPE "CommunicationMessageStatus" AS ENUM ('DRAFT', 'QUEUED', 'SENT', 'DELIVERED', 'DELAYED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED', 'COMPLAINED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommunicationEventType" AS ENUM ('MESSAGE_CREATED', 'QUEUED', 'SENT', 'DELIVERED', 'DELAYED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED', 'COMPLAINED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommunicationEventSource" AS ENUM ('RESEND', 'STACKSCORE', 'ADMIN', 'AUTOMATION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "OrganizationActivityCategory" AS ENUM ('COMMUNICATIONS', 'ACCOUNT', 'ASSESSMENT', 'ROADMAP', 'PROPOSAL', 'PROJECT', 'TECHNOLOGY');

-- CreateEnum
CREATE TYPE "OrganizationActivityVisibility" AS ENUM ('INTERNAL', 'CLIENT_VISIBLE');

-- AlterTable
ALTER TABLE "CommunicationTestSend" ADD COLUMN "communicationMessageId" TEXT;

-- CreateTable
CREATE TABLE "CommunicationMessage" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'resend',
    "providerMessageId" TEXT,
    "channel" "CommunicationChannel" NOT NULL DEFAULT 'email',
    "templateKey" TEXT NOT NULL,
    "templateVersion" INTEGER,
    "subject" TEXT NOT NULL,
    "previewText" TEXT,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "senderEmail" TEXT NOT NULL,
    "replyToEmail" TEXT,
    "clientId" TEXT,
    "userId" TEXT,
    "assessmentId" TEXT,
    "roadmapId" TEXT,
    "proposalId" TEXT,
    "projectId" TEXT,
    "campaignId" TEXT,
    "status" "CommunicationMessageStatus" NOT NULL DEFAULT 'QUEUED',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "firstOpenedAt" TIMESTAMP(3),
    "lastOpenedAt" TIMESTAMP(3),
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "firstClickedAt" TIMESTAMP(3),
    "lastClickedAt" TIMESTAMP(3),
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "bouncedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "isTest" BOOLEAN NOT NULL DEFAULT false,
    "metadataJson" JSONB,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationEvent" (
    "id" TEXT NOT NULL,
    "communicationMessageId" TEXT NOT NULL,
    "eventType" "CommunicationEventType" NOT NULL,
    "providerEventId" TEXT,
    "source" "CommunicationEventSource" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "url" TEXT,
    "linkLabel" TEXT,
    "userAgent" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunicationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationActivityEvent" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" TEXT,
    "category" "OrganizationActivityCategory" NOT NULL,
    "eventType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "sourceRecordType" TEXT,
    "sourceRecordId" TEXT,
    "visibility" "OrganizationActivityVisibility" NOT NULL DEFAULT 'INTERNAL',
    "actorUserId" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationTestSend_communicationMessageId_key" ON "CommunicationTestSend"("communicationMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationMessage_providerMessageId_key" ON "CommunicationMessage"("providerMessageId");

-- CreateIndex
CREATE INDEX "CommunicationMessage_clientId_idx" ON "CommunicationMessage"("clientId");

-- CreateIndex
CREATE INDEX "CommunicationMessage_templateKey_idx" ON "CommunicationMessage"("templateKey");

-- CreateIndex
CREATE INDEX "CommunicationMessage_status_idx" ON "CommunicationMessage"("status");

-- CreateIndex
CREATE INDEX "CommunicationMessage_isTest_idx" ON "CommunicationMessage"("isTest");

-- CreateIndex
CREATE INDEX "CommunicationMessage_sentAt_idx" ON "CommunicationMessage"("sentAt");

-- CreateIndex
CREATE INDEX "CommunicationMessage_recipientEmail_idx" ON "CommunicationMessage"("recipientEmail");

-- CreateIndex
CREATE INDEX "CommunicationMessage_createdAt_idx" ON "CommunicationMessage"("createdAt");

-- CreateIndex
CREATE INDEX "CommunicationMessage_assessmentId_idx" ON "CommunicationMessage"("assessmentId");

-- CreateIndex
CREATE INDEX "CommunicationMessage_projectId_idx" ON "CommunicationMessage"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationEvent_providerEventId_key" ON "CommunicationEvent"("providerEventId");

-- CreateIndex
CREATE INDEX "CommunicationEvent_communicationMessageId_occurredAt_idx" ON "CommunicationEvent"("communicationMessageId", "occurredAt");

-- CreateIndex
CREATE INDEX "CommunicationEvent_eventType_idx" ON "CommunicationEvent"("eventType");

-- CreateIndex
CREATE INDEX "CommunicationEvent_occurredAt_idx" ON "CommunicationEvent"("occurredAt");

-- CreateIndex
CREATE INDEX "OrganizationActivityEvent_clientId_occurredAt_idx" ON "OrganizationActivityEvent"("clientId", "occurredAt");

-- CreateIndex
CREATE INDEX "OrganizationActivityEvent_category_idx" ON "OrganizationActivityEvent"("category");

-- CreateIndex
CREATE INDEX "OrganizationActivityEvent_visibility_idx" ON "OrganizationActivityEvent"("visibility");

-- CreateIndex
CREATE INDEX "OrganizationActivityEvent_eventType_idx" ON "OrganizationActivityEvent"("eventType");

-- CreateIndex
CREATE INDEX "OrganizationActivityEvent_sourceRecordType_sourceRecordId_idx" ON "OrganizationActivityEvent"("sourceRecordType", "sourceRecordId");

-- AddForeignKey
ALTER TABLE "CommunicationTestSend" ADD CONSTRAINT "CommunicationTestSend_communicationMessageId_fkey" FOREIGN KEY ("communicationMessageId") REFERENCES "CommunicationMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationEvent" ADD CONSTRAINT "CommunicationEvent_communicationMessageId_fkey" FOREIGN KEY ("communicationMessageId") REFERENCES "CommunicationMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationActivityEvent" ADD CONSTRAINT "OrganizationActivityEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationActivityEvent" ADD CONSTRAINT "OrganizationActivityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationActivityEvent" ADD CONSTRAINT "OrganizationActivityEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
