-- CreateEnum
CREATE TYPE "TechnologyStandardStatus" AS ENUM ('preferred', 'approved', 'conditional', 'existing_environment', 'legacy', 'prohibited');

-- CreateEnum
CREATE TYPE "TechnologyLifecycleStatus" AS ENUM ('current', 'review_required', 'end_of_sale', 'end_of_support', 'replacement_planned', 'retired');

-- CreateEnum
CREATE TYPE "TechnologyPillarRelationshipType" AS ENUM ('primary', 'supporting', 'informational');

-- CreateEnum
CREATE TYPE "ClientTechnologyDeploymentStatus" AS ENUM ('planned', 'implementing', 'active', 'replacing', 'retired');

-- CreateEnum
CREATE TYPE "ClientTechnologyAlignmentStatus" AS ENUM ('preferred', 'approved', 'exception', 'legacy', 'not_standard', 'unassessed');

-- CreateEnum
CREATE TYPE "ClientTechnologyHealthStatus" AS ENUM ('healthy', 'attention_needed', 'at_risk', 'unknown');

-- CreateEnum
CREATE TYPE "ManagedByType" AS ENUM ('bobkat_it', 'client', 'third_party', 'shared', 'unknown');

-- CreateTable
CREATE TABLE "TechnologyCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnologyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Technology" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "productFamily" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "whySelected" TEXT,
    "businessValue" TEXT,
    "technicalOverview" TEXT,
    "standardDeployment" TEXT,
    "supportScope" TEXT,
    "limitations" TEXT,
    "licensingNotes" TEXT,
    "securityNotes" TEXT,
    "operationalNotes" TEXT,
    "stackLayer" TEXT,
    "standardStatus" "TechnologyStandardStatus" NOT NULL DEFAULT 'approved',
    "lifecycleStatus" "TechnologyLifecycleStatus" NOT NULL DEFAULT 'current',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT,
    "websiteUrl" TEXT,
    "documentationUrl" TEXT,
    "relatedPlaybookCount" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Technology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnologyCapability" (
    "id" TEXT NOT NULL,
    "technologyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "capabilityType" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnologyCapability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnologyProduct" (
    "id" TEXT NOT NULL,
    "technologyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modelNumber" TEXT,
    "productType" TEXT NOT NULL,
    "summary" TEXT,
    "recommendedUseCase" TEXT,
    "environmentSize" TEXT,
    "lifecycleStatus" "TechnologyLifecycleStatus" NOT NULL DEFAULT 'current',
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "specificationsJson" JSONB,
    "notes" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnologyProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnologyBusinessOutcome" (
    "id" TEXT NOT NULL,
    "technologyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnologyBusinessOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnologyPillarMapping" (
    "id" TEXT NOT NULL,
    "technologyId" TEXT NOT NULL,
    "pillarCode" TEXT NOT NULL,
    "relationshipType" "TechnologyPillarRelationshipType" NOT NULL,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnologyPillarMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientTechnology" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "technologyId" TEXT NOT NULL,
    "technologyProductId" TEXT,
    "displayName" TEXT,
    "businessPurpose" TEXT,
    "deploymentStatus" "ClientTechnologyDeploymentStatus" NOT NULL DEFAULT 'active',
    "alignmentStatus" "ClientTechnologyAlignmentStatus" NOT NULL DEFAULT 'unassessed',
    "healthStatus" "ClientTechnologyHealthStatus" NOT NULL DEFAULT 'unknown',
    "lifecycleStatus" "TechnologyLifecycleStatus" NOT NULL DEFAULT 'current',
    "quantity" INTEGER,
    "quantityUnit" TEXT,
    "coverageNotes" TEXT,
    "managedBy" "ManagedByType" NOT NULL DEFAULT 'unknown',
    "vendorAccountReference" TEXT,
    "implementationDate" TIMESTAMP(3),
    "renewalDate" TIMESTAMP(3),
    "reviewDate" TIMESTAMP(3),
    "ownerName" TEXT,
    "technicalOwnerName" TEXT,
    "exceptionReason" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientTechnology_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TechnologyCategory_slug_key" ON "TechnologyCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Technology_slug_key" ON "Technology"("slug");

-- CreateIndex
CREATE INDEX "TechnologyCapability_technologyId_idx" ON "TechnologyCapability"("technologyId");

-- CreateIndex
CREATE INDEX "TechnologyProduct_technologyId_idx" ON "TechnologyProduct"("technologyId");

-- CreateIndex
CREATE INDEX "TechnologyBusinessOutcome_technologyId_idx" ON "TechnologyBusinessOutcome"("technologyId");

-- CreateIndex
CREATE INDEX "TechnologyPillarMapping_technologyId_idx" ON "TechnologyPillarMapping"("technologyId");

-- CreateIndex
CREATE INDEX "TechnologyPillarMapping_pillarCode_idx" ON "TechnologyPillarMapping"("pillarCode");

-- CreateIndex
CREATE UNIQUE INDEX "TechnologyPillarMapping_technologyId_pillarCode_relationshipType_key" ON "TechnologyPillarMapping"("technologyId", "pillarCode", "relationshipType");

-- CreateIndex
CREATE INDEX "ClientTechnology_clientId_idx" ON "ClientTechnology"("clientId");

-- CreateIndex
CREATE INDEX "ClientTechnology_technologyId_idx" ON "ClientTechnology"("technologyId");

-- AddForeignKey
ALTER TABLE "Technology" ADD CONSTRAINT "Technology_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TechnologyCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnologyCapability" ADD CONSTRAINT "TechnologyCapability_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnologyProduct" ADD CONSTRAINT "TechnologyProduct_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnologyBusinessOutcome" ADD CONSTRAINT "TechnologyBusinessOutcome_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnologyPillarMapping" ADD CONSTRAINT "TechnologyPillarMapping_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTechnology" ADD CONSTRAINT "ClientTechnology_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTechnology" ADD CONSTRAINT "ClientTechnology_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTechnology" ADD CONSTRAINT "ClientTechnology_technologyProductId_fkey" FOREIGN KEY ("technologyProductId") REFERENCES "TechnologyProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
