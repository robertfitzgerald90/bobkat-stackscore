-- SS-UX-015 — ProjectCustomerUpdate (manual customer project updates)

CREATE TYPE "ProjectCustomerUpdateStatus" AS ENUM ('draft', 'sending', 'sent', 'failed', 'cancelled');

CREATE TABLE "ProjectCustomerUpdate" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "ProjectCustomerUpdateStatus" NOT NULL DEFAULT 'draft',
    "draftJson" JSONB NOT NULL,
    "snapshotJson" JSONB,
    "subject" TEXT,
    "previewText" TEXT,
    "publishedAt" TIMESTAMP(3),
    "communicationMessageId" TEXT,
    "idempotencyKey" TEXT,
    "createdByUserId" TEXT,
    "sentByUserId" TEXT,
    "sentAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectCustomerUpdate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectCustomerUpdate_communicationMessageId_key" ON "ProjectCustomerUpdate"("communicationMessageId");
CREATE UNIQUE INDEX "ProjectCustomerUpdate_idempotencyKey_key" ON "ProjectCustomerUpdate"("idempotencyKey");
CREATE INDEX "ProjectCustomerUpdate_projectId_publishedAt_idx" ON "ProjectCustomerUpdate"("projectId", "publishedAt");
CREATE INDEX "ProjectCustomerUpdate_clientId_idx" ON "ProjectCustomerUpdate"("clientId");
CREATE INDEX "ProjectCustomerUpdate_status_idx" ON "ProjectCustomerUpdate"("status");

ALTER TABLE "ProjectCustomerUpdate" ADD CONSTRAINT "ProjectCustomerUpdate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectCustomerUpdate" ADD CONSTRAINT "ProjectCustomerUpdate_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectCustomerUpdate" ADD CONSTRAINT "ProjectCustomerUpdate_communicationMessageId_fkey" FOREIGN KEY ("communicationMessageId") REFERENCES "CommunicationMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProjectCustomerUpdate" ADD CONSTRAINT "ProjectCustomerUpdate_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProjectCustomerUpdate" ADD CONSTRAINT "ProjectCustomerUpdate_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
