import type {
  ComplianceFramework,
  EnvironmentType,
  ItSupportModel,
  PrimaryBusinessGoal,
  UserRole,
} from "@/generated/prisma/client";
import type { BusinessProfileUpdateInput } from "@/lib/business-profile/types";

const PRIMARY_BUSINESS_GOALS = new Set<PrimaryBusinessGoal>([
  "improve_cybersecurity",
  "reduce_downtime",
  "support_growth",
  "increase_productivity",
  "improve_compliance",
  "standardize_technology",
  "reduce_it_costs",
  "modernize_infrastructure",
  "other",
]);

const COMPLIANCE_FRAMEWORKS = new Set<ComplianceFramework>([
  "none",
  "cmmc",
  "nist_800_171",
  "iso_27001",
  "hipaa",
  "pci_dss",
  "sox",
  "other",
]);

const IT_SUPPORT_MODELS = new Set<ItSupportModel>(["internal", "msp", "hybrid", "none"]);

const ENVIRONMENT_TYPES = new Set<EnvironmentType>(["cloud", "hybrid", "on_premises"]);

export function canEditBusinessProfile(role: UserRole) {
  return role === "admin" || role === "technician";
}

function parseOptionalInt(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Count fields must be non-negative numbers");
  }
  return Math.trunc(parsed);
}

function parseOptionalString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") throw new Error("Expected a string value");
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseEnumValue<T extends string>(
  value: unknown,
  allowed: Set<T>,
  label: string,
): T | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string" || !allowed.has(value as T)) {
    throw new Error(`Invalid ${label}`);
  }
  return value as T;
}

export function parseBusinessProfileUpdate(
  body: Record<string, unknown>,
): BusinessProfileUpdateInput {
  const update: BusinessProfileUpdateInput = {};

  if ("companyName" in body) {
    const companyName = parseOptionalString(body.companyName);
    if (!companyName) throw new Error("Company name is required");
    update.companyName = companyName;
  }

  if ("industry" in body) update.industry = parseOptionalString(body.industry);
  if ("employeeCount" in body) update.employeeCount = parseOptionalInt(body.employeeCount);
  if ("numberOfLocations" in body) {
    update.numberOfLocations = parseOptionalInt(body.numberOfLocations);
  }
  if ("approximateEndpointCount" in body) {
    update.approximateEndpointCount = parseOptionalInt(body.approximateEndpointCount);
  }
  if ("primaryBusinessGoal" in body) {
    update.primaryBusinessGoal = parseEnumValue(
      body.primaryBusinessGoal,
      PRIMARY_BUSINESS_GOALS,
      "primary business goal",
    );
  }
  if ("highestTechnologyPriority" in body) {
    update.highestTechnologyPriority = parseOptionalString(body.highestTechnologyPriority);
  }
  if ("technologyVision" in body) {
    update.technologyVision = parseOptionalString(body.technologyVision);
  }
  if ("complianceFramework" in body) {
    update.complianceFramework = parseEnumValue(
      body.complianceFramework,
      COMPLIANCE_FRAMEWORKS,
      "compliance framework",
    );
  }
  if ("complianceDetails" in body) {
    update.complianceDetails =
      body.complianceDetails === null
        ? null
        : typeof body.complianceDetails === "object" && !Array.isArray(body.complianceDetails)
          ? (body.complianceDetails as BusinessProfileUpdateInput["complianceDetails"])
          : {};
  }
  if ("itSupportModel" in body) {
    update.itSupportModel = parseEnumValue(body.itSupportModel, IT_SUPPORT_MODELS, "IT support model");
  }
  if ("environmentType" in body) {
    update.environmentType = parseEnumValue(
      body.environmentType,
      ENVIRONMENT_TYPES,
      "environment type",
    );
  }
  if ("primaryContactName" in body) {
    const name = parseOptionalString(body.primaryContactName);
    if (!name) throw new Error("Primary contact name is required");
    update.primaryContactName = name;
  }
  if ("primaryContactTitle" in body) {
    update.primaryContactTitle = parseOptionalString(body.primaryContactTitle);
  }
  if ("primaryContactEmail" in body) {
    const email = parseOptionalString(body.primaryContactEmail);
    if (!email) throw new Error("Primary contact email is required");
    update.primaryContactEmail = email;
  }
  if ("primaryContactPhone" in body) {
    update.primaryContactPhone = parseOptionalString(body.primaryContactPhone);
  }

  return update;
}
