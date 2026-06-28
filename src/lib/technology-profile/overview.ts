import type {
  ComplianceFramework,
  DocumentType,
  EnvironmentType,
  ItSupportModel,
  PrimaryBusinessGoal,
  UserRole,
} from "@/generated/prisma/client";
import { SCORE_HISTORY_CATEGORY_FIELDS } from "@/lib/analytics/categories";
import type { ScoreTrendPoint } from "@/lib/analytics/types";
import {
  aggregateV2CategoryScores,
  V1_TO_V2_CATEGORY,
  V2_CATEGORY_DISPLAY_ORDER,
  V2_CATEGORY_LABELS,
  type V2CategoryScore,
} from "@/lib/assessment-library/category-mapping";
import {
  formatComplianceFramework,
  formatEnvironmentType,
  formatItSupportModel,
  formatPrimaryBusinessGoal,
} from "@/lib/business-profile/labels";
import {
  getComplianceFieldGroup,
  parseComplianceDetails,
} from "@/lib/business-profile/compliance";
import type { ComplianceDetails } from "@/lib/business-profile/types";
import { computeRoadmapScores } from "@/lib/pdf/report-helpers";
import type { RecommendationSummary } from "@/lib/assessments/results-summary";
import type { CategoryScoreResult } from "@/lib/scoring";
import { getRating } from "@/lib/scoring";
import type { TipRoadmapPhaseView } from "@/lib/technology-improvement-plan/types";
import type {
  CategoryScoreInsight,
  NextRecommendedAction,
  ProfileBusinessSnapshot,
  ProfileCapabilities,
  ProfileDocumentSummary,
  RoadmapPhasePreview,
  TechnologyJourneyScores,
} from "@/lib/technology-profile/types";

type ScoreHistoryRow = {
  securityScore: unknown;
  backupScore: unknown;
  infrastructureScore: unknown;
  endpointScore: unknown;
  documentationScore: unknown;
  bcdrScore: unknown;
  strategicScore: unknown;
};

type RecommendationForOverview = {
  id: string;
  title: string;
  businessImpact: string;
  priority: RecommendationSummary["priority"];
  status: RecommendationSummary["status"];
  estimatedImpactPoints: number;
  categoryName: string;
  categoryCode: string;
  assessmentId: string;
};

type NextActionContext = {
  clientId: string;
  assessmentsCompleted: number;
  draftAssessmentId: string | null;
  openRecommendations: number;
  activeProjects: number;
  activeTipId: string | null;
  activeTipStep: string | null;
  nextRecommendedAssessmentAt: string | null;
  journeyPhase: "assess" | "improve" | "maintain";
};

export function resolveProfileCapabilities(role: UserRole): ProfileCapabilities {
  if (role === "client") {
    return {
      canEditBusinessProfile: false,
      canEditImprovementPlan: false,
      canViewPricing: false,
      canViewInternalDocuments: false,
    };
  }

  return {
    canEditBusinessProfile: true,
    canEditImprovementPlan: true,
    canViewPricing: role === "admin",
    canViewInternalDocuments: true,
  };
}

export function formatComplianceStatus(
  framework: ComplianceFramework | null | undefined,
  details: ComplianceDetails | null | undefined,
): string | null {
  if (!framework || framework === "none") return null;

  const parsed = details ?? {};
  const group = getComplianceFieldGroup(framework);

  switch (group) {
    case "cmmc_nist": {
      const target = parsed.targetCompliance?.trim();
      return target ? `Target: ${target}` : "Controls in progress";
    }
    case "iso_27001":
      if (parsed.certified === true) {
        return parsed.certificationDate
          ? `Certified · ${parsed.certificationDate}`
          : "Certified";
      }
      if (parsed.certified === false) return "Not certified";
      return "Certification status unknown";
    case "hipaa":
      if (parsed.hipaaProgramImplemented === true) return "HIPAA program active";
      if (parsed.hipaaProgramImplemented === false) return "HIPAA program not implemented";
      return "HIPAA status unknown";
    case "pci_dss":
      if (parsed.pciCompliant === true) return "PCI compliant";
      if (parsed.pciCompliant === false) return "Not PCI compliant";
      return "PCI status unknown";
    default:
      return formatComplianceFramework(framework);
  }
}

export function buildBusinessSnapshot(input: {
  industry: string | null;
  employeeCount: number | null;
  numberOfLocations: number | null;
  primaryBusinessGoal: PrimaryBusinessGoal | null;
  technologyVision: string | null;
  itSupportModel: ItSupportModel | null;
  environmentType: EnvironmentType | null;
  complianceFramework: ComplianceFramework | null;
  complianceDetails: unknown;
  primaryContactName: string;
  primaryContactTitle: string | null;
  primaryContactEmail: string;
  primaryContactPhone: string | null;
}): ProfileBusinessSnapshot {
  const complianceDetails = parseComplianceDetails(input.complianceDetails);

  return {
    industry: input.industry,
    employeeCount: input.employeeCount,
    numberOfLocations: input.numberOfLocations,
    primaryBusinessGoal: input.primaryBusinessGoal,
    primaryBusinessGoalLabel: formatPrimaryBusinessGoal(input.primaryBusinessGoal),
    technologyVision: input.technologyVision,
    itSupportModel: input.itSupportModel,
    itSupportModelLabel: formatItSupportModel(input.itSupportModel),
    environmentType: input.environmentType,
    environmentTypeLabel: formatEnvironmentType(input.environmentType),
    complianceFramework: input.complianceFramework,
    complianceFrameworkLabel: formatComplianceFramework(input.complianceFramework),
    complianceStatus: formatComplianceStatus(input.complianceFramework, complianceDetails),
    primaryContactName: input.primaryContactName,
    primaryContactTitle: input.primaryContactTitle,
    primaryContactEmail: input.primaryContactEmail,
    primaryContactPhone: input.primaryContactPhone,
  };
}

function historyRowToV1Scores(row: ScoreHistoryRow): CategoryScoreResult[] {
  return SCORE_HISTORY_CATEGORY_FIELDS.flatMap((category) => {
    const percentScore = roundScore(row[category.field as keyof ScoreHistoryRow]);
    if (percentScore === null) return [];

    return [
      {
        categoryId: category.code,
        categoryCode: category.code,
        categoryName: category.label,
        pointsEarned: percentScore,
        pointsPossible: 100,
        percentScore,
        rating: getRating(percentScore),
        weightedContribution: 0,
      },
    ];
  });
}

function roundScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Math.round(Number(value));
}

function v2ScoresFromHistoryRow(row: ScoreHistoryRow): Map<string, number> {
  const v1Scores = historyRowToV1Scores(row);
  const v2Scores = aggregateV2CategoryScores(v1Scores);
  return new Map(v2Scores.map((score) => [score.categoryCode, score.percentScore]));
}

export function computeScoreDeltaSincePrevious(scoreTrend: ScoreTrendPoint[]): number | null {
  if (scoreTrend.length < 2) return null;
  const previous = scoreTrend.at(-2)!.overallScore;
  const current = scoreTrend.at(-1)!.overallScore;
  return current - previous;
}

export function computeJourneyScores(input: {
  scoreTrend: ScoreTrendPoint[];
  currentScore: number | null;
  projectedScore: number | null;
  longTermTargetScore: number | null;
}): TechnologyJourneyScores {
  const initialScore = input.scoreTrend[0]?.overallScore ?? null;
  const currentScore = input.currentScore ?? input.scoreTrend.at(-1)?.overallScore ?? null;

  return {
    initialScore,
    currentScore,
    projectedScore: input.projectedScore,
    longTermTargetScore: input.longTermTargetScore,
    scoreDeltaSincePrevious: computeScoreDeltaSincePrevious(input.scoreTrend),
    scoreDeltaSinceInitial:
      initialScore !== null && currentScore !== null ? currentScore - initialScore : null,
  };
}

export function countRecommendationsByV2Category(
  recommendations: Array<{ categoryCode: string }>,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const code of V2_CATEGORY_DISPLAY_ORDER) {
    counts[code] = 0;
  }

  for (const recommendation of recommendations) {
    const v2Code = V1_TO_V2_CATEGORY[recommendation.categoryCode] ?? recommendation.categoryCode;
    counts[v2Code] = (counts[v2Code] ?? 0) + 1;
  }

  return counts;
}

export function buildCategoryInsights(input: {
  categoryScores: V2CategoryScore[];
  scoreHistory: ScoreHistoryRow[];
  openRecommendations: Array<{ categoryCode: string }>;
}): CategoryScoreInsight[] {
  const currentByCode = new Map(
    input.categoryScores.map((score) => [score.categoryCode, score]),
  );
  const recCounts = countRecommendationsByV2Category(input.openRecommendations);

  const previousV2 =
    input.scoreHistory.length >= 2
      ? v2ScoresFromHistoryRow(input.scoreHistory.at(-2)!)
      : null;
  const currentV2 =
    input.scoreHistory.length >= 1
      ? v2ScoresFromHistoryRow(input.scoreHistory.at(-1)!)
      : null;

  return V2_CATEGORY_DISPLAY_ORDER.map((categoryCode) => {
    const current = currentByCode.get(categoryCode);
    const previousScore = previousV2?.get(categoryCode) ?? null;
    const currentFromHistory = currentV2?.get(categoryCode) ?? current?.percentScore ?? null;
    const trendDelta =
      previousScore !== null && currentFromHistory !== null
        ? Math.round(currentFromHistory - previousScore)
        : null;

    return {
      categoryCode,
      categoryName: V2_CATEGORY_LABELS[categoryCode] ?? categoryCode,
      percentScore: current?.percentScore ?? null,
      maturityTier: current?.maturityTier ?? null,
      trendDelta,
      openRecommendationCount: recCounts[categoryCode] ?? 0,
    };
  });
}

export function projectScoreFromRecommendations(
  currentScore: number | null,
  recommendations: RecommendationForOverview[],
): number | null {
  if (currentScore === null || recommendations.length === 0) return null;

  const summaries: RecommendationSummary[] = recommendations.map((recommendation) => ({
    id: recommendation.id,
    title: recommendation.title,
    description: "",
    businessImpact: recommendation.businessImpact,
    suggestedService: null,
    priority: recommendation.priority,
    status: recommendation.status,
    estimatedImpactPoints: recommendation.estimatedImpactPoints,
    categoryId: recommendation.categoryCode,
    categoryName: recommendation.categoryName,
    consolidationGroupId: null,
    hasProject: false,
    projectId: null,
  }));

  return computeRoadmapScores(currentScore, summaries).afterAll;
}

export function buildRoadmapPreview(phases: TipRoadmapPhaseView[]): RoadmapPhasePreview[] {
  return phases.map((phase) => ({
    id: phase.id,
    label: phase.label,
    projectedScore: phase.projectedScore,
    recommendationCount: phase.recommendations.length,
  }));
}

export function deriveNextRecommendedAction(context: NextActionContext): NextRecommendedAction {
  const { clientId } = context;

  if (context.draftAssessmentId) {
    return {
      label: "Complete assessment",
      description: "Finish the in-progress assessment to update this Technology Profile.",
      href: `/assessments/${context.draftAssessmentId}`,
      kind: "assessment",
    };
  }

  if (context.assessmentsCompleted === 0) {
    return {
      label: "Start initial assessment",
      description: "Establish the baseline StackScore and recommendations for this client.",
      href: `/clients/${clientId}`,
      kind: "assessment",
    };
  }

  if (context.activeTipId && context.activeTipStep !== "complete") {
    return {
      label: "Continue Improvement Plan",
      description: "Finalize recommendations, roadmap, and client-ready deliverables.",
      href: `/clients/${clientId}/improvement-plan/${context.activeTipId}`,
      kind: "tip",
    };
  }

  if (context.openRecommendations > 0) {
    return {
      label: "Review open opportunities",
      description: "Prioritize recommendations and build a Technology Improvement Plan.",
      href: `/clients/${clientId}/improvement-plan`,
      kind: "recommendations",
    };
  }

  if (context.nextRecommendedAssessmentAt) {
    const dueAt = new Date(context.nextRecommendedAssessmentAt);
    if (dueAt.getTime() <= Date.now()) {
      return {
        label: "Schedule reassessment",
        description: "The recommended reassessment window has arrived.",
        href: `/clients/${clientId}`,
        kind: "reassessment",
      };
    }
  }

  if (context.activeProjects > 0) {
    return {
      label: "Track active projects",
      description: "Monitor in-flight improvements delivering profile impact.",
      href: `/projects`,
      kind: "projects",
    };
  }

  if (context.journeyPhase === "maintain") {
    return {
      label: "Plan next reassessment",
      description: "Maintain momentum with a follow-up assessment when the client is ready.",
      href: `/clients/${clientId}`,
      kind: "reassessment",
    };
  }

  return {
    label: "Complete business profile",
    description: "Add business context to sharpen recommendations and planning.",
    href: `/clients/${clientId}/business-profile`,
    kind: "business_profile",
  };
}

export function buildProfileDocuments(input: {
  clientId: string;
  currentAssessmentId: string | null;
  lastAssessedAt: string | null;
  documents: Array<{
    id: string;
    title: string;
    documentType: DocumentType;
    createdAt: Date;
    assessmentId: string | null;
    tipId: string | null;
    qbrId: string | null;
    fileUrl: string;
  }>;
}): ProfileDocumentSummary[] {
  const rows: ProfileDocumentSummary[] = [];

  if (input.currentAssessmentId) {
    rows.push({
      id: `assessment-report-${input.currentAssessmentId}`,
      title: "Latest Assessment Report",
      documentType: "report",
      createdAt: input.lastAssessedAt ?? new Date().toISOString(),
      assessmentId: input.currentAssessmentId,
      tipId: null,
      qbrId: null,
      downloadHref: `/api/v1/assessments/${input.currentAssessmentId}/export/pdf`,
    });
  }

  for (const document of input.documents) {
    rows.push({
      id: document.id,
      title: document.title,
      documentType: document.documentType,
      createdAt: document.createdAt.toISOString(),
      assessmentId: document.assessmentId,
      tipId: document.tipId,
      qbrId: document.qbrId,
      downloadHref:
        document.documentType === "quarterly_business_review" && document.qbrId
          ? document.fileUrl || `/clients/${input.clientId}/quarterly-review/${document.qbrId}`
          : document.documentType === "technology_improvement_plan" && document.tipId
            ? `/api/v1/clients/${input.clientId}/tip/${document.tipId}/pdf`
            : document.assessmentId
              ? `/api/v1/assessments/${document.assessmentId}/export/pdf`
              : null,
    });
  }

  return rows;
}
