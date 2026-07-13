-- CreateEnum
CREATE TYPE "InvoiceDocumentType" AS ENUM ('standard', 'budgetary', 'labor');

-- AlterTable
ALTER TABLE "Invoice"
ADD COLUMN "documentType" "InvoiceDocumentType" NOT NULL DEFAULT 'standard',
ADD COLUMN "title" TEXT,
ADD COLUMN "clientDescription" TEXT,
ADD COLUMN "expirationDate" TIMESTAMP(3),
ADD COLUMN "shippingCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "contingencyCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "budgetaryOptionsJson" JSONB;

-- AlterTable
ALTER TABLE "InvoiceLineItem"
ADD COLUMN "itemName" TEXT,
ADD COLUMN "unit" TEXT,
ADD COLUMN "catalogSourceType" TEXT,
ADD COLUMN "catalogSourceId" TEXT;
