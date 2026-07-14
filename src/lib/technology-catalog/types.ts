import type {
  ClientTechnologyAlignmentStatus,
  ClientTechnologyDeploymentStatus,
  ClientTechnologyHealthStatus,
  ManagedByType,
  TechnologyLifecycleStatus,
  TechnologyStandardStatus,
} from "@/generated/prisma/client";

export type {
  ClientTechnologyAlignmentStatus,
  ClientTechnologyDeploymentStatus,
  ClientTechnologyHealthStatus,
  ManagedByType,
  TechnologyLifecycleStatus,
  TechnologyStandardStatus,
};

export type TechnologyCategorySummary = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  displayOrder: number;
};

export type TechnologyCapabilitySummary = {
  id: string;
  name: string;
  description: string | null;
  capabilityType: string | null;
  displayOrder: number;
};

export type TechnologyProductSummary = {
  id: string;
  name: string;
  modelNumber: string | null;
  productType: string;
  summary: string | null;
  recommendedUseCase: string | null;
  environmentSize: string | null;
  lifecycleStatus: TechnologyLifecycleStatus;
  isPreferred: boolean;
  displayOrder: number;
};

export type TechnologyBusinessOutcomeSummary = {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
};

export type TechnologyPillarMappingSummary = {
  id: string;
  pillarCode: string;
  pillarName: string;
  relationshipType: string;
  explanation: string | null;
};

export type CatalogTechnologySummary = {
  id: string;
  slug: string;
  name: string;
  vendor: string;
  productFamily: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  summary: string;
  purpose: string;
  standardStatus: TechnologyStandardStatus;
  lifecycleStatus: TechnologyLifecycleStatus;
  stackLayer: string | null;
  isFeatured: boolean;
  lastReviewedAt: string | null;
  topCapabilities: string[];
  mappedPillarCount: number;
  playbookCount: number;
  productCount: number;
};

export type CatalogTechnologyDetail = CatalogTechnologySummary & {
  whySelected: string | null;
  businessValue: string | null;
  technicalOverview: string | null;
  standardDeployment: string | null;
  supportScope: string | null;
  limitations: string | null;
  licensingNotes: string | null;
  securityNotes: string | null;
  operationalNotes: string | null;
  websiteUrl: string | null;
  documentationUrl: string | null;
  nextReviewAt: string | null;
  capabilities: TechnologyCapabilitySummary[];
  products: TechnologyProductSummary[];
  businessOutcomes: TechnologyBusinessOutcomeSummary[];
  pillarMappings: TechnologyPillarMappingSummary[];
};

export type ClientTechnologyRecord = {
  id: string;
  clientId: string;
  technologyId: string;
  technologyProductId: string | null;
  displayName: string | null;
  businessPurpose: string | null;
  deploymentStatus: ClientTechnologyDeploymentStatus;
  alignmentStatus: ClientTechnologyAlignmentStatus;
  healthStatus: ClientTechnologyHealthStatus;
  lifecycleStatus: TechnologyLifecycleStatus;
  quantity: number | null;
  quantityUnit: string | null;
  coverageNotes: string | null;
  managedBy: ManagedByType;
  vendorAccountReference: string | null;
  implementationDate: string | null;
  renewalDate: string | null;
  licenseCount: number | null;
  licenseRenewalDate: string | null;
  purchaseDate: string | null;
  warrantyExpiresAt: string | null;
  plannedReplacementDate: string | null;
  budgetAmountCents: number | null;
  budgetPeriod: string | null;
  budgetNotes: string | null;
  reviewDate: string | null;
  ownerName: string | null;
  technicalOwnerName: string | null;
  exceptionReason: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  technology: {
    id: string;
    slug: string;
    name: string;
    vendor: string;
    standardStatus: TechnologyStandardStatus;
    categoryName: string;
  };
  technologyProduct: {
    id: string;
    name: string;
    modelNumber: string | null;
  } | null;
};

export type CatalogMetrics = {
  preferredCount: number;
  productCount: number;
  pillarMappings: number;
  playbookCount: number;
  technologyCount: number;
};
