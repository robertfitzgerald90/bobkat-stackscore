import type {
  ComplianceFramework,
  EnvironmentType,
  ItSupportModel,
  PrimaryBusinessGoal,
} from "@/generated/prisma/client";

export type ComplianceDetails = {
  currentControlsImplemented?: string | null;
  targetCompliance?: string | null;
  notes?: string | null;
  certified?: boolean | null;
  certificationDate?: string | null;
  hipaaProgramImplemented?: boolean | null;
  pciCompliant?: boolean | null;
};

export type BusinessProfileView = {
  clientId: string;
  companyName: string;
  industry: string | null;
  employeeCount: number | null;
  numberOfLocations: number | null;
  primaryBusinessGoal: PrimaryBusinessGoal | null;
  highestTechnologyPriority: string | null;
  technologyVision: string | null;
  complianceFramework: ComplianceFramework | null;
  complianceDetails: ComplianceDetails;
  itSupportModel: ItSupportModel | null;
  environmentType: EnvironmentType | null;
  approximateEndpointCount: number | null;
  primaryContactName: string;
  primaryContactTitle: string | null;
  primaryContactEmail: string;
  primaryContactPhone: string | null;
  canEdit: boolean;
};

export type BusinessProfileUpdateInput = {
  companyName?: string;
  industry?: string | null;
  employeeCount?: number | null;
  numberOfLocations?: number | null;
  primaryBusinessGoal?: PrimaryBusinessGoal | null;
  highestTechnologyPriority?: string | null;
  technologyVision?: string | null;
  complianceFramework?: ComplianceFramework | null;
  complianceDetails?: ComplianceDetails | null;
  itSupportModel?: ItSupportModel | null;
  environmentType?: EnvironmentType | null;
  approximateEndpointCount?: number | null;
  primaryContactName?: string;
  primaryContactTitle?: string | null;
  primaryContactEmail?: string;
  primaryContactPhone?: string | null;
};

export type ComplianceFieldGroup =
  | "cmmc_nist"
  | "iso_27001"
  | "hipaa"
  | "pci_dss"
  | null;
