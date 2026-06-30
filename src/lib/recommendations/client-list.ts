import type {
  Priority,
  ProjectStatus,
  RecommendationStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { ACTIVE_RECOMMENDATION_STATUSES } from "@/lib/recommendations/dedupe";

export type ClientRecommendationFilters = {
  pillarCode?: string;
  priority?: Priority;
  status?: RecommendationStatus;
  hasProject?: "yes" | "no";
};

export type ClientRecommendationRow = {
  id: string;
  title: string;
  description: string;
  businessImpact: string;
  suggestedService: string | null;
  priority: Priority;
  status: RecommendationStatus;
  estimatedImpactPoints: number;
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  templateCode: string | null;
  assessmentId: string;
  latestAssessmentId: string;
  latestAssessmentName: string | null;
  latestTriggerReason: string | null;
  triggeredInLatestAssessment: boolean;
  isRecurrence: boolean;
  recurrenceCount: number;
  createdAt: string;
  lastTriggeredAt: string;
  project: {
    id: string;
    title: string;
    status: ProjectStatus;
  } | null;
};

const recommendationInclude = {
  category: { select: { id: true, name: true, code: true } },
  recommendationTemplate: { select: { code: true } },
  latestAssessment: { select: { assessmentName: true } },
  project: { select: { id: true, title: true, status: true } },
} as const;

function serializeRecommendation(
  recommendation: Awaited<
    ReturnType<typeof prisma.assessmentRecommendation.findMany>
  >[number] & {
    category: { id: string; name: string; code: string };
    recommendationTemplate: { code: string } | null;
    latestAssessment: { assessmentName: string };
    project: { id: string; title: string; status: ProjectStatus } | null;
  },
): ClientRecommendationRow {
  return {
    id: recommendation.id,
    title: recommendation.title,
    description: recommendation.description,
    businessImpact: recommendation.businessImpact,
    suggestedService: recommendation.suggestedService,
    priority: recommendation.priority,
    status: recommendation.status,
    estimatedImpactPoints: recommendation.estimatedImpactPoints,
    categoryId: recommendation.categoryId,
    categoryName: recommendation.category.name,
    categoryCode: recommendation.category.code,
    templateCode: recommendation.recommendationTemplate?.code ?? null,
    assessmentId: recommendation.assessmentId,
    latestAssessmentId: recommendation.latestAssessmentId,
    latestAssessmentName: recommendation.latestAssessment.assessmentName,
    latestTriggerReason: recommendation.latestTriggerReason,
    triggeredInLatestAssessment: recommendation.triggeredInLatestAssessment,
    isRecurrence: recommendation.isRecurrence,
    recurrenceCount: recommendation.recurrenceCount,
    createdAt: recommendation.createdAt.toISOString(),
    lastTriggeredAt: recommendation.lastTriggeredAt.toISOString(),
    project: recommendation.project,
  };
}

export async function getClientRecommendations(
  clientId: string,
  filters: ClientRecommendationFilters = {},
): Promise<ClientRecommendationRow[]> {
  const statusFilter = filters.status
    ? [filters.status]
    : [...ACTIVE_RECOMMENDATION_STATUSES];

  const recommendations = await prisma.assessmentRecommendation.findMany({
    where: {
      clientId,
      status: { in: statusFilter },
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.pillarCode ? { category: { code: filters.pillarCode } } : {}),
      ...(filters.hasProject === "yes" ? { project: { isNot: null } } : {}),
      ...(filters.hasProject === "no" ? { project: { is: null } } : {}),
    },
    orderBy: [{ priority: "asc" }, { estimatedImpactPoints: "desc" }, { createdAt: "asc" }],
    include: recommendationInclude,
  });

  return recommendations.map(serializeRecommendation);
}

export function mapToProfileRecommendationSummary(
  row: ClientRecommendationRow,
): import("@/lib/technology-profile/types").ProfileRecommendationSummary {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    estimatedImpactPoints: row.estimatedImpactPoints,
    businessImpact: row.businessImpact,
    categoryName: row.categoryName,
    categoryCode: row.categoryCode,
    categoryId: row.categoryId,
    assessmentId: row.assessmentId,
    latestAssessmentId: row.latestAssessmentId,
    latestAssessmentName: row.latestAssessmentName,
    latestTriggerReason: row.latestTriggerReason,
    triggeredInLatestAssessment: row.triggeredInLatestAssessment,
    isRecurrence: row.isRecurrence,
    recurrenceCount: row.recurrenceCount,
    createdAt: row.createdAt,
    lastTriggeredAt: row.lastTriggeredAt,
    templateCode: row.templateCode,
    suggestedService: row.suggestedService,
    project: row.project,
  };
}
