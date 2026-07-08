import type { SnapshotItManagementModel } from "./types";
import type { TechnologySnapshotLeadStatus } from "@/generated/prisma/client";
import { getClassificationLabel } from "./scoring";
import type { SnapshotClassification } from "./types";

export const IT_MANAGEMENT_LABELS: Record<SnapshotItManagementModel, string> = {
  in_house: "In-house IT team",
  outsourced: "Outsourced IT provider",
  part_time_internal: "Internal employee handles IT part-time",
  none: "No formal IT management",
  unsure: "Unsure",
};

export const SNAPSHOT_LEAD_STATUS_LABELS: Record<TechnologySnapshotLeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  assessment_interested: "Assessment Interested",
  assessment_purchased: "Assessment Purchased",
  not_interested: "Not Interested",
  converted: "Converted",
};

export const ALL_SNAPSHOT_LEAD_STATUSES: TechnologySnapshotLeadStatus[] = [
  "new",
  "contacted",
  "assessment_interested",
  "assessment_purchased",
  "not_interested",
  "converted",
];

export function formatSnapshotClassification(classification: string): string {
  return getClassificationLabel(classification as SnapshotClassification);
}

export const FULL_ASSESSMENT_BENEFITS = [
  "Complete Technology Maturity Score",
  "Eight Technology Pillar analysis",
  "Executive Summary",
  "Full recommendations",
  "Technology Improvement Plan",
  "Technology Investment Roadmap",
  "Project bundles",
  "Technology Strategy Session",
  "Executive-ready report",
] as const;
