/**
 * SS-REL-013 — Customer-facing assessment presentation
 *
 * Customer projections, narratives, and PDF payloads must use the same
 * client-deliverable recommendation set. Historical Assessment.executiveSummary
 * rows are never overwritten here; callers regenerate for display/export.
 */

import {
  buildAssessmentExecutiveSummary,
  type ExecutiveSummaryRecommendation,
} from "@/lib/assessments/executive-summary";
import {
  buildAssessmentResultsSummary,
  type AssessmentResultsSummary,
} from "@/lib/assessments/results-summary";
import type { AssessmentReportData } from "@/lib/pdf/types";
import { formatReportDate } from "@/lib/pdf/types";
import {
  filterClientDeliverableRecommendations,
  isClientFacingRecommendationAudience,
} from "@/lib/recommendations/visibility";
import { sortByRecommendationPriority } from "@/lib/recommendations/display";
import type { Priority, Rating, RecommendationStatus, UserRole } from "@/generated/prisma/client";

export type AudienceRecommendationInput = {
  id: string;
  title: string;
  description: string;
  businessImpact: string;
  suggestedService: string | null;
  priority: Priority;
  status: RecommendationStatus;
  estimatedImpactPoints: number;
  consolidationGroupId: string | null;
  categoryId: string;
  category: { name: string; code: string };
  project: { id: string } | null;
  recommendationTemplate?: { code: string } | null;
  templateCode?: string | null;
};

export type AudienceAssessmentPresentation = {
  summary: AssessmentResultsSummary;
  executiveSummary: string;
  recommendations: AudienceRecommendationInput[];
  usedCustomerSafeNarrative: boolean;
};

export function selectRecommendationsForAudience<T extends Record<string, unknown>>(
  recommendations: T[],
  role: UserRole,
): T[] {
  return filterClientDeliverableRecommendations(recommendations, role);
}

export function buildExecutiveSummaryFromResultsSummary(input: {
  clientName: string;
  summary: AssessmentResultsSummary;
  hasCriticalExposure: boolean;
}): string {
  const prioritized = sortByRecommendationPriority(
    input.summary.recommendations.filter(
      (recommendation) =>
        recommendation.status !== "declined" && recommendation.status !== "completed",
    ),
  ).slice(0, 5);

  const topRecommendations: ExecutiveSummaryRecommendation[] = prioritized.map((row) => ({
    title: row.title,
    priority: row.priority,
  }));

  return buildAssessmentExecutiveSummary({
    clientName: input.clientName,
    overallScore: input.summary.overallScore,
    overallRatingLabel: input.summary.overallRatingLabel,
    hasCriticalExposure: input.hasCriticalExposure,
    strengths: input.summary.topStrengths.map((row) => row.categoryName),
    risks: input.summary.topRisks.map((row) => row.categoryName),
    topRecommendations,
    projectedScore: input.summary.projectedScore,
  });
}

/**
 * Builds summary + narrative for a role without mutating persisted assessment rows.
 * Clients always get a regenerated customer-safe narrative from the filtered set.
 * Staff keep the stored narrative when present (historical consulting record).
 */
export function buildAudienceAssessmentPresentation(input: {
  role: UserRole;
  clientName: string;
  overallScore: number;
  hasCriticalExposure: boolean;
  criticalFindingsCount: number;
  categoryScores: Array<{
    categoryId: string;
    percentScore: unknown;
    rating: Rating;
    category: { name: string; code: string };
  }>;
  recommendations: AudienceRecommendationInput[];
  storedExecutiveSummary: string | null;
}): AudienceAssessmentPresentation {
  const recommendations = selectRecommendationsForAudience(
    input.recommendations as Array<AudienceRecommendationInput & Record<string, unknown>>,
    input.role,
  ) as AudienceRecommendationInput[];

  const summary = buildAssessmentResultsSummary(
    input.overallScore,
    input.hasCriticalExposure,
    input.criticalFindingsCount,
    input.categoryScores,
    recommendations,
  );

  const customerAudience = isClientFacingRecommendationAudience(input.role);
  const executiveSummary = customerAudience
    ? buildExecutiveSummaryFromResultsSummary({
        clientName: input.clientName,
        summary,
        hasCriticalExposure: input.hasCriticalExposure,
      })
    : input.storedExecutiveSummary?.trim()
      ? input.storedExecutiveSummary
      : buildExecutiveSummaryFromResultsSummary({
          clientName: input.clientName,
          summary,
          hasCriticalExposure: input.hasCriticalExposure,
        });

  return {
    summary,
    executiveSummary,
    recommendations,
    usedCustomerSafeNarrative: customerAudience || !input.storedExecutiveSummary?.trim(),
  };
}

export function buildAudienceAssessmentReportData(input: {
  role: UserRole;
  clientName: string;
  assessmentName: string;
  assessmentType: string;
  assessmentDate: Date | string;
  completedAt: string | null;
  overallScore: number;
  hasCriticalExposure: boolean;
  criticalFindingsCount: number;
  categoryScores: Array<{
    categoryId: string;
    percentScore: unknown;
    rating: Rating;
    category: { name: string; code: string };
  }>;
  recommendations: AudienceRecommendationInput[];
  storedExecutiveSummary: string | null;
}): AssessmentReportData {
  const presentation = buildAudienceAssessmentPresentation(input);
  const assessmentDateIso =
    input.assessmentDate instanceof Date
      ? input.assessmentDate.toISOString()
      : input.assessmentDate;

  return {
    clientName: input.clientName,
    assessmentName: input.assessmentName,
    assessmentType: input.assessmentType,
    assessmentDate: formatReportDate(assessmentDateIso),
    completedAt: input.completedAt,
    executiveSummary: presentation.executiveSummary,
    summary: presentation.summary,
  };
}

/** Client-deliverable filter for generated (pre-persist) recommendation rows. */
export function filterGeneratedRecommendationsForCustomer<
  T extends { title: string; templateCode: string },
>(recommendations: T[]): T[] {
  return filterClientDeliverableRecommendations(
    recommendations.map((row) => ({ ...row, recommendationTemplate: { code: row.templateCode } })),
    "client",
  ) as T[];
}
