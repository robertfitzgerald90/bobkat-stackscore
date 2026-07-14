-- AlterTable
ALTER TABLE "CommunicationMessage"
    ADD COLUMN "eventKey" TEXT,
    ADD COLUMN "sendType" TEXT NOT NULL DEFAULT 'AUTOMATED',
    ADD COLUMN "idempotencyKey" TEXT,
    ADD COLUMN "triggeredBy" TEXT,
    ADD COLUMN "relatedEntityType" TEXT,
    ADD COLUMN "relatedEntityId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationMessage_idempotencyKey_key" ON "CommunicationMessage"("idempotencyKey");
CREATE INDEX "CommunicationMessage_eventKey_idx" ON "CommunicationMessage"("eventKey");
CREATE INDEX "CommunicationMessage_sendType_idx" ON "CommunicationMessage"("sendType");
