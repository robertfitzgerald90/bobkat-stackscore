-- CreateEnum
CREATE TYPE "ComplianceFramework" AS ENUM ('none', 'cmmc', 'nist_800_171', 'iso_27001', 'hipaa', 'pci_dss', 'sox', 'other');

-- CreateEnum
CREATE TYPE "PrimaryBusinessGoal" AS ENUM ('improve_cybersecurity', 'reduce_downtime', 'support_growth', 'increase_productivity', 'improve_compliance', 'standardize_technology', 'reduce_it_costs', 'modernize_infrastructure', 'other');

-- CreateEnum
CREATE TYPE "ItSupportModel" AS ENUM ('internal', 'msp', 'hybrid', 'none');

-- CreateEnum
CREATE TYPE "EnvironmentType" AS ENUM ('cloud', 'hybrid', 'on_premises');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN "primaryContactTitle" TEXT,
ADD COLUMN "numberOfLocations" INTEGER,
ADD COLUMN "primaryBusinessGoal" "PrimaryBusinessGoal",
ADD COLUMN "highestTechnologyPriority" TEXT,
ADD COLUMN "technologyVision" TEXT,
ADD COLUMN "complianceFramework" "ComplianceFramework" DEFAULT 'none',
ADD COLUMN "complianceDetails" JSONB,
ADD COLUMN "itSupportModel" "ItSupportModel",
ADD COLUMN "environmentType" "EnvironmentType";
