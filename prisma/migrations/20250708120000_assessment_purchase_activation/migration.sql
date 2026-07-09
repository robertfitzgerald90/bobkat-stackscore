-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('pending', 'fulfilled', 'failed', 'manual_review', 'refunded');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "clientId" TEXT,
ADD COLUMN "invitedAt" TIMESTAMP(3),
ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AssessmentPurchase" (
    "id" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripePaymentIntentId" TEXT,
    "productType" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'pending',
    "paymentStatus" TEXT NOT NULL,
    "amountTotal" INTEGER,
    "currency" TEXT,
    "purchaserEmail" TEXT NOT NULL,
    "failureReason" TEXT,
    "clientId" TEXT,
    "userId" TEXT,
    "assessmentId" TEXT,
    "fulfilledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountActivationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountActivationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clientId_key" ON "User"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentPurchase_stripeSessionId_key" ON "AssessmentPurchase"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentPurchase_assessmentId_key" ON "AssessmentPurchase"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountActivationToken_tokenHash_key" ON "AccountActivationToken"("tokenHash");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentPurchase" ADD CONSTRAINT "AssessmentPurchase_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentPurchase" ADD CONSTRAINT "AssessmentPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentPurchase" ADD CONSTRAINT "AssessmentPurchase_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountActivationToken" ADD CONSTRAINT "AccountActivationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
