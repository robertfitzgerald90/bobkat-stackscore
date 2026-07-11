import type {
  TechnologyLifecycleStatus,
  TechnologyStandardStatus,
} from "@/lib/technology-catalog/types";

const STANDARD_LABELS: Record<TechnologyStandardStatus, string> = {
  preferred: "Preferred",
  approved: "Approved",
  conditional: "Conditional",
  existing_environment: "Existing Environment",
  legacy: "Legacy",
  prohibited: "Prohibited",
};

const LIFECYCLE_LABELS: Record<TechnologyLifecycleStatus, string> = {
  current: "Current",
  review_required: "Review Required",
  end_of_sale: "End of Sale",
  end_of_support: "End of Support",
  replacement_planned: "Replacement Planned",
  retired: "Retired",
};

export function formatStandardStatus(status: TechnologyStandardStatus): string {
  return STANDARD_LABELS[status];
}

export function formatLifecycleStatus(status: TechnologyLifecycleStatus): string {
  return LIFECYCLE_LABELS[status];
}

export function standardStatusLabel(status: TechnologyStandardStatus): string {
  return status === "preferred" ? "Preferred Standard" : formatStandardStatus(status);
}

export function formatDeploymentStatus(status: string): string {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatAlignmentStatus(status: string): string {
  if (status === "not_standard") return "Not Standard";
  return formatDeploymentStatus(status);
}

export function formatHealthStatus(status: string): string {
  if (status === "attention_needed") return "Attention Needed";
  if (status === "at_risk") return "At Risk";
  return formatDeploymentStatus(status);
}

export function formatManagedBy(status: string): string {
  if (status === "bobkat_it") return "Bobkat IT";
  if (status === "third_party") return "Third Party";
  return formatDeploymentStatus(status);
}
