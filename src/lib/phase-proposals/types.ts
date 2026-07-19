import type { PhaseProposalStatus } from "@/generated/prisma/client";

export const PHASE_PROPOSAL_STATUS_LABELS: Record<PhaseProposalStatus, string> = {
  draft: "Draft",
  internal_review: "Internal Review",
  sent: "Sent",
  viewed: "Viewed",
  approved: "Approved",
  rejected: "Rejected",
  expired: "Expired",
  superseded: "Superseded",
};

export function isValidPhaseProposalStatus(value: string): value is PhaseProposalStatus {
  return value in PHASE_PROPOSAL_STATUS_LABELS;
}

export const ROADMAP_JOURNEY_MILESTONE_LABELS = {
  proposal_generated: "Proposal Generated",
  proposal_sent: "Proposal Sent",
  proposal_approved: "Proposal Approved",
  implementation_started: "Implementation Started",
  implementation_completed: "Implementation Completed",
} as const;

export type PhaseProposalInitiativeSnapshot = {
  recommendationId: string;
  title: string;
  description: string;
  businessImpact: string;
  categoryName: string;
  priority: string;
  estimatedImpactPoints: number;
  deliverable: string;
};

export type PhaseProposalSnapshot = {
  phaseId: string;
  phaseKey: string;
  phaseName: string;
  phaseSubtitle: string;
  timeline: string;
  executiveSummary: string;
  businessOutcomes: Array<{ title: string; description: string }>;
  initiatives: PhaseProposalInitiativeSnapshot[];
  scopeOfWork: {
    includedInitiatives: string[];
    implementationActivities: string[];
    deliverables: string[];
    expectedTimeline: string;
    dependencies: string[];
    outOfScope: string[];
  };
  assumptions: string[];
  oneTimeInvestment: number;
  monthlyRecurringInvestment: number;
  annualRecurringInvestment: number;
  expectedScoreImprovement: number;
  clientName: string;
  assessmentName: string | null;
  assessmentDate: string | null;
  preparedByName: string;
};

export type PhaseProposalSummary = {
  id: string;
  proposalNumber: string;
  version: number;
  status: PhaseProposalStatus;
  statusLabel: string;
  title: string;
  phaseId: string;
  phaseName: string;
  phaseSubtitle: string;
  timeline: string;
  oneTimeInvestment: number;
  monthlyRecurringInvestment: number;
  annualRecurringInvestment: number;
  expectedScoreImprovement: number;
  createdAt: string;
  sentAt: string | null;
  viewedAt: string | null;
  approvedAt: string | null;
  documentUrl: string | null;
};

export type PhaseProposalDetail = PhaseProposalSummary & {
  clientId: string;
  assessmentId: string;
  roadmapId: string;
  executiveSummary: string;
  snapshot: PhaseProposalSnapshot;
  approvedByName: string | null;
  clientComments: string | null;
  preparedByName: string;
  isConsultant: boolean;
  canClientApprove: boolean;
};
