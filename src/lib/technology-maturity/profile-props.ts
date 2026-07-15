import type { TechnologyMaturityClassificationBadge } from "@/components/technology-maturity/technology-maturity-profile";
import type { TechnologyMaturityProfileProps } from "@/components/technology-maturity/technology-maturity-profile";
import { TREND_CONFIG } from "@/components/technology-profile/tp-constants";
import { RATING_LABELS, getRating } from "@/lib/scoring";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";

export function technologyMaturityProfilePropsFromDetail(
  detail: TechnologyProfileDetail,
): TechnologyMaturityProfileProps {
  const { profile, businessSnapshot, journeyScores, journey } = detail;
  const score = profile.overallStackScore;
  const rating = score !== null ? getRating(score) : null;

  const classificationBadges: TechnologyMaturityClassificationBadge[] = [];

  if (businessSnapshot.primaryBusinessGoalLabel !== "—") {
    classificationBadges.push({
      label: businessSnapshot.primaryBusinessGoalLabel,
      icon: "target",
      variant: "secondary",
    });
  }

  if (profile.maturityTierLabel) {
    classificationBadges.push({
      label: profile.maturityTierLabel,
      variant: "outline",
    });
  }

  if (profile.trendDirection) {
    classificationBadges.push({
      label: TREND_CONFIG[profile.trendDirection].label,
      icon: "trend",
      trendDirection: profile.trendDirection,
    });
  }

  return {
    score,
    statusLabel: rating ? RATING_LABELS[rating] : null,
    classificationBadges,
    organizationSummary: businessSnapshot.technologyVision,
    criticalExposureCount: profile.criticalExposureCount,
    showCriticalExposure: profile.riskSummary.criticalExposure,
    lastAssessedDate: profile.lastAssessedAt,
    pointsSincePreviousAssessment: journeyScores.scoreDeltaSincePrevious,
    nextAssessmentDate: profile.nextRecommendedAssessmentAt,
    hasAssessment: journey.assessmentsCompleted > 0,
  };
}
