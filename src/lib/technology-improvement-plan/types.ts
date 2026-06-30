import type {
  TipWorkflowStep,
  TechnologyImprovementPlanStatus,
  Priority,
  UserRole,
} from "@/generated/prisma/client";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";

export type { TipWorkflowStep };

export const TIP_WORKFLOW_STEPS: TipWorkflowStep[] = [
  "profile",
  "recommendations",
  "playbooks",
  "investment",
  "roadmap",
  "preview",
  "complete",
];

export const TIP_STEP_LABELS: Record<TipWorkflowStep, string> = {
  profile: "Technology Maturity Profile",
  recommendations: "Recommendations",
  playbooks: "Solution Playbooks",
  investment: "Investment Review",
  roadmap: "Technology Roadmap",
  preview: "Preview",
  complete: "Generate Plan",
};

export type TipInvestmentDraft = {
  laborCents: number;
  hardwareCents: number;
  servicesCents: number;
  marginPercent: number;
};

export type TipRoadmapPhase = {
  id: string;
  label: string;
  sortOrder: number;
  recommendationIds: string[];
};

export type TipWizardState = {
  removedRecommendationIds: string[];
  deferredRecommendationIds: string[];
  recommendationOrder: string[];
  consultantNotesByRecId: Record<string, string>;
  executiveNotesByRecId: Record<string, string>;
  globalConsultantNotes: string;
  globalExecutiveNotes: string;
  investment: TipInvestmentDraft;
  roadmapPhases: TipRoadmapPhase[];
  executiveSummary: string;
  frozenAt: string | null;
};

export type TipRecommendationView = {
  id: string;
  title: string;
  description: string;
  businessImpact: string;
  priority: Priority;
  suggestedService: string | null;
  estimatedImpactPoints: number;
  categoryName: string;
  consultantNote: string;
  executiveNote: string;
  sortOrder: number;
};

export type TipPlaybookView = {
  id: string;
  name: string;
  description: string;
  effortLevel: string;
  estimatedEffortWeeks: string;
  services: string[];
  technologies: string[];
  recommendationIds: string[];
  estimatedImpactPoints: number;
};

export type TipInvestmentView = {
  labor: number;
  hardware: number;
  services: number;
  subtotal: number;
  marginPercent: number;
  marginAmount: number;
  clientTotal: number;
};

export type TipRoadmapPhaseView = {
  id: string;
  label: string;
  sortOrder: number;
  recommendationIds: string[];
  recommendations: TipRecommendationView[];
  projectedScore: number;
  scoreDelta: number;
};

export type TipPlanSummary = {
  id: string;
  clientId: string;
  assessmentId: string | null;
  status: TechnologyImprovementPlanStatus;
  currentStep: TipWorkflowStep;
  version: number;
  title: string;
  generatedAt: string | null;
  documentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TipSelectionSummary = {
  includedCount: number;
  excludedCount: number;
  deferredCount: number;
  clientInvestmentTotal: number;
  laborTotal: number;
  hardwareTotal: number;
  servicesTotal: number;
  projectedScoreImprovement: number;
  estimatedTimeline: string;
};

export type TipPlanDetail = TipPlanSummary & {
  wizardState: TipWizardState;
  executiveSummary: string | null;
  isEditable: boolean;
  isAdmin: boolean;
  profile: TechnologyProfileDetail | null;
  recommendations: TipRecommendationView[];
  excludedRecommendations: TipRecommendationView[];
  deferredRecommendations: TipRecommendationView[];
  selectionSummary: TipSelectionSummary;
  playbooks: TipPlaybookView[];
  investment: TipInvestmentView;
  investmentInternal: TipInvestmentView;
  roadmapPhases: TipRoadmapPhaseView[];
  currentScore: number;
  projectedScore: number;
  assessmentName: string | null;
  clientName: string;
};

export type TipUpdatePayload = {
  currentStep?: TipWorkflowStep;
  wizardState?: Partial<TipWizardState>;
  executiveSummary?: string;
  title?: string;
};

export type TipAudience = "consultant" | "client" | "admin";

export function resolveTipAudience(role: UserRole): TipAudience {
  if (role === "admin") return "admin";
  if (role === "client") return "client";
  return "consultant";
}
