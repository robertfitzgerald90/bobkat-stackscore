-- CreateEnum
CREATE TYPE "VcioCustomerType" AS ENUM ('brand_new', 'assessment_customer', 'managed_services_client');

-- AlterTable
ALTER TABLE "VcioOnboarding"
    ADD COLUMN "customerType" "VcioCustomerType" NOT NULL DEFAULT 'brand_new',
    ADD COLUMN "currentStep" TEXT NOT NULL DEFAULT 'welcome',
    ADD COLUMN "completionPercentage" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "resetAt" TIMESTAMP(3),
    ADD COLUMN "resetByUserId" TEXT;

-- CreateIndex
CREATE INDEX "VcioOnboarding_customerType_idx" ON "VcioOnboarding"("customerType");
CREATE INDEX "VcioOnboarding_resetByUserId_idx" ON "VcioOnboarding"("resetByUserId");

-- AddForeignKey
ALTER TABLE "VcioOnboarding" ADD CONSTRAINT "VcioOnboarding_resetByUserId_fkey" FOREIGN KEY ("resetByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
