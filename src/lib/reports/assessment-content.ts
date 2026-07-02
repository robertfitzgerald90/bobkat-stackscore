import { formatAssessmentType } from "@/lib/assessments/display";
import { computeRoadmapScores, countByPriority, sortRecommendationsForDisplay } from "@/lib/pdf/report-helpers";
import type { AssessmentReportData } from "@/lib/pdf/types";
import { PRIORITY_LABELS, PRIORITY_ORDER } from "@/lib/pdf/types";
import { getRating, RATING_LABELS } from "@/lib/scoring";

const TARGET_SCORE = 80;

export type AssessmentReportRoadmapMilestone = {
  label: string;
  score: number;
  highlight: boolean;
  isTarget?: boolean;
};

export type AssessmentReportSections = {
  assessmentTypeLabel: string;
  clientRecommendations: AssessmentReportData["summary"]["recommendations"];
  sortedRecommendations: AssessmentReportData["summary"]["recommendations"];
  recommendationsByPriority: Array<{
    priority: AssessmentReportData["summary"]["recommendations"][number]["priority"];
    label: string;
    items: AssessmentReportData["summary"]["recommendations"];
  }>;
  roadmapMilestones: AssessmentReportRoadmapMilestone[];
  totalImpact: number;
  estimatedImprovement: number;
  criticalCount: number;
  highCount: number;
  overallRiskBullets: string[];
  strengthBullets: string[];
  riskBullets: string[];
  priorityBullets: string[];
  improvementBullets: string[];
  overviewBullets: string[];
};

/** Assembles executive-summary bullets, priority groupings, and roadmap milestones for PDF export. */
export function buildAssessmentReportSections(
  data: AssessmentReportData,
): AssessmentReportSections {
  const { summary, clientName, assessmentType, executiveSummary } = data;

  const clientRecommendations = summary.recommendations.filter(
    (recommendation) => recommendation.status !== "declined",
  );

  const sortedRecommendations = sortRecommendationsForDisplay(clientRecommendations);

  const recommendationsByPriority = PRIORITY_ORDER.map((priority) => ({
    priority,
    label: PRIORITY_LABELS[priority],
    items: sortedRecommendations.filter((recommendation) => recommendation.priority === priority),
  })).filter((group) => group.items.length > 0);

  const roadmap = computeRoadmapScores(summary.overallScore, summary.recommendations);
  const estimatedImprovement = summary.projectedScore - summary.overallScore;

  const overallRiskBullets = [
    `Overall StackScore: ${summary.overallScore} / 100 (${summary.overallRatingLabel})`,
    summary.hasCriticalExposure
      ? `${summary.criticalFindingsCount} critical security or recovery gap${
          summary.criticalFindingsCount === 1 ? "" : "s"
        } identified`
      : "No critical exposure flags were triggered in this assessment",
    `${summary.openRecommendationsCount} open recommendation${
      summary.openRecommendationsCount === 1 ? "" : "s"
    } requiring follow-up`,
  ];

  const strengthBullets = summary.topStrengths.map(
    (strength) =>
      `${strength.categoryName}: ${Math.round(strength.percentScore)}% (${RATING_LABELS[strength.rating]})`,
  );

  const riskBullets = summary.topRisks.map(
    (risk) => `${risk.categoryName}: ${Math.round(risk.percentScore)}% (${RATING_LABELS[risk.rating]})`,
  );

  const priorityBullets =
    summary.immediateActions.length > 0
      ? summary.immediateActions.map(
          (action) => `${action.title} (+${action.estimatedImpactPoints} pts)`,
        )
      : sortedRecommendations
          .slice(0, 3)
          .map((action) => `${action.title} (+${action.estimatedImpactPoints} pts)`);

  const improvementBullets = [
    `Current score: ${summary.overallScore} → Projected score: ${summary.projectedScore}`,
    `Estimated improvement: +${estimatedImprovement} point${
      estimatedImprovement === 1 ? "" : "s"
    } if recommendations are addressed`,
    `Target maturity threshold: ${TARGET_SCORE}+ StackScore`,
  ];

  const overviewBullets = executiveSummary
    ? executiveSummary
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
    : [
        `${clientName} was assessed across core technology maturity categories.`,
        `The current StackScore is ${summary.overallScore} with a projected score of ${summary.projectedScore} after remediation.`,
      ];

  const roadmapMilestones: AssessmentReportRoadmapMilestone[] = [
    { label: "Current StackScore", score: roadmap.current, highlight: false },
    { label: "After Critical Recommendations", score: roadmap.afterCritical, highlight: false },
    {
      label: "After Critical + High Recommendations",
      score: roadmap.afterCriticalAndHigh,
      highlight: true,
    },
    { label: "After All Recommendations", score: summary.projectedScore, highlight: false },
    { label: "Target Score", score: TARGET_SCORE, highlight: false, isTarget: true },
  ];

  return {
    assessmentTypeLabel: formatAssessmentType(assessmentType),
    clientRecommendations,
    sortedRecommendations,
    recommendationsByPriority,
    roadmapMilestones,
    totalImpact: clientRecommendations.reduce(
      (sum, recommendation) => sum + recommendation.estimatedImpactPoints,
      0,
    ),
    estimatedImprovement,
    criticalCount: countByPriority(summary.recommendations, "critical"),
    highCount: countByPriority(summary.recommendations, "high"),
    overallRiskBullets,
    strengthBullets,
    riskBullets,
    priorityBullets,
    improvementBullets,
    overviewBullets,
  };
}

export function getProjectedRatingLabel(score: number): string {
  return RATING_LABELS[getRating(score)];
}
