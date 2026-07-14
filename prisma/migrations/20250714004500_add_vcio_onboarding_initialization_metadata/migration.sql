-- AlterTable
ALTER TABLE "VcioOnboarding"
    ADD COLUMN "initializationSource" TEXT,
    ADD COLUMN "initializationIdempotencyKey" TEXT,
    ADD COLUMN "initializedAt" TIMESTAMP(3),
    ADD COLUMN "initializationError" TEXT,
    ADD COLUMN "testInitiated" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "welcomeEmailStatus" TEXT,
    ADD COLUMN "welcomeEmailRecipient" TEXT,
    ADD COLUMN "welcomeEmailSentAt" TIMESTAMP(3),
    ADD COLUMN "welcomeEmailMessageId" TEXT,
    ADD COLUMN "welcomeEmailIdempotencyKey" TEXT;

-- CreateIndex
CREATE INDEX "VcioOnboarding_initializationIdempotencyKey_idx" ON "VcioOnboarding"("initializationIdempotencyKey");
CREATE INDEX "VcioOnboarding_welcomeEmailIdempotencyKey_idx" ON "VcioOnboarding"("welcomeEmailIdempotencyKey");
