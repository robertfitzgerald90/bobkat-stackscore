import type { TechnologySnapshotLeadStatus } from "@/generated/prisma/client";
import { SNAPSHOT_V2_MAX_SCORE } from "./catalog-v2";
import { SNAPSHOT_POSTURE_LABELS, type SnapshotPostureBand } from "./engine";
import { getClassificationLabel } from "./scoring";
import type { SnapshotClassification, SnapshotItManagementModel } from "./types";

/** Customer-facing labels — never show raw enum keys (`in_house`, etc.). */
export const IT_MANAGEMENT_LABELS: Record<SnapshotItManagementModel, string> = {
  in_house: "In-House IT Team",
  outsourced: "Outsourced IT Provider",
  part_time_internal: "Internal Employee Handling IT",
  none: "No Formal IT Management",
  unsure: "Unsure",
};

export function formatItManagementLabel(
  value: SnapshotItManagementModel | string | null | undefined,
): string {
  if (!value) return "—";
  if (value in IT_MANAGEMENT_LABELS) {
    return IT_MANAGEMENT_LABELS[value as SnapshotItManagementModel];
  }
  return String(value);
}

export const SNAPSHOT_LEAD_STATUS_LABELS: Record<TechnologySnapshotLeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  follow_up: "Follow-Up Needed",
  assessment_interested: "Assessment Interested",
  assessment_invited: "Assessment Invited",
  assessment_purchased: "Assessment Purchased",
  not_interested: "Not Interested",
  converted: "Converted",
  archived: "Archived",
};

export const ALL_SNAPSHOT_LEAD_STATUSES: TechnologySnapshotLeadStatus[] = [
  "new",
  "contacted",
  "follow_up",
  "assessment_interested",
  "assessment_invited",
  "assessment_purchased",
  "not_interested",
  "converted",
  "archived",
];

/** Legacy snap-1.0 max (8 questions × 3). */
export const SNAPSHOT_MAX_SCORE = 24;
export { SNAPSHOT_V2_MAX_SCORE };

export function formatSnapshotClassification(classification: string): string {
  if (classification in SNAPSHOT_POSTURE_LABELS) {
    return SNAPSHOT_POSTURE_LABELS[classification as SnapshotPostureBand];
  }
  return getClassificationLabel(classification as SnapshotClassification);
}

export const FULL_ASSESSMENT_BENEFITS = [
  "Official StackScore from a completed assessment",
  "Eight Technology Pillar analysis",
  "Executive Summary",
  "Full recommendations",
  "Technology Improvement Plan",
  "Technology Investment Roadmap",
  "Project bundles",
  "Technology Strategy Session",
  "Executive-ready report",
] as const;

/** Contact consent for optional Save / Request a Copy (not marketing). */
export const SNAPSHOT_CONTACT_CONSENT_TEXT =
  "Bobkat IT may contact me about my Technology Snapshot results and related technology services.";

/** Optional marketing consent — must be affirmatively checked; never implied. */
export const SNAPSHOT_MARKETING_CONSENT_TEXT =
  "I also want occasional tips and updates from Bobkat IT (optional).";

/** @deprecated Prefer SNAPSHOT_CONTACT_CONSENT_TEXT */
export const SNAPSHOT_CONSENT_TEXT = SNAPSHOT_CONTACT_CONSENT_TEXT;

export const SNAPSHOT_OFFICIAL_DISCLAIMER =
  "Indicative Technology Snapshot posture — not an Official StackScore. Official StackScore requires a completed Technology Maturity Assessment.";
