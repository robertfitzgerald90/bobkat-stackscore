-- CreateEnum
CREATE TYPE "CommunicationTemplateVersionStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateTable
CREATE TABLE "CommunicationBrandSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "primaryLogoUrl" TEXT,
    "secondaryLogoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#082F5B',
    "secondaryColor" TEXT NOT NULL DEFAULT '#7D97AC',
    "accentColor" TEXT NOT NULL DEFAULT '#2563EB',
    "buttonPrimaryBg" TEXT NOT NULL DEFAULT '#082F5B',
    "buttonPrimaryText" TEXT NOT NULL DEFAULT '#FFFFFF',
    "buttonSecondaryBg" TEXT NOT NULL DEFAULT '#F4F6F8',
    "buttonSecondaryText" TEXT NOT NULL DEFAULT '#082F5B',
    "fontFamilyHeading" TEXT NOT NULL DEFAULT 'Georgia, ''Times New Roman'', serif',
    "fontFamilyBody" TEXT NOT NULL DEFAULT 'Arial, Helvetica, sans-serif',
    "companyName" TEXT NOT NULL DEFAULT 'Bobkat IT',
    "productName" TEXT NOT NULL DEFAULT 'StackScore',
    "websiteUrl" TEXT,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "address" TEXT,
    "copyrightText" TEXT,
    "footerTagline" TEXT,
    "socialLinks" JSONB NOT NULL DEFAULT '[]',
    "componentSettings" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedByUserId" TEXT,

    CONSTRAINT "CommunicationBrandSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationTemplateVersion" (
    "id" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "status" "CommunicationTemplateVersionStatus" NOT NULL,
    "subject" TEXT NOT NULL,
    "previewText" TEXT NOT NULL,
    "contentJson" JSONB NOT NULL,
    "sharedComponents" JSONB NOT NULL DEFAULT '[]',
    "changeNotes" TEXT,
    "publishedAt" TIMESTAMP(3),
    "publishedByUserId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationTemplateVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationSampleProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templateKey" TEXT,
    "sampleDataJson" JSONB NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationSampleProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunicationTemplateVersion_templateKey_status_idx" ON "CommunicationTemplateVersion"("templateKey", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationTemplateVersion_templateKey_versionNumber_key" ON "CommunicationTemplateVersion"("templateKey", "versionNumber");

-- CreateIndex
CREATE INDEX "CommunicationSampleProfile_templateKey_idx" ON "CommunicationSampleProfile"("templateKey");

-- CreateIndex
CREATE INDEX "CommunicationSampleProfile_createdByUserId_idx" ON "CommunicationSampleProfile"("createdByUserId");

-- AddForeignKey
ALTER TABLE "CommunicationBrandSettings" ADD CONSTRAINT "CommunicationBrandSettings_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationTemplateVersion" ADD CONSTRAINT "CommunicationTemplateVersion_publishedByUserId_fkey" FOREIGN KEY ("publishedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationTemplateVersion" ADD CONSTRAINT "CommunicationTemplateVersion_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationSampleProfile" ADD CONSTRAINT "CommunicationSampleProfile_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
