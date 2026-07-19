-- CreateEnum
CREATE TYPE "OperationalNotificationSeverity" AS ENUM ('info', 'attention', 'urgent');
CREATE TYPE "OperationalNotificationCategory" AS ENUM ('qbr', 'proposal', 'assessment', 'refresh', 'warranty', 'license', 'roadmap', 'risk', 'managed_service', 'automation', 'revenue');

-- CreateTable
CREATE TABLE "OperationalNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT,
    "category" "OperationalNotificationCategory" NOT NULL,
    "severity" "OperationalNotificationSeverity" NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "actionHref" TEXT,
    "actionLabel" TEXT,
    "dedupeKey" TEXT NOT NULL,
    "metadataJson" JSONB,
    "readAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalNotification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OperationalNotification_userId_dedupeKey_key" ON "OperationalNotification"("userId", "dedupeKey");
CREATE INDEX "OperationalNotification_userId_readAt_createdAt_idx" ON "OperationalNotification"("userId", "readAt", "createdAt");
CREATE INDEX "OperationalNotification_clientId_category_idx" ON "OperationalNotification"("clientId", "category");
CREATE INDEX "OperationalNotification_severity_createdAt_idx" ON "OperationalNotification"("severity", "createdAt");

ALTER TABLE "OperationalNotification" ADD CONSTRAINT "OperationalNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalNotification" ADD CONSTRAINT "OperationalNotification_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
