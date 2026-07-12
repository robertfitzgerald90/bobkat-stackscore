-- Billing module: invoices, payments, deposits, recurring services

CREATE TYPE "InvoiceStatus" AS ENUM ('draft', 'ready_to_send', 'sent', 'viewed', 'partially_paid', 'paid', 'overdue', 'voided', 'refunded');
CREATE TYPE "InvoiceSourceType" AS ENUM ('manual', 'technology_improvement_plan', 'proposal', 'project', 'initiative', 'deposit_request', 'milestone', 'final_balance', 'recurring_service');
CREATE TYPE "InvoiceLineCategory" AS ENUM ('professional_services', 'technology_hardware', 'managed_services', 'licensing', 'recurring', 'deposit', 'credit', 'other');
CREATE TYPE "InvoiceLineKind" AS ENUM ('one_time', 'recurring');
CREATE TYPE "BillingPaymentMethod" AS ENUM ('card', 'ach', 'check', 'cash', 'wire', 'external_transfer', 'credit', 'other');
CREATE TYPE "BillingPaymentStatus" AS ENUM ('pending', 'succeeded', 'failed', 'partially_refunded', 'refunded', 'disputed', 'canceled');
CREATE TYPE "BillingPaymentProcessor" AS ENUM ('stripe', 'manual', 'external');
CREATE TYPE "BillingDepositType" AS ENUM ('percentage', 'fixed', 'retainer', 'milestone', 'prepayment');
CREATE TYPE "BillingDepositStatus" AS ENUM ('not_requested', 'requested', 'invoice_sent', 'partially_paid', 'paid', 'failed', 'refunded', 'applied');
CREATE TYPE "RecurringServiceStatus" AS ENUM ('draft', 'pending_activation', 'active', 'past_due', 'paused', 'cancellation_scheduled', 'canceled', 'expired');
CREATE TYPE "BillingFrequency" AS ENUM ('monthly', 'quarterly', 'semiannual', 'annual', 'custom');
CREATE TYPE "InvoiceDeliveryChannel" AS ENUM ('email', 'portal', 'manual');
CREATE TYPE "InvoiceDeliveryStatus" AS ENUM ('queued', 'sent', 'delivered', 'opened', 'failed', 'bounced');
CREATE TYPE "BillingAuditAction" AS ENUM (
  'invoice_created', 'invoice_edited', 'invoice_sent', 'invoice_viewed', 'reminder_sent',
  'payment_recorded', 'payment_succeeded', 'payment_failed', 'invoice_marked_overdue', 'invoice_voided',
  'refund_recorded', 'recurring_service_activated', 'recurring_service_paused', 'recurring_service_canceled',
  'deposit_requested', 'deposit_applied'
);

ALTER TYPE "OrganizationActivityCategory" ADD VALUE IF NOT EXISTS 'BILLING';

CREATE TABLE "ClientBillingProfile" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "billingCompanyName" TEXT,
  "billingEmail" TEXT,
  "billingPhone" TEXT,
  "addressLine1" TEXT,
  "addressLine2" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "country" TEXT DEFAULT 'US',
  "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
  "defaultBillingContactId" TEXT,
  "taxExempt" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClientBillingProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClientBillingProfile_clientId_key" ON "ClientBillingProfile"("clientId");

CREATE TABLE "Invoice" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "status" "InvoiceStatus" NOT NULL DEFAULT 'draft',
  "sourceType" "InvoiceSourceType" NOT NULL DEFAULT 'manual',
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "subtotalCents" INTEGER NOT NULL DEFAULT 0,
  "discountCents" INTEGER NOT NULL DEFAULT 0,
  "taxCents" INTEGER NOT NULL DEFAULT 0,
  "creditCents" INTEGER NOT NULL DEFAULT 0,
  "depositAppliedCents" INTEGER NOT NULL DEFAULT 0,
  "totalCents" INTEGER NOT NULL DEFAULT 0,
  "amountPaidCents" INTEGER NOT NULL DEFAULT 0,
  "balanceDueCents" INTEGER NOT NULL DEFAULT 0,
  "issueDate" TIMESTAMP(3),
  "dueDate" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
  "clientNotes" TEXT,
  "internalNotes" TEXT,
  "billToName" TEXT,
  "billToEmail" TEXT,
  "billToPhone" TEXT,
  "billToAddressJson" JSONB,
  "billingContactId" TEXT,
  "tipId" TEXT,
  "projectId" TEXT,
  "depositId" TEXT,
  "assessmentPurchaseId" TEXT,
  "stripeCheckoutSessionId" TEXT,
  "stripePaymentIntentId" TEXT,
  "stripePaymentLinkUrl" TEXT,
  "onlinePaymentEnabled" BOOLEAN NOT NULL DEFAULT true,
  "createdByUserId" TEXT NOT NULL,
  "voidedAt" TIMESTAMP(3),
  "voidedByUserId" TEXT,
  "voidReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE UNIQUE INDEX "Invoice_assessmentPurchaseId_key" ON "Invoice"("assessmentPurchaseId");
CREATE UNIQUE INDEX "Invoice_stripeCheckoutSessionId_key" ON "Invoice"("stripeCheckoutSessionId");
CREATE INDEX "Invoice_clientId_idx" ON "Invoice"("clientId");
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");
CREATE INDEX "Invoice_dueDate_idx" ON "Invoice"("dueDate");
CREATE INDEX "Invoice_tipId_idx" ON "Invoice"("tipId");

CREATE TABLE "InvoiceLineItem" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "description" TEXT NOT NULL,
  "quantity" DECIMAL(12,4) NOT NULL DEFAULT 1,
  "unitPriceCents" INTEGER NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "category" "InvoiceLineCategory" NOT NULL DEFAULT 'other',
  "lineKind" "InvoiceLineKind" NOT NULL DEFAULT 'one_time',
  "taxable" BOOLEAN NOT NULL DEFAULT false,
  "servicePeriodStart" TIMESTAMP(3),
  "servicePeriodEnd" TIMESTAMP(3),
  "internalCostCents" INTEGER,
  "clientNote" TEXT,
  "recommendationId" TEXT,
  "projectId" TEXT,
  "recurringServiceId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InvoiceLineItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InvoiceLineItem_invoiceId_idx" ON "InvoiceLineItem"("invoiceId");

CREATE TABLE "BillingPayment" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "paymentDate" TIMESTAMP(3) NOT NULL,
  "method" "BillingPaymentMethod" NOT NULL,
  "status" "BillingPaymentStatus" NOT NULL DEFAULT 'pending',
  "processor" "BillingPaymentProcessor" NOT NULL DEFAULT 'manual',
  "transactionReference" TEXT,
  "stripeSessionId" TEXT,
  "stripePaymentIntentId" TEXT,
  "stripeChargeId" TEXT,
  "processingFeeCents" INTEGER NOT NULL DEFAULT 0,
  "unappliedAmountCents" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "refundStatus" TEXT,
  "recordedByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BillingPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BillingPayment_stripeSessionId_key" ON "BillingPayment"("stripeSessionId");
CREATE INDEX "BillingPayment_clientId_idx" ON "BillingPayment"("clientId");
CREATE INDEX "BillingPayment_status_idx" ON "BillingPayment"("status");
CREATE INDEX "BillingPayment_paymentDate_idx" ON "BillingPayment"("paymentDate");

CREATE TABLE "PaymentApplication" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "appliedCents" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentApplication_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentApplication_paymentId_invoiceId_key" ON "PaymentApplication"("paymentId", "invoiceId");
CREATE INDEX "PaymentApplication_invoiceId_idx" ON "PaymentApplication"("invoiceId");

CREATE TABLE "BillingDeposit" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "depositType" "BillingDepositType" NOT NULL,
  "status" "BillingDepositStatus" NOT NULL DEFAULT 'not_requested',
  "label" TEXT NOT NULL,
  "amountCents" INTEGER,
  "percentage" DECIMAL(5,2),
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "tipId" TEXT,
  "projectId" TEXT,
  "invoiceId" TEXT,
  "appliedToInvoiceId" TEXT,
  "appliedAt" TIMESTAMP(3),
  "requestedAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BillingDeposit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BillingDeposit_clientId_idx" ON "BillingDeposit"("clientId");
CREATE INDEX "BillingDeposit_status_idx" ON "BillingDeposit"("status");
CREATE INDEX "BillingDeposit_tipId_idx" ON "BillingDeposit"("tipId");

CREATE TABLE "RecurringService" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "serviceName" TEXT NOT NULL,
  "description" TEXT,
  "quantity" DECIMAL(12,4) NOT NULL DEFAULT 1,
  "unitPriceCents" INTEGER NOT NULL,
  "billingFrequency" "BillingFrequency" NOT NULL DEFAULT 'monthly',
  "customFrequencyDays" INTEGER,
  "startDate" TIMESTAMP(3),
  "nextBillingDate" TIMESTAMP(3),
  "renewalDate" TIMESTAMP(3),
  "minimumTermMonths" INTEGER,
  "autoRenew" BOOLEAN NOT NULL DEFAULT true,
  "paymentMethodStatus" TEXT,
  "relatedTechnology" TEXT,
  "relatedAgreement" TEXT,
  "status" "RecurringServiceStatus" NOT NULL DEFAULT 'draft',
  "lastInvoiceDate" TIMESTAMP(3),
  "internalCostCents" INTEGER,
  "internalMarginPercent" DECIMAL(5,2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RecurringService_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RecurringService_clientId_idx" ON "RecurringService"("clientId");
CREATE INDEX "RecurringService_status_idx" ON "RecurringService"("status");
CREATE INDEX "RecurringService_nextBillingDate_idx" ON "RecurringService"("nextBillingDate");

CREATE TABLE "InvoiceDelivery" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "channel" "InvoiceDeliveryChannel" NOT NULL DEFAULT 'email',
  "status" "InvoiceDeliveryStatus" NOT NULL DEFAULT 'queued',
  "recipientEmail" TEXT NOT NULL,
  "ccEmailsJson" JSONB NOT NULL DEFAULT '[]',
  "subject" TEXT,
  "messageId" TEXT,
  "sentAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "openedAt" TIMESTAMP(3),
  "failureReason" TEXT,
  "metadataJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InvoiceDelivery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InvoiceDelivery_invoiceId_idx" ON "InvoiceDelivery"("invoiceId");
CREATE INDEX "InvoiceDelivery_status_idx" ON "InvoiceDelivery"("status");

CREATE TABLE "BillingAuditEvent" (
  "id" TEXT NOT NULL,
  "clientId" TEXT,
  "invoiceId" TEXT,
  "paymentId" TEXT,
  "action" "BillingAuditAction" NOT NULL,
  "actorUserId" TEXT,
  "metadataJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BillingAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BillingAuditEvent_clientId_idx" ON "BillingAuditEvent"("clientId");
CREATE INDEX "BillingAuditEvent_invoiceId_idx" ON "BillingAuditEvent"("invoiceId");
CREATE INDEX "BillingAuditEvent_action_idx" ON "BillingAuditEvent"("action");
CREATE INDEX "BillingAuditEvent_createdAt_idx" ON "BillingAuditEvent"("createdAt");

CREATE TABLE "StripeWebhookEvent" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "payloadJson" JSONB,
  CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StripeWebhookEvent_eventId_key" ON "StripeWebhookEvent"("eventId");
CREATE INDEX "StripeWebhookEvent_eventType_idx" ON "StripeWebhookEvent"("eventType");

ALTER TABLE "Project" ADD COLUMN "requiredDepositId" TEXT;
CREATE UNIQUE INDEX "Project_requiredDepositId_key" ON "Project"("requiredDepositId");

ALTER TABLE "ClientBillingProfile" ADD CONSTRAINT "ClientBillingProfile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_billingContactId_fkey" FOREIGN KEY ("billingContactId") REFERENCES "ClientContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tipId_fkey" FOREIGN KEY ("tipId") REFERENCES "TechnologyImprovementPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "BillingDeposit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_assessmentPurchaseId_fkey" FOREIGN KEY ("assessmentPurchaseId") REFERENCES "AssessmentPurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_recurringServiceId_fkey" FOREIGN KEY ("recurringServiceId") REFERENCES "RecurringService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BillingPayment" ADD CONSTRAINT "BillingPayment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BillingPayment" ADD CONSTRAINT "BillingPayment_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PaymentApplication" ADD CONSTRAINT "PaymentApplication_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "BillingPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentApplication" ADD CONSTRAINT "PaymentApplication_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BillingDeposit" ADD CONSTRAINT "BillingDeposit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BillingDeposit" ADD CONSTRAINT "BillingDeposit_tipId_fkey" FOREIGN KEY ("tipId") REFERENCES "TechnologyImprovementPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BillingDeposit" ADD CONSTRAINT "BillingDeposit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RecurringService" ADD CONSTRAINT "RecurringService_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InvoiceDelivery" ADD CONSTRAINT "InvoiceDelivery_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BillingAuditEvent" ADD CONSTRAINT "BillingAuditEvent_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BillingAuditEvent" ADD CONSTRAINT "BillingAuditEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "BillingPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BillingAuditEvent" ADD CONSTRAINT "BillingAuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Project" ADD CONSTRAINT "Project_requiredDepositId_fkey" FOREIGN KEY ("requiredDepositId") REFERENCES "BillingDeposit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
