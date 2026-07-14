-- CreateEnum
CREATE TYPE "PaymentAttemptStatus" AS ENUM (
    'succeeded',
    'failed',
    'requires_action',
    'processing',
    'retrying',
    'refunded',
    'voided'
);

-- AlterTable
ALTER TABLE "SubscriptionInvoice"
    ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "nextPaymentAttemptAt" TIMESTAMP(3),
    ADD COLUMN "lastPaymentAttemptAt" TIMESTAMP(3),
    ADD COLUMN "lastPaymentAttemptStatus" "PaymentAttemptStatus",
    ADD COLUMN "failureCode" TEXT,
    ADD COLUMN "failureDeclineCode" TEXT,
    ADD COLUMN "failureMessage" TEXT,
    ADD COLUMN "paymentMethodBrand" TEXT,
    ADD COLUMN "paymentMethodLast4" TEXT,
    ADD COLUMN "paymentMethodExpMonth" INTEGER,
    ADD COLUMN "paymentMethodExpYear" INTEGER;

-- CreateTable
CREATE TABLE "SubscriptionPaymentAttempt" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "subscriptionInvoiceId" TEXT,
    "clientId" TEXT NOT NULL,
    "provider" "BillingProvider" NOT NULL DEFAULT 'stripe',
    "providerEventId" TEXT,
    "providerInvoiceId" TEXT NOT NULL,
    "providerPaymentIntentId" TEXT,
    "providerChargeId" TEXT,
    "serviceType" "ServiceType" NOT NULL,
    "status" "PaymentAttemptStatus" NOT NULL,
    "attemptDate" TIMESTAMP(3) NOT NULL,
    "invoiceNumber" TEXT,
    "amountCents" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "failureCode" TEXT,
    "failureDeclineCode" TEXT,
    "failureMessage" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextPaymentAttemptAt" TIMESTAMP(3),
    "paymentMethodBrand" TEXT,
    "paymentMethodLast4" TEXT,
    "paymentMethodExpMonth" INTEGER,
    "paymentMethodExpYear" INTEGER,
    "hostedInvoiceUrl" TEXT,
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SubscriptionPaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPaymentAttempt_providerEventId_key" ON "SubscriptionPaymentAttempt"("providerEventId");
CREATE UNIQUE INDEX "SubscriptionPaymentAttempt_provider_providerInvoiceId_attemptCount_status_key" ON "SubscriptionPaymentAttempt"("provider", "providerInvoiceId", "attemptCount", "status");
CREATE INDEX "SubscriptionInvoice_lastPaymentAttemptStatus_idx" ON "SubscriptionInvoice"("lastPaymentAttemptStatus");
CREATE INDEX "SubscriptionPaymentAttempt_clientId_idx" ON "SubscriptionPaymentAttempt"("clientId");
CREATE INDEX "SubscriptionPaymentAttempt_subscriptionId_idx" ON "SubscriptionPaymentAttempt"("subscriptionId");
CREATE INDEX "SubscriptionPaymentAttempt_subscriptionInvoiceId_idx" ON "SubscriptionPaymentAttempt"("subscriptionInvoiceId");
CREATE INDEX "SubscriptionPaymentAttempt_status_idx" ON "SubscriptionPaymentAttempt"("status");
CREATE INDEX "SubscriptionPaymentAttempt_attemptDate_idx" ON "SubscriptionPaymentAttempt"("attemptDate");
CREATE INDEX "SubscriptionPaymentAttempt_serviceType_idx" ON "SubscriptionPaymentAttempt"("serviceType");
CREATE INDEX "SubscriptionPaymentAttempt_nextPaymentAttemptAt_idx" ON "SubscriptionPaymentAttempt"("nextPaymentAttemptAt");

-- AddForeignKey
ALTER TABLE "SubscriptionPaymentAttempt" ADD CONSTRAINT "SubscriptionPaymentAttempt_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubscriptionPaymentAttempt" ADD CONSTRAINT "SubscriptionPaymentAttempt_subscriptionInvoiceId_fkey" FOREIGN KEY ("subscriptionInvoiceId") REFERENCES "SubscriptionInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SubscriptionPaymentAttempt" ADD CONSTRAINT "SubscriptionPaymentAttempt_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
