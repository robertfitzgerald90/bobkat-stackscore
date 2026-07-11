-- CreateEnum
CREATE TYPE "CommunicationTestSendStatus" AS ENUM ('sent', 'failed');

-- CreateTable
CREATE TABLE "CommunicationTestSend" (
    "id" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "status" "CommunicationTestSendStatus" NOT NULL,
    "errorMessage" TEXT,
    "sentByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunicationTestSend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunicationTestSend_createdAt_idx" ON "CommunicationTestSend"("createdAt");

-- CreateIndex
CREATE INDEX "CommunicationTestSend_templateKey_idx" ON "CommunicationTestSend"("templateKey");

-- CreateIndex
CREATE INDEX "CommunicationTestSend_sentByUserId_idx" ON "CommunicationTestSend"("sentByUserId");

-- AddForeignKey
ALTER TABLE "CommunicationTestSend" ADD CONSTRAINT "CommunicationTestSend_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
