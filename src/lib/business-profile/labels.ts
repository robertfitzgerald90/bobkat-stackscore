import type {
  ComplianceFramework,
  EnvironmentType,
  ItSupportModel,
  PrimaryBusinessGoal,
} from "@/generated/prisma/client";

export const PRIMARY_BUSINESS_GOAL_LABELS: Record<PrimaryBusinessGoal, string> = {
  improve_cybersecurity: "Improve Cybersecurity",
  reduce_downtime: "Reduce Downtime",
  support_growth: "Support Growth",
  increase_productivity: "Increase Productivity",
  improve_compliance: "Improve Compliance",
  standardize_technology: "Standardize Technology",
  reduce_it_costs: "Reduce IT Costs",
  modernize_infrastructure: "Modernize Infrastructure",
  other: "Other",
};

export const COMPLIANCE_FRAMEWORK_LABELS: Record<ComplianceFramework, string> = {
  none: "None",
  cmmc: "CMMC",
  nist_800_171: "NIST 800-171",
  iso_27001: "ISO 27001",
  hipaa: "HIPAA",
  pci_dss: "PCI DSS",
  sox: "SOX",
  other: "Other",
};

export const IT_SUPPORT_MODEL_LABELS: Record<ItSupportModel, string> = {
  internal: "Internal",
  msp: "MSP",
  hybrid: "Hybrid",
  none: "None",
};

export const ENVIRONMENT_TYPE_LABELS: Record<EnvironmentType, string> = {
  cloud: "Cloud",
  hybrid: "Hybrid",
  on_premises: "On-Premises",
};

export function formatPrimaryBusinessGoal(goal: PrimaryBusinessGoal | null | undefined) {
  if (!goal) return "—";
  return PRIMARY_BUSINESS_GOAL_LABELS[goal] ?? goal;
}

export function formatComplianceFramework(
  framework: ComplianceFramework | null | undefined,
) {
  if (!framework || framework === "none") return "None";
  return COMPLIANCE_FRAMEWORK_LABELS[framework] ?? framework;
}

export function formatItSupportModel(model: ItSupportModel | null | undefined) {
  if (!model) return "—";
  return IT_SUPPORT_MODEL_LABELS[model] ?? model;
}

export function formatEnvironmentType(type: EnvironmentType | null | undefined) {
  if (!type) return "—";
  return ENVIRONMENT_TYPE_LABELS[type] ?? type;
}
