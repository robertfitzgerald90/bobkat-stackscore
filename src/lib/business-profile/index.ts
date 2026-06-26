import { Prisma, type UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { sanitizeComplianceDetails, parseComplianceDetails } from "@/lib/business-profile/compliance";
import { canEditBusinessProfile } from "@/lib/business-profile/validate";
import type { BusinessProfileUpdateInput, BusinessProfileView } from "@/lib/business-profile/types";

type ClientBusinessFields = {
  id: string;
  companyName: string;
  industry: string | null;
  employeeCount: number | null;
  numberOfLocations: number | null;
  deviceCount: number | null;
  primaryBusinessGoal: BusinessProfileView["primaryBusinessGoal"];
  highestTechnologyPriority: string | null;
  technologyVision: string | null;
  complianceFramework: BusinessProfileView["complianceFramework"];
  complianceDetails: Prisma.JsonValue | null;
  itSupportModel: BusinessProfileView["itSupportModel"];
  environmentType: BusinessProfileView["environmentType"];
  primaryContactName: string;
  primaryContactTitle: string | null;
  primaryContactEmail: string;
  primaryContactPhone: string | null;
};

export function mapClientToBusinessProfile(
  client: ClientBusinessFields,
  role: UserRole,
): BusinessProfileView {
  return {
    clientId: client.id,
    companyName: client.companyName,
    industry: client.industry,
    employeeCount: client.employeeCount,
    numberOfLocations: client.numberOfLocations,
    primaryBusinessGoal: client.primaryBusinessGoal,
    highestTechnologyPriority: client.highestTechnologyPriority,
    technologyVision: client.technologyVision,
    complianceFramework: client.complianceFramework,
    complianceDetails: parseComplianceDetails(client.complianceDetails),
    itSupportModel: client.itSupportModel,
    environmentType: client.environmentType,
    approximateEndpointCount: client.deviceCount,
    primaryContactName: client.primaryContactName,
    primaryContactTitle: client.primaryContactTitle,
    primaryContactEmail: client.primaryContactEmail,
    primaryContactPhone: client.primaryContactPhone,
    canEdit: canEditBusinessProfile(role),
  };
}

const businessProfileSelect = {
  id: true,
  companyName: true,
  industry: true,
  employeeCount: true,
  numberOfLocations: true,
  deviceCount: true,
  primaryBusinessGoal: true,
  highestTechnologyPriority: true,
  technologyVision: true,
  complianceFramework: true,
  complianceDetails: true,
  itSupportModel: true,
  environmentType: true,
  primaryContactName: true,
  primaryContactTitle: true,
  primaryContactEmail: true,
  primaryContactPhone: true,
} satisfies Prisma.ClientSelect;

export async function getBusinessProfile(clientId: string, role: UserRole) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: businessProfileSelect,
  });

  if (!client) return null;
  return mapClientToBusinessProfile(client, role);
}

export function buildBusinessProfileUpdateData(
  input: BusinessProfileUpdateInput,
): Prisma.ClientUpdateInput {
  const data: Prisma.ClientUpdateInput = {};

  if (input.companyName !== undefined) data.companyName = input.companyName;
  if (input.industry !== undefined) data.industry = input.industry;
  if (input.employeeCount !== undefined) data.employeeCount = input.employeeCount;
  if (input.numberOfLocations !== undefined) data.numberOfLocations = input.numberOfLocations;
  if (input.approximateEndpointCount !== undefined) {
    data.deviceCount = input.approximateEndpointCount;
  }
  if (input.primaryBusinessGoal !== undefined) {
    data.primaryBusinessGoal = input.primaryBusinessGoal;
  }
  if (input.highestTechnologyPriority !== undefined) {
    data.highestTechnologyPriority = input.highestTechnologyPriority;
  }
  if (input.technologyVision !== undefined) data.technologyVision = input.technologyVision;
  if (input.complianceFramework !== undefined) {
    data.complianceFramework = input.complianceFramework;
  }
  if (input.complianceDetails !== undefined) {
    data.complianceDetails =
      input.complianceDetails === null
        ? Prisma.JsonNull
        : (input.complianceDetails as Prisma.InputJsonValue);
  }
  if (input.itSupportModel !== undefined) data.itSupportModel = input.itSupportModel;
  if (input.environmentType !== undefined) data.environmentType = input.environmentType;
  if (input.primaryContactName !== undefined) {
    data.primaryContactName = input.primaryContactName;
  }
  if (input.primaryContactTitle !== undefined) {
    data.primaryContactTitle = input.primaryContactTitle;
  }
  if (input.primaryContactEmail !== undefined) {
    data.primaryContactEmail = input.primaryContactEmail;
  }
  if (input.primaryContactPhone !== undefined) {
    data.primaryContactPhone = input.primaryContactPhone;
  }

  return data;
}

export async function updateBusinessProfile(
  clientId: string,
  role: UserRole,
  input: BusinessProfileUpdateInput,
) {
  if (!canEditBusinessProfile(role)) {
    throw new Error("Insufficient permissions");
  }

  const existing = await prisma.client.findUnique({
    where: { id: clientId },
    select: businessProfileSelect,
  });
  if (!existing) return null;

  const resolvedInput = { ...input };

  if (
    resolvedInput.complianceFramework !== undefined ||
    resolvedInput.complianceDetails !== undefined
  ) {
    const framework =
      resolvedInput.complianceFramework ?? existing.complianceFramework ?? "none";
    resolvedInput.complianceFramework = framework;
    resolvedInput.complianceDetails =
      framework === "none"
        ? null
        : sanitizeComplianceDetails(
            framework,
            resolvedInput.complianceDetails ?? parseComplianceDetails(existing.complianceDetails),
          );
  }

  const client = await prisma.client.update({
    where: { id: clientId },
    data: buildBusinessProfileUpdateData(resolvedInput),
    select: businessProfileSelect,
  });

  return mapClientToBusinessProfile(client, role);
}

export {
  formatComplianceFramework,
  formatEnvironmentType,
  formatItSupportModel,
  formatPrimaryBusinessGoal,
  COMPLIANCE_FRAMEWORK_LABELS,
  ENVIRONMENT_TYPE_LABELS,
  IT_SUPPORT_MODEL_LABELS,
  PRIMARY_BUSINESS_GOAL_LABELS,
} from "@/lib/business-profile/labels";

export {
  getComplianceFieldGroup,
  parseComplianceDetails,
  sanitizeComplianceDetails,
  shouldShowComplianceDetails,
} from "@/lib/business-profile/compliance";

export { canEditBusinessProfile, parseBusinessProfileUpdate } from "@/lib/business-profile/validate";

export type {
  BusinessProfileUpdateInput,
  BusinessProfileView,
  ComplianceDetails,
  ComplianceFieldGroup,
} from "@/lib/business-profile/types";
