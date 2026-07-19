import type { RecommendationStatus, RoadmapPhaseStatus } from "@/generated/prisma/client";

export const ROADMAP_PHASE_STATUS_LABELS: Record<RoadmapPhaseStatus, string> = {
  planned: "Planned",
  awaiting_approval: "Awaiting Approval",
  approved: "Approved",
  in_progress: "In Progress",
  completed: "Completed",
  deferred: "Deferred",
  cancelled: "Cancelled",
};

export const RECOMMENDATION_LIFECYCLE_LABELS: Record<RecommendationStatus, string> = {
  open: "Planned",
  accepted: "Approved",
  in_progress: "In Progress",
  completed: "Completed",
  deferred: "Deferred",
  archived: "Not Applicable",
  declined: "Rejected",
};

export const ROADMAP_PHASE_STATUS_VALUES = Object.keys(
  ROADMAP_PHASE_STATUS_LABELS,
) as RoadmapPhaseStatus[];

export const RECOMMENDATION_STATUS_VALUES = Object.keys(
  RECOMMENDATION_LIFECYCLE_LABELS,
) as RecommendationStatus[];
