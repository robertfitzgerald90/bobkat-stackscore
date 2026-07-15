import type { JourneyProgressSummaryProps } from "@/components/technology-journey/journey-progress-summary";

/** Static demo data for public marketing previews — never loaded from the database. */
export const technologyProgressSummaryDemoData: JourneyProgressSummaryProps = {
  stage: "Improve",
  milestonePercent: 33,
  initialScore: 37,
  currentScore: 53,
  projectedScore: 84,
  targetScore: 84,
  pointsImproved: 16,
  assessmentCount: 2,
  openRecommendationCount: 7,
  activeProjectCount: 4,
  completedCount: 0,
  hasAssessment: true,
  readOnly: true,
};
