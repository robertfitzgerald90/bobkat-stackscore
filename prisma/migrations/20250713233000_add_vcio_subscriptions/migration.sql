-- CreateEnum
CREATE TYPE "BillingProvider" AS ENUM ('stripe');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('stackscore_vcio');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM (
    'active',
    'trialing',
    'past_due',
    'unpaid',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'paused',
    'unknown'
);

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('month', 'year', 'custom');

-- CreateEnum
CREATE TYPE "VcioOnboardingStatus" AS ENUM ('not_started', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "VcioReviewStatus" AS ENUM ('draft', 'scheduled', 'in_review', 'completed');

-- AlterTable
ALTER TABLE "ClientBillingProfile" ADD COLUMN "stripeCustomerId" TEXT;

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "recurringServiceId" TEXT,
    "provider" "BillingProvider" NOT NULL DEFAULT 'stripe',
    "providerCustomerId" TEXT NOT NULL,
    "providerSubscriptionId" TEXT NOT NULL,
    "providerPriceId" TEXT NOT NULL,
    "providerProductId" TEXT,
    "serviceType" "ServiceType" NOT NULL,
    "billingInterval" "BillingInterval" NOT NULL DEFAULT 'month',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'incomplete',
    "rawStatus" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "latestInvoiceProviderId" TEXT,
    "lastPaymentAt" TIMESTAMP(3),
    "paymentFailedAt" TIMESTAMP(3),
    "paymentActionRequiredAt" TIMESTAMP(3),
    "lastStripeEventCreatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionInvoice" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "provider" "BillingProvider" NOT NULL DEFAULT 'stripe',
    "providerInvoiceId" TEXT NOT NULL,
    "providerPaymentIntentId" TEXT,
    "number" TEXT,
    "amountDueCents" INTEGER NOT NULL DEFAULT 0,
    "amountPaidCents" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "hostedInvoiceUrl" TEXT,
    "invoicePdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SubscriptionInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VcioOnboarding" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "status" "VcioOnboardingStatus" NOT NULL DEFAULT 'not_started',
    "baselineRequired" BOOLEAN NOT NULL DEFAULT true,
    "businessInfoJson" JSONB,
    "leadershipJson" JSONB,
    "environmentJson" JSONB,
    "planningJson" JSONB,
    "assessmentStatus" TEXT,
    "strategySessionScheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VcioOnboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VcioQuarterlyReview" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "reviewPeriodStart" TIMESTAMP(3) NOT NULL,
    "reviewPeriodEnd" TIMESTAMP(3) NOT NULL,
    "reviewDate" TIMESTAMP(3),
    "status" "VcioReviewStatus" NOT NULL DEFAULT 'draft',
    "executiveSummary" TEXT,
    "scoreMovementJson" JSONB,
    "completedProjectsJson" JSONB,
    "openRisksJson" JSONB,
    "nextQuarterPrioritiesJson" JSONB,
    "budgetSummaryJson" JSONB,
    "plannedInvestmentsJson" JSONB,
    "meetingNotes" TEXT,
    "internalNotes" TEXT,
    "linkedReportDocumentId" TEXT,
    "linkedRoadmapId" TEXT,
    "nextReviewDate" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VcioQuarterlyReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_providerSubscriptionId_key" ON "Subscription"("providerSubscriptionId");
CREATE INDEX "Subscription_clientId_idx" ON "Subscription"("clientId");
CREATE INDEX "Subscription_serviceType_idx" ON "Subscription"("serviceType");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX "Subscription_providerCustomerId_idx" ON "Subscription"("providerCustomerId");
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "Subscription"("currentPeriodEnd");
CREATE INDEX "Subscription_latestInvoiceProviderId_idx" ON "Subscription"("latestInvoiceProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionInvoice_providerInvoiceId_key" ON "SubscriptionInvoice"("providerInvoiceId");
CREATE INDEX "SubscriptionInvoice_subscriptionId_idx" ON "SubscriptionInvoice"("subscriptionId");
CREATE INDEX "SubscriptionInvoice_clientId_idx" ON "SubscriptionInvoice"("clientId");
CREATE INDEX "SubscriptionInvoice_status_idx" ON "SubscriptionInvoice"("status");
CREATE INDEX "SubscriptionInvoice_invoiceDate_idx" ON "SubscriptionInvoice"("invoiceDate");

-- CreateIndex
CREATE UNIQUE INDEX "VcioOnboarding_clientId_key" ON "VcioOnboarding"("clientId");
CREATE UNIQUE INDEX "VcioOnboarding_subscriptionId_key" ON "VcioOnboarding"("subscriptionId");
CREATE INDEX "VcioOnboarding_status_idx" ON "VcioOnboarding"("status");

-- CreateIndex
CREATE INDEX "VcioQuarterlyReview_clientId_idx" ON "VcioQuarterlyReview"("clientId");
CREATE INDEX "VcioQuarterlyReview_subscriptionId_idx" ON "VcioQuarterlyReview"("subscriptionId");
CREATE INDEX "VcioQuarterlyReview_status_idx" ON "VcioQuarterlyReview"("status");
CREATE INDEX "VcioQuarterlyReview_reviewDate_idx" ON "VcioQuarterlyReview"("reviewDate");
CREATE INDEX "VcioQuarterlyReview_nextReviewDate_idx" ON "VcioQuarterlyReview"("nextReviewDate");

-- CreateIndex
CREATE UNIQUE INDEX "ClientBillingProfile_stripeCustomerId_key" ON "ClientBillingProfile"("stripeCustomerId");
CREATE INDEX "ClientBillingProfile_stripeCustomerId_idx" ON "ClientBillingProfile"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_recurringServiceId_fkey" FOREIGN KEY ("recurringServiceId") REFERENCES "RecurringService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SubscriptionInvoice" ADD CONSTRAINT "SubscriptionInvoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubscriptionInvoice" ADD CONSTRAINT "SubscriptionInvoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VcioOnboarding" ADD CONSTRAINT "VcioOnboarding_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VcioOnboarding" ADD CONSTRAINT "VcioOnboarding_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VcioQuarterlyReview" ADD CONSTRAINT "VcioQuarterlyReview_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VcioQuarterlyReview" ADD CONSTRAINT "VcioQuarterlyReview_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VcioQuarterlyReview" ADD CONSTRAINT "VcioQuarterlyReview_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
